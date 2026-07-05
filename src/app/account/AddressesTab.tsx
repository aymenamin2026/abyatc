"use client";

import { useState, useEffect } from "react";
import { fetchCustomerAddresses, createCustomerAddress, updateCustomerAddress, deleteCustomerAddress, fetchCountries, fetchZones, fetchSettings } from "@/lib/api";
import { t } from "@/lib/translations";
import { Combobox } from '@headlessui/react';
import { Check, ChevronRight, MapPin, Plus } from 'lucide-react';
import MapPickerModal from "@/components/MapPickerModal";

export default function AddressesTab({ lang, user }: { lang: "en" | "ar", user: any }) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [isDeletingAddress, setIsDeletingAddress] = useState<number | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);

  const [countries, setCountries] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [defaultCountryId, setDefaultCountryId] = useState<string>("");

  const [countryQuery, setCountryQuery] = useState('');
  const [zoneQuery, setZoneQuery] = useState('');

  const filteredCountries = countryQuery === '' ? countries : countries.filter((country) => country.name.toLowerCase().includes(countryQuery.toLowerCase()));
  const filteredZones = zoneQuery === '' ? zones : zones.filter((zone) => zone.name.toLowerCase().includes(zoneQuery.toLowerCase()));

  const [newAddress, setNewAddress] = useState({
    first_name: "", last_name: "", address_1: "", address_2: "", city: "", postcode: "", state: "", country_id: "", zone_id: "", latitude: "", longitude: "", is_default: false, address_type: "home"
  });

  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");

  useEffect(() => {
    async function init() {
      try {
        const [userAddresses, countriesData, settings] = await Promise.all([
          fetchCustomerAddresses(),
          fetchCountries(),
          fetchSettings()
        ]);
        setAddresses(userAddresses || []);
        if (countriesData) setCountries(countriesData);

        // Auto-set default country from admin settings
        if (settings?.default_country_id) {
          const defaultId = settings.default_country_id.toString();
          setDefaultCountryId(defaultId);
          setNewAddress(prev => ({ ...prev, country_id: defaultId }));
          // Pre-fetch zones for the default country
          const defaultZones = await fetchZones(defaultId);
          if (defaultZones?.length) setZones(defaultZones);
        }
      } catch (err) { } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleEditAddressClick = async (addr: any) => {
    setAddressError("");
    setEditingAddressId(addr.id);
    setIsAddingNewAddress(true);
    setNewAddress({
      first_name: addr.first_name || "", last_name: addr.last_name || "",
      address_1: addr.address_1 || "", address_2: addr.address_2 || "",
      city: addr.city || "", postcode: addr.postcode || "",
      state: addr.state || "", country_id: addr.country_id?.toString() || "",
      zone_id: addr.zone_id?.toString() || "", latitude: addr.latitude || "",
      longitude: addr.longitude || "", is_default: addr.is_default || false,
      address_type: addr.address_type || "home"
    });

    if (addr.country_id) {
      try {
        const fetchedZones = await fetchZones(addr.country_id);
        setZones(fetchedZones);
      } catch (e) { }
    }
  };

  const confirmDeleteAddress = async (id: number) => {
    setIsDeletingAddress(id);
    try {
      await deleteCustomerAddress(id);
      const userAddresses = await fetchCustomerAddresses();
      setAddresses(userAddresses || []);
      setAddressToDelete(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete address');
    } finally {
      setIsDeletingAddress(null);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError("");
    setIsSavingAddress(true);
    try {
      if (editingAddressId) {
        await updateCustomerAddress(editingAddressId, newAddress);
      } else {
        await createCustomerAddress(newAddress);
      }

      const userAddresses = await fetchCustomerAddresses();
      setAddresses(userAddresses || []);

      setIsAddingNewAddress(false);
      setEditingAddressId(null);
      setNewAddress({ first_name: "", last_name: "", address_1: "", address_2: "", city: "", postcode: "", state: "", country_id: "", zone_id: "", latitude: "", longitude: "", is_default: false, address_type: "home" });
    } catch (err: any) {
      setAddressError(err.message);
    } finally {
      setIsSavingAddress(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-background">
        <h2 className="font-serif text-2xl font-bold text-foreground">{t("my_addresses", lang)}</h2>

        {!isAddingNewAddress && (
          <button
            onClick={() => {
              setIsAddingNewAddress(true);
              setEditingAddressId(null);
              setNewAddress({ first_name: user?.first_name || "", last_name: user?.last_name || "", address_1: "", address_2: "", city: "", postcode: "", state: "", country_id: "", zone_id: "", latitude: "", longitude: "", is_default: false, address_type: "home" });
            }}
            // 👈 تم استخدام bg-[#fbc70f] وتغيير النص إلى الأسود، مع إضافة تأثير hover أغمق قليلاً بنسبة 5%
            className="flex items-center gap-2 bg-[#fbc70f] text-black px-4 py-2.5 rounded-xl text-sm font-medium hover:brightness-95 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> {t('add_new_address', lang)}
          </button>
        )}
      </div>

      {/* List Existing Addresses */}
      {!isAddingNewAddress && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.length === 0 ? (
            <div className="col-span-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center">
              <MapPin className="w-10 h-10 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground font-medium mb-1">{t('no_addresses', lang)}</p>
              <p className="text-sm text-muted-foreground/70 mb-4">{t('no_addresses_desc', lang)}</p>
            </div>
          ) : (
            addresses.map(addr => (
              // 👈 1. تم تعديل حواف الكارت عند التمرير لتصبح صفراء بدلاً من التداخل القديم: hover:border-[#fbc70f]/50
              <div key={addr.id} className="border border-border rounded-2xl p-5 hover:border-[#fbc70f]/50 transition-colors bg-secondary/5 relative">
                {addr.is_default && (
                  // 👈 2. تم تعديل شارة "افتراضي" لتصبح بخلفية صفراء خفيفة ونص أصفر ذهبي متناسق
                  <span className="absolute top-4 end-4 bg-[#fbc70f]/10 text-[#e2b20d] text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded">{t('default', lang)}</span>
                )}
                <div className="flex items-center gap-2 mb-2 text-foreground font-semibold">
                  {/* 👈 3. تم تعديل أيقونة الخريطة للمنزل لتأخذ لونك الأصفر المميز text-[#fbc70f] */}
                  {addr.address_type === 'home' && <MapPin className="w-4 h-4 text-[#fbc70f]" />}
                  {addr.address_type === 'office' && <MapPin className="w-4 h-4 text-blue-500" />}
                  {addr.address_type === 'other' && <MapPin className="w-4 h-4 text-green-500" />}
                  <span className="capitalize">{addr.address_type === 'home' ? (lang === 'ar' ? 'منزل' : 'Home') : addr.address_type === 'office' ? (lang === 'ar' ? 'عمل' : 'Office') : (lang === 'ar' ? 'آخر' : 'Other')} {t('address', lang)}</span>
                </div>
                <div className="text-foreground font-medium mb-1">{addr.first_name} {addr.last_name}</div>
                <div className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {addr.address_1} {addr.address_2 && `, ${addr.address_2}`}<br />
                  {addr.city}, {addr.state} {addr.postcode}
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  {/* 👈 4. تم تعديل زر "تعديل" النصي ليصبح باللون الأصفر وعند التمرير يغمق بنعومة text-[#fbc70f] hover:text-[#e2b20d] */}
                  <button onClick={() => handleEditAddressClick(addr)} className="text-sm font-medium text-[#fbc70f] hover:text-[#e2b20d] transition-colors">{t('edit', lang)}</button>
                  <span className="w-1 h-1 rounded-full bg-border"></span>
                  <button onClick={() => setAddressToDelete(addr.id)} className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
                    {t('delete', lang)}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add / Edit Form */}
      {isAddingNewAddress && (
        <div className="bg-secondary/10 border border-border p-6 rounded-2xl max-w-3xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-xl font-bold text-foreground">
              {editingAddressId ? t('edit_address', lang) : t('add_new_address', lang)}
            </h3>
            <button onClick={() => { setIsAddingNewAddress(false); setEditingAddressId(null); }} className="text-sm text-muted-foreground hover:text-foreground hover:underline">{t('cancel', lang)}</button>
          </div>

          <div className="space-y-4">
            {addressError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                {addressError}
              </div>
            )}

            <div className="flex bg-background border border-border rounded-lg p-1 w-full max-w-sm mb-6">
              {['home', 'office', 'other'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setNewAddress({ ...newAddress, address_type: type })}
                  className={`flex-1 py-2 text-sm text-center rounded-md font-medium capitalize transition-all ${newAddress.address_type === type ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {type === 'home' ? (lang === 'ar' ? 'منزل' : 'Home') : type === 'office' ? (lang === 'ar' ? 'عمل' : 'Office') : (lang === 'ar' ? 'آخر' : 'Other')}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input type="text" placeholder={t('first_name', lang)} value={newAddress.first_name} onChange={e => setNewAddress({ ...newAddress, first_name: e.target.value })} className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background" />
              </div>
              <div>
                <input type="text" placeholder={t('last_name', lang)} value={newAddress.last_name} onChange={e => setNewAddress({ ...newAddress, last_name: e.target.value })} className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background" />
              </div>
              <div className="md:col-span-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input type="text" placeholder={t('address', lang)} value={newAddress.address_1} onChange={e => setNewAddress({ ...newAddress, address_1: e.target.value })} className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMapModal(true)}
                    className="px-4 border border-border rounded-xl hover:bg-secondary transition-colors text-primary flex items-center justify-center shrink-0"
                    title="Pick from map"
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="md:col-span-2">
                <input type="text" placeholder={lang === 'ar' ? 'رقم الشقة، الجناح، إلخ (اختياري)' : 'Apartment, suite, etc. (optional)'} value={newAddress.address_2} onChange={e => setNewAddress({ ...newAddress, address_2: e.target.value })} className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background" />
              </div>

              {/* Hidden input for country */}
              <input type="hidden" name="country_id" value={newAddress.country_id} />

              {/* Only show country picker when no store-level default is set */}
              {!defaultCountryId && (
                <div className="md:col-span-2 relative z-50">
                  <Combobox value={newAddress.country_id || ""} onChange={async (val) => {
                    setNewAddress({ ...newAddress, country_id: val || '', zone_id: '', state: '' });
                    if (val) {
                      const fetchedZones = await fetchZones(val);
                      setZones(fetchedZones);
                    } else {
                      setZones([]);
                    }
                  }}>
                    <div className="relative">
                      <Combobox.Input
                        className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground"
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setCountryQuery(event.target.value)}
                        displayValue={(countryId: string) => countries.find((c: any) => c.id.toString() === countryId)?.name || ''}
                        placeholder={lang === 'ar' ? 'اختر الدولة' : 'Select Country'}
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </Combobox.Button>
                    </div>
                    <Combobox.Options className="absolute z-[100] mt-1 max-h-60 w-full overflow-y-auto rounded-xl bg-background border border-border py-1 text-base shadow-lg focus:outline-none sm:text-sm">
                      {filteredCountries.length === 0 && countryQuery !== '' ? (
                        <div className="relative cursor-default select-none py-2 px-4 text-gray-700">{lang === 'ar' ? 'لا يوجد نتائج' : 'Nothing found.'}</div>
                      ) : (
                        filteredCountries.map((country) => (
                          <Combobox.Option
                            key={country.id}
                            className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-primary/10 text-primary' : 'text-foreground'}`}
                            value={country.id.toString()}
                          >
                            {({ selected, active }) => (
                              <>
                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{country.name}</span>
                                {selected ? (<span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-primary' : 'text-primary'}`}><Check className="h-5 w-5" /></span>) : null}
                              </>
                            )}
                          </Combobox.Option>
                        ))
                      )}
                    </Combobox.Options>
                  </Combobox>
                </div>
              )}

              <div>
                <input type="text" placeholder={t('city', lang)} value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative z-50">
                  <Combobox value={newAddress.zone_id || ""} onChange={(val) => {
                    const selectedZone = zones.find(z => z.id.toString() === val);
                    setNewAddress({ ...newAddress, zone_id: val || '', state: selectedZone ? selectedZone.name : '' });
                  }} disabled={zones.length === 0}>
                    <div className="relative">
                      <Combobox.Input
                        className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground disabled:opacity-50"
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setZoneQuery(event.target.value)}
                        displayValue={(zoneId: string) => zones.find((z) => z.id.toString() === zoneId)?.name || ''}
                        placeholder={lang === 'ar' ? 'اختر المنطقة' : 'Select State / Zone'}
                      />
                      <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2" disabled={zones.length === 0}>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </Combobox.Button>
                    </div>
                    <Combobox.Options className="absolute z-[100] mt-1 max-h-60 w-full overflow-y-auto rounded-xl bg-background border border-border py-1 text-base shadow-lg focus:outline-none sm:text-sm">
                      {filteredZones.length === 0 && zoneQuery !== '' ? (
                        <div className="relative cursor-default select-none py-2 px-4 text-gray-700">{lang === 'ar' ? 'لا يوجد نتائج' : 'Nothing found.'}</div>
                      ) : (
                        filteredZones.map((zone) => (
                          <Combobox.Option
                            key={zone.id}
                            className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-primary/10 text-primary' : 'text-foreground'}`}
                            value={zone.id.toString()}
                          >
                            {({ selected, active }) => (
                              <>
                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{zone.name}</span>
                                {selected ? (<span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-primary' : 'text-primary'}`}><Check className="h-5 w-5" /></span>) : null}
                              </>
                            )}
                          </Combobox.Option>
                        ))
                      )}
                    </Combobox.Options>
                  </Combobox>
                </div>
                <input type="text" placeholder={t('zip_code', lang)} value={newAddress.postcode} onChange={e => setNewAddress({ ...newAddress, postcode: e.target.value })} className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background" />
              </div>

              <div className="md:col-span-2 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group w-fit">
                  <button type="button" onClick={() => setNewAddress({ ...newAddress, is_default: !newAddress.is_default })} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ring-2 ring-transparent focus:ring-primary/50 ${newAddress.is_default ? 'bg-primary' : 'bg-secondary'}`}>
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${newAddress.is_default ? 'translate-x-full' : 'translate-x-0'}`}></span>
                  </button>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{t('set_as_default', lang)}</span>
                </label>
              </div>

              <div className="md:col-span-2 pt-6 flex justify-end gap-3 border-t border-border mt-2">
                <button
                  type="button"
                  onClick={() => { setIsAddingNewAddress(false); setEditingAddressId(null); }}
                  className="px-6 py-2.5 rounded-xl font-medium text-muted-foreground hover:bg-secondary transition-colors"
                >
                  {t('cancel', lang)}
                </button>
                <button
                  type="button"
                  onClick={handleSaveAddress}
                  disabled={isSavingAddress || !newAddress.first_name || !newAddress.last_name || !newAddress.address_1 || !newAddress.city || !newAddress.postcode || !newAddress.country_id}
                  // 👈 تم التعديل هنا: استخدام نفس الخلفية الصفراء والنص الأسود والتمرير الذكي الناعم
                  className="bg-[#fbc70f] text-black px-8 py-2.5 rounded-xl font-medium hover:brightness-95 transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isSavingAddress ? t('saving', lang) : (editingAddressId ? t('update_address', lang) : t('save_address', lang))}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <MapPickerModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        initialLat={newAddress.latitude}
        initialLng={newAddress.longitude}
        onAddressSelect={async (data) => {
          // Always use the admin-configured default country if set (e.g. Saudi Arabia)
          let determinedCountryId = defaultCountryId || newAddress.country_id;
          let determinedZoneId = newAddress.zone_id;
          let determinedStateName = data.state || newAddress.state;

          if (defaultCountryId && data.state && zones.length > 0) {
            const matchedZone = zones.find((z: any) =>
              z.name.toLowerCase().includes(data.state.toLowerCase()) ||
              data.state.toLowerCase().includes(z.name.toLowerCase())
            );
            if (matchedZone) {
              determinedZoneId = matchedZone.id.toString();
              determinedStateName = matchedZone.name;
            }
          }

          setNewAddress({
            ...newAddress,
            latitude: data.latitude,
            longitude: data.longitude,
            address_1: data.address_1 || newAddress.address_1,
            city: data.city || newAddress.city,
            postcode: data.postcode || newAddress.postcode,
            country_id: determinedCountryId,
            zone_id: determinedZoneId,
            state: determinedStateName
          });
        }}
      />

      {/* Delete Address Warning Modal */}
      {addressToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-foreground mb-3 font-serif">{lang === 'ar' ? 'حذف العنوان' : 'Delete Address'}</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">{t('confirm_delete_addr', lang)}</p>

            <div className="flex gap-3">
              <button
                onClick={() => setAddressToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border font-medium text-foreground hover:bg-secondary transition-colors"
                disabled={isDeletingAddress !== null}
              >
                {t('cancel', lang)}
              </button>
              <button
                onClick={() => addressToDelete && confirmDeleteAddress(addressToDelete)}
                disabled={isDeletingAddress !== null}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeletingAddress !== null ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {lang === 'ar' ? 'جاري الحذف...' : 'Deleting...'}
                  </>
                ) : t('delete', lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

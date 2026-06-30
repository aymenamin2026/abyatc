"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, ChevronRight, Lock, CreditCard, Mail, User } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { fetchPaymentMethods, fetchSettings, fetchCustomerAddresses, authLogin, authRegister, createCustomerAddress, updateCustomerAddress, deleteCustomerAddress, fetchCountries, fetchZones, initiateMyFatoorahPayment, cancelOrderOnBackend } from "@/lib/api";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageContext";
import { useAuth } from "@/components/AuthContext";
import { t } from "@/lib/translations";
import { useCart } from "@/components/CartContext";
import MapPickerModal from "@/components/MapPickerModal";
import { Combobox } from '@headlessui/react';
import { Check, Truck } from 'lucide-react';
import { fetchShippingRates } from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";

const cartItems = [
  {
    id: "1",
    name: "Classic V-Neck Scrub Top",
    color: "Navy",
    size: "M",
    price: 34.99,
    quantity: 2,
    image: "/no-image.jpg",
  },
  {
    id: "2",
    name: "Performance Scrub Pants",
    color: "Navy",
    size: "M",
    price: 39.99,
    quantity: 2,
    image: "/no-image.jpg",
  }
];

export default function Checkout() {
  const { lang } = useLanguage();
  const { user, token, login } = useAuth();
  const { items: cartItems, syncCart, isLoading: isCartLoading, appliedCoupon, setAppliedCoupon } = useCart();
  const { resolvedTheme } = useTheme();

  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [siteName, setSiteName] = useState("Luluh.sa");
  const [settings, setSettings] = useState<any>(null);

  // Custom logic to swap riyal SVG based on theme
  const getCurrencySymbol = () => {
    if (typeof currencySymbol === 'string' && (currencySymbol.includes('riyal-dark.svg') || currencySymbol.includes('riyal-light.svg'))) {
      return resolvedTheme === 'dark' ? '/riyal-light.svg' : '/riyal-dark.svg';
    }
    return currencySymbol;
  };
  const finalCurrencySymbol = getCurrencySymbol();

  const [taxRate, setTaxRate] = useState<number>(15);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [pricesIncludeTax, setPricesIncludeTax] = useState<boolean>(true);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [isDeletingAddress, setIsDeletingAddress] = useState<number | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null);
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState("");

  const [shippingRates, setShippingRates] = useState<any[]>([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(false);

  const [countries, setCountries] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState("+966");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [zones, setZones] = useState<any[]>([]);
  const [defaultCountryId, setDefaultCountryId] = useState<string>("");

  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [countryQuery, setCountryQuery] = useState('');
  const [zoneQuery, setZoneQuery] = useState('');

  useEffect(() => {
    const loadCountriesData = async () => {
      try {
        const [countriesData, settingsData] = await Promise.all([
          fetchCountries(),
          fetchSettings()
        ]);

        if (settingsData?.default_country) {
          setCountries([settingsData.default_country]);
          setSelectedCountry(settingsData.default_country);
          if (settingsData.default_country.phone_code) {
            setSelectedCountryCode(settingsData.default_country.phone_code);
          }
        } else {
          const withCodes = (countriesData || []).filter((c: any) => c.phone_code);
          setCountries(withCodes);
          if (withCodes.length > 0) {
            setSelectedCountry(withCodes.find((c: any) => c.phone_code === "+966") || withCodes[0]);
          }
        }
      } catch (err) {
        console.error('Error loading countries in checkout:', err);
      }
    };
    loadCountriesData();
  }, []);


  const filteredCountries = countryQuery === ''
    ? countries
    : countries.filter((country) =>
      country.name.toLowerCase().includes(countryQuery.toLowerCase())
    );

  const filteredZones = zoneQuery === ''
    ? zones
    : zones.filter((zone) =>
      zone.name.toLowerCase().includes(zoneQuery.toLowerCase())
    );

  const [newAddress, setNewAddress] = useState({
    first_name: "", last_name: "", address_1: "", address_2: "", city: "", postcode: "", state: "", country_id: "", zone_id: "", latitude: "", longitude: "", is_default: false, address_type: "home"
  });
  const [guestEmail, setGuestEmail] = useState("");
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");

  // Auth Flows
  const [authMode, setAuthMode] = useState<"options" | "login" | "register" | "guest">("options");
  const [authError, setAuthError] = useState("");
  const [credentials, setCredentials] = useState({ first_name: "", phone: "", last_name: "", email: "", password: "", password_confirmation: "" });
  const [tabbyPhone, setTabbyPhone] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();

  // Handle Cancellation from Payment Gateway
  useEffect(() => {
    const cancelAction = async () => {
      const cancel = searchParams.get('cancel');
      const orderNumber = searchParams.get('order_number');
      if (cancel === 'true' && orderNumber) {
        try {
          await cancelOrderOnBackend(orderNumber);
          setCheckoutError(lang === 'ar' ? 'تم إلغاء الدفع. يمكنك المحاولة مرة أخرى.' : 'Payment was cancelled. You can try again.');
          // Remove query params
          router.replace('/checkout');
        } catch (e) {
          console.error("Failed to cancel order", e);
        }
      }
    };
    cancelAction();
  }, [searchParams, token, lang, router]);

  // If user is already logged in, skip options
  useEffect(() => {
    if (user) {
      setAuthMode("guest");
      if ((user as any).phone) setTabbyPhone((user as any).phone);
    }
  }, [user]);


  useEffect(() => {
    async function init() {
      const [methods, settings, countriesData] = await Promise.all([
        fetchPaymentMethods(),
        fetchSettings(),
        fetchCountries()
      ]);
      setPaymentMethods(methods);
      setSettings(settings);
      if (methods && methods.length > 0) {
        setSelectedMethod(methods[0].code);
      }
      if (settings?.currency_symbol) {
        setCurrencySymbol(settings.currency_symbol);
      }
      if (settings?.site_name) {
        setSiteName(settings.site_name);
      }
      if (settings?.tax_rate !== undefined) {
        setTaxRate(parseFloat(settings.tax_rate));
      }
      if (settings?.prices_include_tax !== undefined) {
        setPricesIncludeTax(Boolean(settings.prices_include_tax));
      }
      if (countriesData) {
        setCountries(countriesData);
      }

      // Auto-set default country from admin settings
      if (settings?.default_country_id) {
        const defaultId = settings.default_country_id.toString();
        setDefaultCountryId(defaultId);
        setNewAddress(prev => ({ ...prev, country_id: defaultId }));
        // Pre-fetch zones for the default country
        try {
          const { fetchZones } = await import('@/lib/api');
          const defaultZones = await fetchZones(defaultId);
          if (defaultZones?.length) setZones(defaultZones);
        } catch (e) { }
      }

      if (user) {
        try {
          const userAddresses = await fetchCustomerAddresses();
          setAddresses(userAddresses);
          if (userAddresses && userAddresses.length > 0) {
            setSelectedAddressId(userAddresses[0].id);
            calculateRatesForAddress(userAddresses[0]);
          } else {
            setIsAddingNewAddress(true);
          }
        } catch (e) {
          console.error("Failed to load addresses", e);
        }
      }
    }
    init();
  }, [user]);


  useEffect(() => {
    const handler = setTimeout(() => {
      // Trigger rates fetch if using manual address entry (guest or adding new)
      if (!user || isAddingNewAddress || !selectedAddressId) {
        if (newAddress.city && newAddress.country_id) {
          calculateRatesForAddress(newAddress);
        }
      }
    }, 1000); // 1s debounce

    return () => clearTimeout(handler);
  }, [newAddress.city, newAddress.country_id, isAddingNewAddress, selectedAddressId, user]);

  const calculateRatesForAddress = async (addr: any) => {
    if (!addr || !addr.city || !addr.country_id) return;
    setIsLoadingRates(true);
    try {
      const uuid = typeof window !== 'undefined' ? localStorage.getItem('elegance_cart_uuid') : null;
      if (!uuid) return;

      // Ensure you have a way to match country_id to actual country string if API requires string,
      // or just send what you have. Assuming `api.ts` `fetchShippingRates` accepts them.
      const countryObj = countries.find(c => c.id.toString() === addr.country_id.toString());
      const countryName = countryObj ? countryObj.name : 'Unknown';

      const rates = await fetchShippingRates(uuid, addr.city, countryName, token || undefined);
      setShippingRates(rates || []);
      if (rates && rates.length > 0) {
        setSelectedShippingMethod(rates[0].code);
      }
    } catch (e) {
      console.error("Failed to fetch rates", e);
    } finally {
      setIsLoadingRates(false);
    }
  };

  const handleAddressSelect = (id: number) => {
    setSelectedAddressId(id);
    const addr = addresses.find(a => a.id === id);
    if (addr) {
      calculateRatesForAddress(addr);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const isLogin = authMode === "login";

    try {
      let data;

      if (isLogin) {
        // في حالة تسجيل الدخول نرسل البيانات كالمعتاد
        data = await authLogin(credentials);
      } else {
        // في حالة التسجيل، نقوم بتجهيز البيانات وإضافة كود الدولة phone_code
        const registerPayload = {
          ...credentials,
          phone_code: selectedCountryCode, // الكود المختار من الـ Dropdown (مثال: +966)
          // إذا كان الباك-إند يتوقع الرقم بدون الصفر الأول، يمكنك تفعيل السطر التالي:
          // phone: credentials.phone.replace(/^0+/, '')
        };
        data = await authRegister(registerPayload);
      }

      // النجاح في المصادقة
      login(data.customer, data.access_token);
      await syncCart();
      setAuthMode("guest");
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const calculateDiscount = (st: number, coupon: any) => {
    if (!coupon) return 0;
    let disc = 0;
    if (coupon.type === 'fixed') {
      disc = parseFloat(coupon.value);
    } else {
      disc = st * (parseFloat(coupon.value) / 100);
    }
    if (coupon.max_discount && disc > parseFloat(coupon.max_discount)) {
      disc = parseFloat(coupon.max_discount);
    }
    return disc;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponError(null);
    setApplyingCoupon(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      const uuid = typeof window !== 'undefined' ? localStorage.getItem('elegance_cart_uuid') : null;

      const res = await fetch(`${API_URL}/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || '',
          'X-SECRET-KEY': process.env.NEXT_PUBLIC_SECRET_KEY || '',
          'X-Cart-UUID': uuid || ''
        },
        body: JSON.stringify({
          code: couponCode,
          subtotal: subtotal
        })
      });

      const data = await res.json();
      if (data.success) {
        setAppliedCoupon(data.coupon);
        setCouponCode("");
      } else {
        setAppliedCoupon(null);
        setCouponError(t(data.message as any, lang) || t('invalid_coupon', lang));
      }
    } catch (e) {
      setCouponError(t('error_placing_order', lang));
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handlePlaceOrder = async () => {
    setCheckoutError(null);
    if (!selectedMethod) {
      setCheckoutError(t('select_payment_method', lang));
      return;
    }

    // Only require shipping method if items exist (assuming always physical cart for now)
    // if (!selectedShippingMethod) {
    //   setCheckoutError(t('select_shipping_method', lang));
    //   return;
    // }

    const deliveryAddress = selectedAddressId
      ? addresses.find(a => a.id === selectedAddressId)
      : newAddress;

    if (!deliveryAddress || !deliveryAddress.first_name || !deliveryAddress.last_name || !deliveryAddress.address_1 || !deliveryAddress.city) {
      setCheckoutError(t('address_incomplete', lang));
      return;
    }

    // Mix in email if doing guest
    const finalAddress = {
      ...deliveryAddress,
      email: user ? user.email : guestEmail
    };

    try {
      setIsPlacingOrder(true);
      if ((selectedMethod === 'tabby' || selectedMethod === 'tamara') && tabbyPhone.length !== 10) {
        setCheckoutError(lang === 'ar' ? 'يجب أن يكون رقم الجوال 10 أرقام' : 'Mobile number must be exactly 10 digits');
        setIsPlacingOrder(false);
        return;
      }

      const uuid = typeof window !== 'undefined' ? localStorage.getItem('elegance_cart_uuid') : null;

      const payload = {
        payment_method: selectedMethod,
        shipping_method: selectedShippingMethod,
        cart_uuid: uuid || '',
        shipping_address: finalAddress,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        coupon_discount: appliedCoupon ? calculateDiscount(subtotal, appliedCoupon) : 0,
        tabby_phone: (selectedMethod === 'tabby' || selectedMethod === 'tamara') ? tabbyPhone : null,
      };

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || '',
        'X-SECRET-KEY': process.env.NEXT_PUBLIC_SECRET_KEY || ''
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      const res = await fetch(`${API_URL}/checkout`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setIsOrderSuccess(true);
        setPlacedOrderNumber(data.order_number);

        // Handle MyFatoorah payment redirect
        if (data.payment_method === 'myfatoorah') {
          try {
            const mfResponse = await initiateMyFatoorahPayment(data.order_number, lang);
            if (mfResponse.success && mfResponse.invoice_url) {
              window.location.href = mfResponse.invoice_url;
              return;
            } else {
              setCheckoutError(lang === 'ar' ? 'فشل بدء عملية الدفع' : 'Failed to initiate payment');
              setIsOrderSuccess(false);
            }
          } catch (mfErr: any) {
            setCheckoutError(mfErr.message || (lang === 'ar' ? 'خطأ في الدفع' : 'Payment error'));
            setIsOrderSuccess(false);
          }
          return;
        }

        // Give time for the success animation
        setTimeout(() => {
          if (data.checkout_url) {
            window.location.href = data.checkout_url;
          } else {
            window.location.href = `/thankyou?order_number=${data.order_number}`;
          }
        }, 2000);
      } else {
        const err = await res.json();
        if (res.status === 422 && err.errors) {
          // Flatten validation errors
          const messages = Object.values(err.errors).flat().join('. ');
          setCheckoutError(`${t('validation_error', lang) || 'Validation Error'}: ${messages}`);
        } else {
          setCheckoutError(err.message || t('error_placing_order', lang) || 'Error placing order');
        }
      }
    } catch (e) {
      console.error(e);
      setCheckoutError(t('error_placing_order', lang) || 'Error placing order');
    } finally {
      setIsPlacingOrder(false);
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
      setAddresses(userAddresses);

      if (userAddresses && userAddresses.length > 0) {
        // the newly created address is usually last, keep selection if editing
        if (!editingAddressId) {
          const newAddr = userAddresses[userAddresses.length - 1];
          setSelectedAddressId(newAddr.id);
          calculateRatesForAddress(newAddr);
        } else {
          // If edited current one, re-run rates
          if (selectedAddressId === editingAddressId) {
            // Find the updated address from the newly fetched userAddresses array
            const updatedAddr = userAddresses.find((a: any) => a.id === editingAddressId);
            if (updatedAddr) {
              calculateRatesForAddress(updatedAddr);
            }
          }
        }
      }

      setIsAddingNewAddress(false);
      setEditingAddressId(null);
      setNewAddress({ first_name: "", last_name: "", address_1: "", address_2: "", city: "", postcode: "", state: "", country_id: "", zone_id: "", latitude: "", longitude: "", is_default: false, address_type: "home" });
    } catch (err: any) {
      setAddressError(err.message);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleEditAddressClick = async (addr: any) => {
    setAddressError("");
    setEditingAddressId(addr.id);
    setIsAddingNewAddress(true);
    setNewAddress({
      first_name: addr.first_name || "",
      last_name: addr.last_name || "",
      address_1: addr.address_1 || "",
      address_2: addr.address_2 || "",
      city: addr.city || "",
      postcode: addr.postcode || "",
      state: addr.state || "",
      country_id: addr.country_id?.toString() || "",
      zone_id: addr.zone_id?.toString() || "",
      latitude: addr.latitude || "",
      longitude: addr.longitude || "",
      is_default: addr.is_default || false,
      address_type: addr.address_type || "home"
    });

    // Prefetch zones if country is already set
    if (addr.country_id) {
      try {
        const fetchedZones = await fetchZones(addr.country_id);
        setZones(fetchedZones);
      } catch (e) { }
    }
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;
    const id = addressToDelete;
    setIsDeletingAddress(id);
    try {
      await deleteCustomerAddress(id);
      const userAddresses = await fetchCustomerAddresses();
      setAddresses(userAddresses);
      if (selectedAddressId === id) {
        setSelectedAddressId(userAddresses.length > 0 ? userAddresses[0].id : null);
      }
    } catch (err: any) {
      setCheckoutError(err.message || t('error_deleting_address', lang) || 'Failed to delete address');
    } finally {
      setIsDeletingAddress(null);
      setAddressToDelete(null);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const selectedRateObj = shippingRates.find(r => r.code === selectedShippingMethod);
  const shipping = selectedRateObj ? parseFloat(selectedRateObj.cost) : 0;

  const discount = appliedCoupon ? calculateDiscount(subtotal, appliedCoupon) : 0;

  let taxes = 0;
  let total = 0;
  // 1. استخراج وتنظيف رقم الواتساب من الإعدادات
  const rawNumber = settings?.whatsapp || settings?.whatsapp_phone || settings?.whatsapp_number || settings?.phone || "";
  const whatsappNumber = rawNumber ? rawNumber.replace(/\D/g, '') : "966500000000";

  // 2. بناء نص ملخص الطلبات بشكل مرتب للواتساب
  const cartSummaryText = cartItems.map((item) => {
    const itemName = typeof item.name === 'object' && item.name !== null
      ? (item.name[lang] || item.name.en || "Product Name")
      : (item.name || "Product Name");

    const itemColor = typeof item.color === 'object' && item.color !== null
      ? (item.color[lang] || item.color.en)
      : item.color;

    const itemSize = typeof item.size === 'object' && item.size !== null
      ? (item.size[lang] || item.size.en)
      : item.size;

    return `- ${itemName} (${itemColor} / ${itemSize}) x ${item.quantity}`;
  }).join('\n');

  const messageText = lang === 'ar'
    ? `مرحباً، أود الاستفسار عن سعر وتفاصيل المنتجات التالية:\n\n${cartSummaryText}`
    : `Hello, I would like to inquire about the price and details for the following products:\n\n${cartSummaryText}`;

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;

  if (pricesIncludeTax) {
    // Inclusive Tax: Subtotal remains unchanged, Total is (subtotal - discount) + shipping.
    taxes = (subtotal - discount) - ((subtotal - discount) / (1 + (taxRate / 100)));
    total = Math.max(0, subtotal - discount + shipping);
  } else {
    // Exclusive Tax: Tax is charged on top of the (subtotal - discount).
    taxes = (subtotal - discount) * (taxRate / 100);
    total = Math.max(0, subtotal - discount + shipping + taxes);
  }

  if (isCartLoading) {
    return (
      <div className="flex flex-col min-h-screen pt-4 pb-24 bg-muted/20 animate-pulse pt-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-center py-8 mb-8 border-b border-border">
            <div className="h-10 w-40 bg-muted rounded-lg"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 space-y-8">
              <div className="h-64 bg-background rounded-2xl border border-border"></div>
              <div className="h-96 bg-background rounded-2xl border border-border"></div>
            </div>
            <div className="lg:col-span-5">
              <div className="h-[500px] bg-background rounded-2xl border border-border"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col min-h-screen pt-4 pb-24 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center py-20">
          <div className="flex items-center justify-center py-8 mb-12 border-b border-border">
            <Link href="/" className="font-serif text-3xl font-bold tracking-tight text-primary">
              {siteName}
            </Link>
          </div>
          <div className="max-w-md mx-auto space-y-6">
            <div className="mx-auto w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-8">
              <Truck className="w-12 h-12 text-primary opacity-40" />
            </div>
            <h1 className="font-serif text-4xl font-bold text-foreground italic">{t('empty_cart', lang)}</h1>
            <p className="text-lg text-muted-foreground">{t('no_products_added_desc', lang) || "Your cart is currently empty. Add some products before checking out."}</p>
            <Link href="/shop" className="inline-block bg-primary text-primary-foreground px-12 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl active:scale-95 mt-8">
              {t('shop_collection', lang)}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pt-4 pb-24 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

        {/* Header Branding */}
        <div className="flex items-center justify-center py-8 mb-8 border-b border-border">
          <Link href="/" className="font-serif text-3xl font-bold tracking-tight text-primary">
            {siteName}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Checkout Form */}
          <div className="lg:col-span-7">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

              {/* Conditional Auth Wrapper */}
              {!user && authMode === "options" && (
                <section className="bg-background p-8 rounded-2xl shadow-sm border border-border/50 mb-8 space-y-6">
                  <h2 className="font-serif text-2xl font-bold text-foreground text-center mb-2">{t('welcome', lang)}</h2>
                  <p className="text-muted-foreground text-center mb-8">{t('checkout_how', lang)}</p>

                  <div className="flex flex-col gap-4">
                    <button onClick={() => setAuthMode('login')} className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white py-4 rounded-xl font-medium transition-colors">
                      {t('login', lang)}
                    </button>
                    <button onClick={() => setAuthMode('register')} className="w-full bg-primary text-white hover:bg-primary/90 py-4 rounded-xl font-medium transition-colors shadow-sm">
                      {t('create_account', lang)}
                    </button>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white py-4 rounded-xl font-medium transition-colors text-center text-base shadow-sm"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.21 2c-5.464 0-9.91 4.39-9.91 9.782 0 1.723.454 3.407 1.316 4.898L2 22l5.485-1.422a9.96 9.96 0 004.723 1.185c5.464 0 9.91-4.39 9.91-9.781C22.12 6.39 17.674 2 12.21 2zm5.727 13.914c-.244.68-1.22 1.332-1.83 1.4-.61.07-1.373.13-3.832-.86-2.46-.99-4.04-3.46-4.162-3.62-.122-.17-1.012-1.33-1.012-2.53 0-1.2.634-1.8.854-2.03.22-.24.488-.3.653-.3.164 0 .33.01.47.01.147 0 .348-.06.543.4.195.47.67 1.61.73 1.73.061.12.1.26.02.42-.08.17-.183.28-.317.43-.134.15-.28.34-.4.48-.135.15-.275.31-.116.58.16.27.707 1.15 1.513 1.86.1.09.81.72 1.636 1.05.25.1.445.08.61-.09.214-.22.915-1.05 1.16-1.41.244-.36.488-.3.824-.18.335.12 2.122.99 2.488 1.17.366.18.61.27.695.41.085.15.085.86-.159 1.54z" />
                      </svg>
                      <span>{lang === 'ar' ? 'راسلنا لمعرفة السعر' : 'Inquire for price'}</span>
                    </a>
                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border"></span>
                      </div>
                      {/* <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-4 text-muted-foreground">{t('or', lang)}</span>
                      </div> */}
                    </div>

                    {/* <button onClick={() => setAuthMode('guest')} className="w-full text-muted-foreground hover:text-foreground underline underline-offset-4 py-2 font-medium transition-colors">
                      {t('checkout_as_guest', lang)}
                    </button> */}
                    {/* زر المراسلة عبر الواتساب الجديد */}

                  </div>
                </section>
              )}
              {!user && (authMode === "login" || authMode === "register") && (
                <section className="bg-background p-8 rounded-2xl shadow-sm border border-border/50 mb-8 relative">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-serif text-2xl font-bold text-foreground">
                      {authMode === "login" ? t('login', lang) : t('create_account', lang)}
                    </h2>
                    <button onClick={() => setAuthMode('options')} className="text-sm text-primary hover:underline">{t('back', lang)}</button>
                  </div>

                  {authError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-200">
                      {authError}
                    </div>
                  )}

                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                    {authMode === "register" && (
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder={t('first_name', lang)}
                          required
                          value={credentials.first_name}
                          onChange={e => setCredentials({ ...credentials, first_name: e.target.value })}
                          className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent text-foreground"
                        />
                        <input
                          type="text"
                          placeholder={t('last_name', lang)}
                          required
                          value={credentials.last_name}
                          onChange={e => setCredentials({ ...credentials, last_name: e.target.value })}
                          className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent text-foreground"
                        />
                      </div>
                    )}

                    <input
                      type="email"
                      placeholder={t('auth_email', lang)}
                      required
                      value={credentials.email}
                      onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                      className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent text-foreground"
                    />

                    {authMode === "register" && (
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{t('mobile_number', lang)}</label>
                        <div className="flex gap-0">
                          {/* Country Code Selector */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => { if (countries.length > 1) setShowCountryDropdown(!showCountryDropdown); }}
                              className={`flex items-center gap-1.5 border border-border border-r-0 rounded-l-lg px-3 py-3 bg-muted/30 transition-colors min-w-[90px] justify-center ${countries.length > 1 ? 'hover:bg-muted/50 cursor-pointer' : 'cursor-default'}`}
                            >
                              <span className="text-sm font-semibold text-foreground">{selectedCountryCode}</span>
                              {countries.length > 1 && (
                                <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              )}
                            </button>

                            {/* Dropdown */}
                            {showCountryDropdown && (
                              <div className="absolute top-full left-0 mt-1 w-72 bg-background border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                                {countries.length > 1 && (
                                  <div className="p-2 border-b border-border">
                                    <input
                                      type="text"
                                      placeholder={t('search_country', lang)}
                                      value={countrySearch}
                                      onChange={e => setCountrySearch(e.target.value)}
                                      className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                                      autoFocus
                                    />
                                  </div>
                                )}
                                <div className="max-h-48 overflow-y-auto">
                                  {filteredCountries.map((country: any) => (
                                    <button
                                      key={country.id}
                                      type="button"
                                      onClick={() => {
                                        setSelectedCountry(country);
                                        setSelectedCountryCode(country.phone_code);
                                        setShowCountryDropdown(false);
                                        setCountrySearch("");
                                      }}
                                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors ${selectedCountryCode === country.phone_code ? 'bg-primary/5 text-primary' : 'text-foreground'
                                        }`}
                                    >
                                      <span>{country.name}</span>
                                      <span className="font-mono text-muted-foreground">{country.phone_code}</span>
                                    </button>
                                  ))}
                                  {filteredCountries.length === 0 && (
                                    <div className="px-4 py-3 text-sm text-muted-foreground text-center"> {t('no_countries_found', lang)}</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Phone Input */}
                          <input
                            type="tel"
                            required
                            placeholder={selectedCountry?.min_digits === selectedCountry?.max_digits ? t('enter_digits', lang).replace('{digits}', selectedCountry?.min_digits) : t('mobile_number', lang)}
                            value={credentials.phone}
                            minLength={selectedCountry?.min_digits}
                            maxLength={selectedCountry?.max_digits}
                            onChange={e => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              if (selectedCountry?.max_digits && val.length > selectedCountry.max_digits) return;
                              setCredentials({ ...credentials, phone: val });
                            }}
                            className="flex-1 border border-border rounded-r-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                          />
                        </div>
                      </div>
                    )}

                    <input
                      type="password"
                      placeholder={t('auth_password', lang)}
                      required
                      value={credentials.password}
                      onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                      className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent text-foreground"
                    />

                    {authMode === "register" && (
                      <input
                        type="password"
                        placeholder={t('confirm_password', lang)}
                        required
                        value={credentials.password_confirmation}
                        onChange={e => setCredentials({ ...credentials, password_confirmation: e.target.value })}
                        className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent text-foreground"
                      />
                    )}

                    <button type="submit" className="w-full bg-primary text-white py-4 rounded-xl font-medium mt-4 shadow-sm hover:shadow-md transition-all">
                      {authMode === "login" ? t('login', lang) : t('create_account', lang)}
                    </button>
                  </form>
                </section>
              )}
              {/* Guest / Logged-In Checkout Pipeline */}
              {authMode === "guest" && (
                <>
                  {/* Contact Info */}
                  <section className="bg-background p-8 rounded-2xl shadow-sm border border-border/50 mb-8">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="font-serif text-2xl font-bold text-foreground">{t('contact_details', lang)}</h2>
                      {!user && (
                        <span className="text-sm text-muted-foreground">{t('already_have_account', lang)} <button onClick={() => setAuthMode('login')} className="text-primary hover:underline">{t('login', lang)}</button></span>
                      )}
                    </div>

                    {user ? (
                      <div className="p-4 border border-border rounded-xl bg-muted/20 flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        <div>
                          <div className="font-medium">{user.first_name} {user.last_name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <input
                            type="email"
                            placeholder={t('auth_email', lang)}
                            value={guestEmail}
                            onChange={(e) => setGuestEmail(e.target.value)}
                            className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-transparent"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="newsletter" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                          <label htmlFor="newsletter" className="text-sm text-muted-foreground">{t('newsletter_signup', lang)}</label>
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Shipping Address */}
                  <section className="bg-background p-8 rounded-2xl shadow-sm border border-border/50 mb-8">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="font-serif text-2xl font-bold text-foreground">{t('shipping_address', lang)}</h2>
                      {user && addresses.length > 0 && (
                        <button
                          onClick={() => {
                            const isOpening = !isAddingNewAddress;
                            setIsAddingNewAddress(isOpening);
                            if (!isOpening) {
                              setEditingAddressId(null);
                              setNewAddress({ first_name: "", last_name: "", address_1: "", address_2: "", city: "", postcode: "", state: "", country_id: "", zone_id: "", latitude: "", longitude: "", is_default: false, address_type: "home" });
                            }
                          }}
                          className="text-sm text-primary hover:underline"
                        >
                          {isAddingNewAddress ? t('cancel', lang) : `+ ${t('add_new_address', lang)}`}
                        </button>
                      )}
                    </div>

                    {user && !isAddingNewAddress && addresses.length > 0 ? (
                      <div className="space-y-4">
                        {addresses.map((addr) => (
                          <label
                            key={addr.id}
                            className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all
                          ${selectedAddressId === addr.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/50'}`}
                          >
                            <div className="flex items-center h-5 mt-0.5">
                              <input
                                type="radio"
                                name="delivery_address"
                                value={addr.id}
                                checked={selectedAddressId === addr.id}
                                onChange={() => setSelectedAddressId(addr.id)}
                                className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h3 className="font-medium text-foreground">{addr.first_name} {addr.last_name}</h3>
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditAddressClick(addr); }}
                                    className="text-xs text-primary hover:text-primary/70 font-semibold"
                                  >
                                    {t('edit', lang)}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAddressToDelete(addr.id); }}
                                    disabled={isDeletingAddress === addr.id}
                                    className="text-xs text-red-600 hover:text-red-500 font-semibold disabled:opacity-50"
                                  >
                                    {isDeletingAddress === addr.id ? t('deleting', lang) : t('delete', lang)}
                                  </button>
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {addr.address_1} {addr.address_2 && `, ${addr.address_2}`}<br />
                                {addr.city}, {addr.state} {addr.postcode}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {addressError && (
                          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                            {addressError}
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2 flex flex-col sm:flex-row gap-3">
                            <div className="flex bg-secondary/30 border border-border rounded-lg p-1 w-full max-w-sm">
                              {['home', 'office', 'other'].map(type => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => setNewAddress({ ...newAddress, address_type: type })}
                                  className={`flex-1 py-2 text-sm text-center rounded-md font-medium capitalize transition-all ${newAddress.address_type === type ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                  {t(type as any, lang)}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <input type="text" placeholder={t('first_name', lang)} value={newAddress.first_name} onChange={e => setNewAddress({ ...newAddress, first_name: e.target.value })} className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-transparent" />
                          </div>
                          <div>
                            <input type="text" placeholder={t('last_name', lang)} value={newAddress.last_name} onChange={e => setNewAddress({ ...newAddress, last_name: e.target.value })} className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-transparent" />
                          </div>
                          <div className="md:col-span-2">
                            <input type="text" placeholder={t('address', lang)} value={newAddress.address_1} onChange={e => setNewAddress({ ...newAddress, address_1: e.target.value })} className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-transparent" />
                          </div>
                          <div className="md:col-span-2">
                            <input type="text" placeholder={t('apartment', lang)} value={newAddress.address_2} onChange={e => setNewAddress({ ...newAddress, address_2: e.target.value })} className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-transparent" />
                          </div>
                          {/* Hidden input always carries the country value */}
                          <input type="hidden" name="country_id" value={newAddress.country_id} />

                          {/* Only show country selector if no store-level default is configured */}
                          {!defaultCountryId && (
                            <div className="md:col-span-2 relative z-50">
                              <Combobox value={newAddress.country_id || ""} onChange={async (val) => {
                                setNewAddress({ ...newAddress, country_id: val || '', zone_id: '', state: '' });
                                if (val) {
                                  const zonesData = await fetchZones(val);
                                  setZones(zonesData);
                                } else {
                                  setZones([]);
                                }
                              }}>
                                <div className="relative">
                                  <Combobox.Input
                                    className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-transparent text-foreground"
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setCountryQuery(event.target.value)}
                                    displayValue={(countryId: string) => countries.find((c: any) => c.id.toString() === countryId)?.name || ''}
                                    placeholder={t('select_country', lang)}
                                  />
                                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                    <ChevronRight className={`h-5 w-5 text-gray-400 ${lang === 'ar' ? 'rotate-180' : ''}`} aria-hidden="true" />
                                  </Combobox.Button>
                                </div>
                                <Combobox.Options className="absolute z-[100] mt-1 max-h-60 w-full overflow-y-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                  {filteredCountries.length === 0 && countryQuery !== '' ? (
                                    <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                      {t('nothing_found', lang)}
                                    </div>
                                  ) : (
                                    filteredCountries.map((country) => (
                                      <Combobox.Option
                                        key={country.id}
                                        className={({ active }) =>
                                          `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-primary text-white' : 'text-gray-900'
                                          }`
                                        }
                                        value={country.id.toString()}
                                      >
                                        {({ selected, active }) => (
                                          <>
                                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                              {country.name}
                                            </span>
                                            {selected ? (
                                              <span
                                                className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-primary'
                                                  }`}
                                              >
                                                <Check className="h-5 w-5" aria-hidden="true" />
                                              </span>
                                            ) : null}
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
                            <input type="text" placeholder={t('city', lang)} value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-transparent" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="relative z-50">
                              <Combobox value={newAddress.zone_id || ""} onChange={(val) => {
                                const selectedZone = zones.find(z => z.id.toString() === val);
                                setNewAddress({ ...newAddress, zone_id: val || '', state: selectedZone ? selectedZone.name : '' });
                              }} disabled={zones.length === 0}>
                                <div className="relative">
                                  <Combobox.Input
                                    className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-transparent text-foreground disabled:opacity-50"
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setZoneQuery(event.target.value)}
                                    displayValue={(zoneId: string) => zones.find((z) => z.id.toString() === zoneId)?.name || ''}
                                    placeholder={t('select_state', lang)}
                                  />
                                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2" disabled={zones.length === 0}>
                                    <ChevronRight className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                  </Combobox.Button>
                                </div>
                                <Combobox.Options className="absolute z-[100] mt-1 max-h-60 w-full overflow-y-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                  {filteredZones.length === 0 && zoneQuery !== '' ? (
                                    <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                      {t('nothing_found', lang)}
                                    </div>
                                  ) : (
                                    filteredZones.map((zone) => (
                                      <Combobox.Option
                                        key={zone.id}
                                        className={({ active }) =>
                                          `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-primary text-white' : 'text-gray-900'
                                          }`
                                        }
                                        value={zone.id.toString()}
                                      >
                                        {({ selected, active }) => (
                                          <>
                                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                              {zone.name}
                                            </span>
                                            {selected ? (
                                              <span
                                                className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-primary'
                                                  }`}
                                              >
                                                <Check className="h-5 w-5" aria-hidden="true" />
                                              </span>
                                            ) : null}
                                          </>
                                        )}
                                      </Combobox.Option>
                                    ))
                                  )}
                                </Combobox.Options>
                              </Combobox>
                            </div>
                            <input type="text" placeholder={t('zip_code', lang)} value={newAddress.postcode} onChange={e => setNewAddress({ ...newAddress, postcode: e.target.value })} className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-transparent" />
                          </div>

                          <div className="md:col-span-2 flex items-center justify-between pb-2 border-b border-border">
                            <button type="button" onClick={() => setShowMapModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors border border-primary/20">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              </svg>
                              {t('pick_location', lang)}
                            </button>
                          </div>

                          <div className="space-y-3 md:col-span-2 pt-2">
                            <label className="flex items-center gap-3 cursor-pointer group w-fit">
                              <button type="button" onClick={() => setNewAddress({ ...newAddress, is_default: !newAddress.is_default })} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ring-2 ring-transparent focus:ring-primary/50 ${newAddress.is_default ? 'bg-primary' : 'bg-secondary'}`}>
                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${newAddress.is_default ? (lang === 'ar' ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'}`}></span>
                              </button>
                              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{t('default_address', lang)}</span>
                            </label>
                          </div>

                          {user && isAddingNewAddress && (
                            <div className="md:col-span-2 pt-2 flex justify-end">
                              <button
                                type="button"
                                onClick={handleSaveAddress}
                                disabled={isSavingAddress || !newAddress.first_name || !newAddress.last_name || !newAddress.address_1 || !newAddress.city || !newAddress.postcode}
                                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                              >
                                {isSavingAddress ? t('saving', lang) : (editingAddressId ? t('edit_address', lang) : t('save_address', lang))}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Shipping Methods */}
                  {((user && addresses.length > 0 && !isAddingNewAddress) || (!selectedAddressId || isAddingNewAddress)) && (
                    <section className="bg-background p-8 rounded-2xl shadow-sm border border-border/50 mb-8 relative">
                      {isLoadingRates && (
                        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      )}
                      <h2 className="font-serif text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-primary" /> {t('shipping_method', lang)}
                      </h2>

                      {shippingRates.length === 0 && !isLoadingRates ? (
                        <div className="text-sm text-yellow-600 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                          {t('no_shipping_methods', lang)}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {shippingRates.map((method: any) => (
                            <label
                              key={method.code}
                              className={`relative flex flex-col p-5 border rounded-xl cursor-pointer transition-all overflow-hidden group
                              ${selectedShippingMethod === method.code
                                  ? "border-primary bg-primary/5 ring-1 ring-primary shadow-md"
                                  : "border-border hover:border-primary/50 hover:bg-secondary/20"
                                }`}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedShippingMethod === method.code
                                      ? "border-primary bg-primary"
                                      : "border-gray-300"
                                      }`}
                                  >
                                    {selectedShippingMethod === method.code && (
                                      <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                  </div>
                                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                    {typeof method.name === 'object' && method.name !== null
                                      ? (method.name[lang] || method.name.en || method.name)
                                      : (method.name || 'Standard Shipping')}
                                  </span>
                                </div>
                                <span className="font-bold text-lg text-primary flex items-center gap-1">
                                  {method.cost === 0 ? t('free', lang) : (
                                    <>
                                      {finalCurrencySymbol.includes('.svg') || finalCurrencySymbol.includes('.png') ? (
                                        <img src={finalCurrencySymbol} alt="Currency" className="h-4 w-auto object-contain inline-block" />
                                      ) : (
                                        <span>{finalCurrencySymbol}</span>
                                      )}
                                      <span>{parseFloat(method.cost).toFixed(2)}</span>
                                    </>
                                  )}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground pl-8">
                                {typeof method.description === 'object' && method.description !== null
                                  ? (method.description[lang] || method.description.en || method.description)
                                  : (method.description || t('standard_delivery', lang))}
                              </p>
                              <p className="text-xs font-medium text-emerald-600 pl-8 mt-2">
                                {t('est_delivery', lang)}: {typeof method.estimated_days === 'object' && method.estimated_days !== null
                                  ? (method.estimated_days[lang] || method.estimated_days.en || method.estimated_days)
                                  : (method.estimated_days || '3-5 Business Days')}
                              </p>

                              <input
                                type="radio"
                                name="shipping_method"
                                value={method.code}
                                checked={selectedShippingMethod === method.code}
                                onChange={() => setSelectedShippingMethod(method.code)}
                                className="hidden"
                              />
                            </label>
                          ))}
                        </div>
                      )}
                    </section>
                  )}

                  {/* Payment Info */}
                  <section className="bg-background p-8 rounded-2xl shadow-sm border border-border/50 mb-8">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="font-serif text-2xl font-bold text-foreground">{t('payment_method', lang)}</h2>
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">{t('secure_payment_msg', lang)}</p>

                    {paymentMethods.length === 0 ? (
                      <div className="p-4 border border-border rounded-xl text-center text-sm text-muted-foreground bg-secondary/30">
                        {t('loading_payment_options', lang)}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {paymentMethods.map((method) => (
                          <label
                            key={method.id}
                            className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all
                          ${selectedMethod === method.code ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/50'}`}
                          >
                            <div className="flex items-center h-6">
                              <input
                                type="radio"
                                name="payment_method"
                                value={method.code}
                                checked={selectedMethod === method.code}
                                onChange={() => setSelectedMethod(method.code)}
                                className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-foreground">{method.name}</h3>
                                {method.code === 'tamara' && (
                                  <span className="text-xs bg-pink-100 text-pink-700 font-bold px-2 py-1 rounded">Tamara</span>
                                )}
                                {method.code === 'tabby' && (
                                  <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded">Tabby</span>
                                )}
                                {method.code === 'cod' && (
                                  <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded">COD</span>
                                )}
                              </div>
                              {method.description && (
                                <div
                                  className="text-sm text-muted-foreground mt-1"
                                  dangerouslySetInnerHTML={{ __html: method.description }}
                                />
                              )}
                              {(selectedMethod === 'tabby' && method.code === 'tabby' || selectedMethod === 'tamara' && method.code === 'tamara') && (
                                <div className={`mt-4 animate-in fade-in slide-in-from-top-2 duration-300`}>
                                  <label className={`block text-xs font-semibold mb-1.5 uppercase tracking-wider ${selectedMethod === 'tabby' ? 'text-emerald-700' : 'text-pink-700'}`}>
                                    {selectedMethod === 'tabby'
                                      ? (lang === 'ar' ? 'رقم الجوال لـ Tabby' : 'Tabby Mobile Number')
                                      : (lang === 'ar' ? 'رقم الجوال لـ Tamara' : 'Tamara Mobile Number')
                                    }
                                  </label>
                                  <div className="relative group">
                                    <input
                                      type="tel"
                                      value={tabbyPhone}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setTabbyPhone(val);
                                      }}
                                      maxLength={10}
                                      minLength={10}
                                      placeholder="05xxxxxxxx"
                                      className={`w-full bg-white border-2 rounded-xl px-4 py-3 text-sm focus:ring-0 outline-none transition-all uppercase tracking-[2px] 
                                        ${selectedMethod === 'tabby'
                                          ? 'border-emerald-100 focus:border-emerald-500 group-hover:border-emerald-200'
                                          : 'border-pink-100 focus:border-pink-500 group-hover:border-pink-200'}`}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
                                      {selectedMethod === 'tabby' ? (
                                        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                      ) : (
                                        <svg className="w-5 h-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                  <p className={`text-[10px] mt-1.5 flex items-center gap-1 ${selectedMethod === 'tabby' ? 'text-emerald-600/70' : 'text-pink-600/70'}`}>
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {lang === 'ar' ? 'مطلوب لاستلام رمز التحقق (OTP)' : 'Required for receiving OTP code'}
                                  </p>
                                </div>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </section>

                  <AnimatePresence>
                    {checkoutError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 overflow-hidden"
                      >
                        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 dark:bg-rose-950/20 dark:border-rose-500/20 dark:text-rose-400">
                          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {checkoutError}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={
                      isPlacingOrder ||
                      cartItems.length === 0
                    }
                    className="w-full bg-primary text-primary-foreground py-5 rounded-xl font-medium text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPlacingOrder ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent"></div>
                        <span>{t('processing', lang)}</span>
                      </div>
                    ) : (
                      <>
                        {t('pay', lang)}
                      </>
                    )}

                  </button>
                </>
              )}
            </motion.div>
          </div>

          {/* Order Summary Form */}
          <div className="lg:col-span-5">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-background p-8 rounded-2xl shadow-sm border border-border/50 sticky top-24">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6">{t('order_summary', lang)}</h2>

              <div className="space-y-6 mb-8">
                {cartItems.map((item) => {
                  const itemName = typeof item.name === 'object' && item.name !== null
                    ? (item.name[lang] || item.name.en || "Product Name")
                    : (item.name || "Product Name");

                  return (
                    <div key={item.cart_item_id} className="flex gap-4">
                      <div className="relative w-16 h-20 rounded bg-secondary overflow-hidden flex-shrink-0 border border-border">
                        <Image src={item.image} alt={itemName} fill className="object-cover" />
                        <div className="absolute top-0 right-0 w-5 h-5 bg-foreground text-background text-xs rounded-bl flex items-center justify-center font-medium">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h3 className="font-medium text-sm text-foreground">{itemName}</h3>
                        <div className="text-xs text-muted-foreground mt-1">
                          {typeof item.color === 'object' && item.color !== null ? (item.color[lang] || item.color.en) : item.color} / {typeof item.size === 'object' && item.size !== null ? (item.size[lang] || item.size.en) : item.size}
                        </div>
                      </div>
                      <div className="font-semibold text-sm flex items-center gap-1 text-foreground">

                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Section */}
              <div className="mb-8 p-4 bg-muted/30 rounded-xl border border-border/50">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder={t('coupon_code', lang)}
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon || !couponCode}
                    className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {applyingCoupon ? <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent animate-spin rounded-full"></div> : t('apply', lang)}
                  </button>
                </div>
                {couponError && (
                  <p className="text-xs text-rose-500 mt-2 font-medium">{couponError}</p>
                )}
                {appliedCoupon && (
                  <div className="mt-3 flex items-center justify-between text-xs py-2 px-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Check className="w-3 h-3" />
                      <span>{t('discount', lang)}: {appliedCoupon.code}</span>
                    </div>
                    <button onClick={() => setAppliedCoupon(null)} className="text-rose-500 hover:text-rose-600">{t('delete', lang)}</button>
                  </div>
                )}
              </div>

              <div className="space-y-3 pb-6 border-b border-border text-sm">
                {/* <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('subtotal', lang)}</span>
                  <span className="font-medium flex items-center text-foreground">
                    {finalCurrencySymbol.includes('.svg') || finalCurrencySymbol.includes('.png') ? (
                      <img src={finalCurrencySymbol} alt="Currency" className="h-4 w-auto object-contain inline-block mr-1" />
                    ) : (
                      <span className="mr-1">{finalCurrencySymbol}</span>
                    )}
                    {subtotal.toFixed(2)}
                  </span>
                </div> */}
                {/* {appliedCoupon && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>{t('discount', lang)} ({appliedCoupon.code})</span>
                    <span className="flex items-center">
                      -
                      {finalCurrencySymbol.includes('.svg') || finalCurrencySymbol.includes('.png') ? (
                        <img src={finalCurrencySymbol} alt="Currency" className="h-4 w-auto object-contain inline-block mr-1" />
                      ) : (
                        <span className="mr-1">{finalCurrencySymbol}</span>
                      )}
                      {discount.toFixed(2)}
                    </span>
                  </div>
                )} */}
                {/* <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('shipping', lang)}</span>
                  <span className="font-medium flex items-center text-foreground">
                    {shipping === 0 ? (
                      <span className="text-green-600">{t('free', lang) || "Free"}</span>
                    ) : (
                      <>
                        {finalCurrencySymbol.includes('.svg') || finalCurrencySymbol.includes('.png') ? (
                          <img src={finalCurrencySymbol} alt="Currency" className="h-4 w-auto object-contain inline-block mr-1" />
                        ) : (
                          <span className="mr-1">{finalCurrencySymbol}</span>
                        )}
                        {shipping.toFixed(2)}
                      </>
                    )}
                  </span>
                </div> */}
                {/* <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('taxes', lang)} {pricesIncludeTax ? '(Inclusive)' : ''}</span>
                  <span className="font-medium flex items-center text-foreground">
                    {finalCurrencySymbol.includes('.svg') || finalCurrencySymbol.includes('.png') ? (
                      <img src={finalCurrencySymbol} alt="Currency" className="h-4 w-auto object-contain inline-block mr-1" />
                    ) : (
                      <span className="mr-1">{finalCurrencySymbol}</span>
                    )}
                    {taxes.toFixed(2)}
                  </span>
                </div> */}
              </div>

              {/* <div className="pt-6 flex justify-between items-center text-xl">
                <span className="font-bold text-foreground">{t('total', lang)}</span>
                <span className="font-bold flex items-center text-foreground">
                  {finalCurrencySymbol.includes('.svg') || finalCurrencySymbol.includes('.png') ? (
                    <img src={finalCurrencySymbol} alt="Currency" className="h-5 w-auto object-contain inline-block mr-1" />
                  ) : (
                    <span className="mr-1">{finalCurrencySymbol}</span>
                  )}
                  {total.toFixed(2)}
                </span>
              </div> */}
            </motion.div>
          </div>
        </div>
      </div>

      <MapPickerModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        initialLat={newAddress.latitude}
        initialLng={newAddress.longitude}
        onAddressSelect={async (data) => {
          // Always use the admin-configured default country if set (e.g. Saudi Arabia)
          // Never let reverse geocode override the country
          let determinedCountryId = defaultCountryId || newAddress.country_id;
          let determinedZoneId = newAddress.zone_id;
          let determinedStateName = data.state || newAddress.state;

          // Only try to match country from map if NO store-level default is configured
          if (!defaultCountryId && data.country_code && countries.length > 0) {
            const matchedCountry = countries.find(c => c.iso_code_2?.toLowerCase() === data.country_code.toLowerCase());
            if (matchedCountry) {
              determinedCountryId = matchedCountry.id.toString();

              // Load zones if we switched country
              if (determinedCountryId !== newAddress.country_id) {
                try {
                  const newZones = await fetchZones(determinedCountryId);
                  setZones(newZones);

                  if (data.state) {
                    const matchedZone = newZones.find((z: any) => z.name.toLowerCase().includes(data.state.toLowerCase()) || data.state.toLowerCase().includes(z.name.toLowerCase()));
                    determinedZoneId = matchedZone ? matchedZone.id.toString() : '';
                    determinedStateName = matchedZone ? matchedZone.name : data.state;
                  } else {
                    determinedZoneId = '';
                  }
                } catch (e) {
                  console.error('Failed to load zones for map geolocate', e);
                }
              }
            }
          } else if (defaultCountryId && data.state && zones.length > 0) {
            // Default country is set — just try to match zone from the returned state name within existing zones
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-foreground mb-3 font-serif">{t('delete', lang)} {t('address', lang)}</h3>
            <p className="text-muted-foreground text-sm mb-6">
              {t('confirm_delete_addr', lang)}
            </p>
            <div className="flex gap-3 justify-end w-full">
              <button
                onClick={() => setAddressToDelete(null)}
                className="px-4 py-2 rounded-lg font-medium text-foreground bg-secondary hover:bg-secondary/80 transition-colors"
                disabled={isDeletingAddress !== null}
              >
                {t('cancel', lang)}
              </button>
              <button
                onClick={confirmDeleteAddress}
                className="px-4 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
                disabled={isDeletingAddress !== null}
              >
                {isDeletingAddress !== null ? t('deleting', lang) : t('delete', lang)}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Order Success Overlay */}
      <AnimatePresence>
        {isOrderSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-background border border-border rounded-3xl p-8 sm:p-12 max-w-md w-full shadow-2xl text-center space-y-6"
            >
              {(selectedMethod === 'tabby' || selectedMethod === 'tamara') ? (
                <>
                  <div className="w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-500/20">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h2 className="text-3xl font-bold text-foreground font-serif">
                    {lang === 'ar' ? 'جاري تحويلك...' : 'Redirecting...'}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedMethod === 'tabby'
                      ? (lang === 'ar' ? 'جاري تحويلك إلى صفحة تابي للدفع الآمن' : 'Redirecting you to Tabby secure payment page')
                      : (lang === 'ar' ? 'جاري تحويلك إلى صفحة تمارا للدفع الآمن' : 'Redirecting you to Tamara secure payment page')
                    }
                  </p>
                  <p className="text-xs text-muted-foreground/60 italic">
                    {lang === 'ar' ? 'يرجى عدم إغلاق هذه النافذة' : 'Please do not close this window'}
                  </p>
                </>
              ) : (
                <>
                  <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 10 }}
                      className="absolute inset-0 bg-green-500 rounded-full"
                    />
                    <motion.div
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      <Check className="w-12 h-12 text-white relative z-10" />
                    </motion.div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold font-serif text-foreground">{t('order_placed_success', lang)}!</h3>
                    <p className="text-muted-foreground">{t('thank_you_order', lang)}</p>
                  </div>

                  <div className="py-4 px-6 bg-muted/50 rounded-2xl border border-border inline-block">
                    <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">{t('order_number', lang)}</span>
                    <span className="text-xl font-mono font-bold text-primary">#{placedOrderNumber}</span>
                  </div>

                  <div className="flex flex-col items-center gap-3 pt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                      {lang === 'ar' ? 'جاري تحضير الإيصال...' : 'Preparing your receipt...'}
                    </div>
                    <p className="text-xs text-muted-foreground/60 italic">{lang === 'ar' ? 'يرجى عدم إغلاق النافذة' : 'Please do not close the window'}</p>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
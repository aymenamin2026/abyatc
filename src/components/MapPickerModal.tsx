"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";

// Load map component dynamically since Leaflet requires window
const AddressMap = dynamic(() => import("./AddressMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-secondary/30 rounded-lg flex items-center justify-center border border-border">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  ),
});

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressSelect: (addressData: any) => void;
  initialLat?: string;
  initialLng?: string;
}

export default function MapPickerModal({ isOpen, onClose, onAddressSelect, initialLat, initialLng }: MapPickerModalProps) {
  const [position, setPosition] = useState({
    lat: initialLat ? parseFloat(initialLat) : 24.7136,
    lng: initialLng ? parseFloat(initialLng) : 46.6753
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    if (isOpen) {
      if (initialLat && initialLng) {
        setPosition({
          lat: parseFloat(initialLat),
          lng: parseFloat(initialLng)
        });
        setZoom(16);
      } else {
        // Auto-detect location if none provided
        setIsLocating(true);
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              setZoom(16);
              setIsLocating(false);
            },
            (error) => {
              setIsLocating(false);
              // Fallback to default position if blocked/fails
              setPosition({ lat: 24.7136, lng: 46.6753 });
              setZoom(13);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
          );
        } else {
          setIsLocating(false);
          setPosition({ lat: 24.7136, lng: 46.6753 });
          setZoom(13);
        }
      }
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isOpen, initialLat, initialLng]);

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!searchQuery || searchQuery.length < 3) return;

    setIsSearching(true);
    try {
      // 1. جعل البحث مفتوحاً وذكياً، وإزالة القيود الصارمة السابقة ليعمل في اليمن والسعودية وأي مكان
      // يمكنك تمرير رمز الدولة ديناميكياً إذا أردت لاحقاً مثل: &countrycodes=sa,ye
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&accept-language=ar,en`;

      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'ar, en',
          // إضافة User-Agent لضمان عدم حظر الطلبات من خوادم Nominatim المجانية
          'User-Agent': 'Abyatc_ECommerce_Store_Application'
        }
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      setSearchResults(data);
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result: any) => {
    setPosition({ lat: parseFloat(result.lat), lng: parseFloat(result.lon) });
    setZoom(16); // رفع مستوى التقريب ليرى العميل الشارع والحي بوضوح
    setSearchQuery(result.display_name);
    setSearchResults([]);
  };
  const handleGeolocate = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsLocating(false);
        },
        (error) => {
          setIsLocating(false);
          alert('Unable to retrieve your location.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setIsLocating(false);
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleConfirmLocation = async () => {
    setIsConfirming(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&accept-language=en,ar`);
      const data = await res.json();

      let address_1 = '';
      let city = '';
      let postcode = '';
      let country_code = '';
      let state = '';
      let region = '';

      if (data && data.address) {
        const road = data.address.road || data.address.pedestrian || '';
        const suburb = data.address.suburb || data.address.neighbourhood || '';
        address_1 = `${road} ${suburb}`.trim();
        city = data.address.city || data.address.town || data.address.village || data.address.county || '';
        postcode = data.address.postcode || '';
        country_code = (data.address.country_code || '').toUpperCase();
        state = data.address.state || '';
        region = data.address.region || '';
      }

      onAddressSelect({
        latitude: position.lat.toString(),
        longitude: position.lng.toString(),
        address_1,
        city,
        postcode,
        country_code,
        state: state || region
      });
      onClose();
    } catch (err) {
      console.error('Geocoding error:', err);
      // Still send coords even if reverse geocoding fails
      onAddressSelect({
        latitude: position.lat.toString(),
        longitude: position.lng.toString(),
        address_1: '', city: '', postcode: '', country_code: '', state: ''
      });
      onClose();
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-serif text-xl font-bold text-foreground">Pick Location on Map</h3>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4 overflow-y-auto">
          <div className="flex gap-2 relative">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground" />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
            </button>
            <button
              onClick={handleGeolocate}
              disabled={isLocating}
              className="px-4 py-2 border border-border text-foreground rounded-lg font-medium hover:bg-secondary/50 transition-colors disabled:opacity-50 flex items-center justify-center"
              title="Use my current location"
            >
              {isLocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5 text-primary" />}
            </button>

            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-10 overflow-hidden">
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectResult(result)}
                    className="w-full text-left px-4 py-3 hover:bg-secondary/50 border-b border-border last:border-0 text-sm transition-colors text-foreground"
                  >
                    {result.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative border border-border rounded-lg overflow-hidden bg-secondary/10">
            <AddressMap position={position} zoom={zoom} onPositionChange={setPosition} />
          </div>
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-3 bg-secondary/10">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-border font-medium text-foreground hover:bg-secondary transition-colors">
            Cancel
          </button>
          <button
            onClick={handleConfirmLocation}
            disabled={isConfirming}
            className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isConfirming ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Location'}
          </button>
        </div>
      </div>
    </div>
  );
}

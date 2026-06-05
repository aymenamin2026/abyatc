"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default icon issue with Leaflet in React
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface AddressMapProps {
  position: { lat: number; lng: number };
  onPositionChange: (pos: { lat: number; lng: number }) => void;
  zoom: number;
}

function LocationMarker({ position, onPositionChange }: AddressMapProps) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          onPositionChange(marker.getLatLng());
        },
      }}
    />
  );
}

function MapUpdater({ position, zoom }: { position: { lat: number; lng: number }, zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([position.lat, position.lng], zoom, {
      animate: true,
      duration: 1.5
    });
  }, [position, zoom, map]);
  return null;
}

// Saudi Arabia bounding box
// SW: (16.3, 36.5)  NE: (32.2, 55.7)
const SAUDI_BOUNDS = L.latLngBounds(
  L.latLng(16.0, 36.0),  // SW corner
  L.latLng(32.5, 56.0),  // NE corner
);

function BoundsEnforcer() {
  const map = useMap();
  useEffect(() => {
    map.setMaxBounds(SAUDI_BOUNDS);
    map.setMinZoom(5);
  }, [map]);
  return null;
}

export default function AddressMap({ position, zoom, onPositionChange }: AddressMapProps) {
  return (
    <MapContainer
      center={position}
      zoom={zoom}
      minZoom={5}
      maxBounds={SAUDI_BOUNDS}
      maxBoundsViscosity={1.0}
      scrollWheelZoom={true}
      style={{ height: "400px", width: "100%", borderRadius: "0.5rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <BoundsEnforcer />
      <MapUpdater position={position} zoom={zoom} />
      <LocationMarker position={position} zoom={zoom} onPositionChange={onPositionChange} />
    </MapContainer>
  );
}

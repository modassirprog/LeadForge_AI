"use client";

import React, { useEffect, useRef } from "react";
import { BusinessLead } from "@/types";
import { useApp } from "@/context/AppContext";

interface MapComponentProps {
  leads: BusinessLead[];
  selectedLead: BusinessLead | null;
  onSelectLead: (lead: BusinessLead) => void;
  userLocation: { lat: number; lng: number } | null;
}

export function MapComponent({ leads, selectedLead, onSelectLead, userLocation }: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const handleCenterUserLocation = () => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 14, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    async function initMap() {
      const L = (await import("leaflet")).default;
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Prioritize user location when available, otherwise selected lead or default center
      const centerLat = userLocation?.lat ?? (selectedLead ? selectedLead.latitude : 19.076);
      const centerLng = userLocation?.lng ?? (selectedLead ? selectedLead.longitude : 72.8777);

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: userLocation ? 14 : 12,
        zoomControl: false,
        attributionControl: false,
      });

      // Dark mode OSM tiles with invert filter for glowing dark streets
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      // Apply dark mode overlay to tiles
      mapContainerRef.current.style.filter = "invert(1) hue-rotate(180deg) contrast(0.9) brightness(0.7)";
      mapContainerRef.current.style.background = "#0a0a0c";

      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapInstanceRef.current = map;

      // Add user location marker (glowing blue beacon)
      if (userLocation) {
        renderUserMarker(L, map, userLocation);
      }

      renderPins(L, map);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update user marker when userLocation changes
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation || typeof window === "undefined") return;
    import("leaflet").then(({ default: L }) => {
      renderUserMarker(L, mapInstanceRef.current, userLocation);
      // Auto fly to user location if no lead is currently selected
      if (!selectedLead) {
        mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 14, {
          duration: 1.2,
        });
      }
    });
  }, [userLocation]);

  const renderUserMarker = (L: any, map: any, loc: { lat: number; lng: number }) => {
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    const userIcon = L.divIcon({
      className: "user-location-marker",
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="
            position: absolute; width: 40px; height: 40px; border-radius: 50%;
            background: rgba(14, 165, 233, 0.25); border: 1.5px solid #0ea5e9;
            animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
          <div style="
            position: relative; width: 22px; height: 22px; border-radius: 50%;
            background: #0ea5e9; border: 3px solid #ffffff; box-shadow: 0 0 16px rgba(14,165,233,0.9);
            display: flex; align-items: center; justify-content: center;
          ">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: #ffffff;"></div>
          </div>
          <div style="
            position: absolute; bottom: -18px; left: 50%; transform: translateX(-50%);
            background: #0284c7; color: #ffffff; font-size: 9px; font-weight: 700;
            padding: 1px 6px; border-radius: 9999px; white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.6); letter-spacing: 0.5px;
          ">
            YOU ARE HERE
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    userMarkerRef.current = L.marker([loc.lat, loc.lng], { 
      icon: userIcon, 
      zIndexOffset: 1000, 
      title: "Your Location" 
    }).addTo(map);
  };

  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === "undefined") return;
    import("leaflet").then(({ default: L }) => {
      renderPins(L, mapInstanceRef.current);
    });
  }, [leads, selectedLead]);

  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLead) return;
    mapInstanceRef.current.flyTo([selectedLead.latitude, selectedLead.longitude], 14, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [selectedLead]);

  const renderPins = (L: any, map: any) => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    leads.forEach((lead) => {
      const isSelected = selectedLead?.id === lead.id;
      const score = lead.score.total_score;

      let pinColor = "#22d3ee"; // Cyan glow
      let glowColor = "rgba(34, 211, 238, 0.5)";
      let pulse = "";
      if (score >= 80) {
        pinColor = "#f43f5e"; // Rose red
        glowColor = "rgba(244, 63, 94, 0.7)";
        pulse = `animation: pinPulse 2s infinite;`;
      } else if (score >= 50) {
        pinColor = "#f59e0b"; // Amber
        glowColor = "rgba(245, 158, 11, 0.6)";
      }

      const iconHtml = `
        <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <div style="
            position: absolute;
            width: ${isSelected ? "42px" : "32px"};
            height: ${isSelected ? "42px" : "32px"};
            border-radius: 50%;
            background: ${pinColor};
            box-shadow: 0 0 ${isSelected ? "24px" : "16px"} ${glowColor};
            border: 3px solid #ffffff;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.25s ease;
            transform: ${isSelected ? "scale(1.15)" : "scale(1)"};
            ${pulse}
          ">
            <span style="color: #ffffff; font-size: 11px; font-weight: 800; font-family: monospace; text-shadow: 0 0 4px rgba(0,0,0,0.8);">
              ${score}
            </span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-radar-pin",
        html: iconHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([lead.latitude, lead.longitude], { icon: customIcon }).addTo(map);
      marker.on("click", () => { onSelectLead(lead); });
      markersRef.current.push(marker);
    });
  };

  return (
    <div className="relative w-full h-full bg-zinc-950 overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] z-10" />
      
      {/* Top Legend Bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-white/10 backdrop-blur-md text-[11px] font-medium text-zinc-300 shadow-xl">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          Urgent (80+)
        </span>
        <span className="text-zinc-500">|</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Moderate (50-79)
        </span>
        <span className="text-zinc-500">|</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-500" />
          Leads ({leads.length})
        </span>
      </div>

      {/* Floating Center On Me Button */}
      {userLocation && (
        <button
          onClick={handleCenterUserLocation}
          className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-xs font-semibold text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)] backdrop-blur-md transition-all active:scale-95 cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          📍 Fly To My Location
        </button>
      )}
    </div>
  );
}

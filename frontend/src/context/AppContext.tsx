"use client";

import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { BusinessLead, SearchFilters } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

interface ToastNotification {
  id: string;
  type: "success" | "info" | "warning";
  title: string;
  message?: string;
}

interface AppContextType {
  leads: BusinessLead[];
  filteredLeads: BusinessLead[];
  selectedLead: BusinessLead | null;
  searchFilters: SearchFilters;
  isScanning: boolean;
  scanProgress: number;
  auditDrawerOpen: boolean;
  outreachStudioOpen: boolean;
  toasts: ToastNotification[];
  backendConnected: boolean;
  userLocation: { lat: number; lng: number } | null;
  locationPermission: "granted" | "denied" | "prompt" | null;
  setSelectedLead: (lead: BusinessLead | null) => void;
  setSearchFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  openAuditDrawer: (lead: BusinessLead) => void;
  closeAuditDrawer: () => void;
  openOutreachStudio: (lead: BusinessLead) => void;
  closeOutreachStudio: () => void;
  updateLeadStatus: (id: string, status: BusinessLead["status"]) => void;
  triggerRadarScan: (overrideLocation?: boolean) => void;
  clearAllLeads: () => Promise<void>;
  requestUserLocation: () => void;
  addToast: (title: string, message?: string, type?: "success" | "info" | "warning") => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<BusinessLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<BusinessLead | null>(null);
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const [outreachStudioOpen, setOutreachStudioOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [backendConnected, setBackendConnected] = useState(false);

  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    city: "All Cities",
    category: "All Businesses & Shops",
    radius_km: 15,
    query: "",
    status_filter: "ALL",
  });

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<"granted" | "denied" | "prompt" | null>("prompt");

  const addToast = (title: string, message?: string, type: "success" | "info" | "warning" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Request location permission on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationPermission("denied");
      addToast("Geolocation Not Supported", "Your browser does not support geolocation.", "warning");
      return;
    }
    setLocationPermission("prompt");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationPermission("granted");
        addToast("Location Access", `Scanning around ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`, "info");
      },
      (err) => {
        setLocationPermission("denied");
        addToast("Location Denied", "Enable location permission to scan around you.", "warning");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // Fetch leads from backend on mount if reachable
  useEffect(() => {
    async function fetchBackendLeads() {
      try {
        const res = await fetch(`${API_BASE}/businesses`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setLeads(data);
            setSelectedLead(data[0]);
            setBackendConnected(true);
            addToast("Backend Connected", "Synchronized live leads from FastAPI database.", "success");
          } else {
            setBackendConnected(true);
            addToast("Backend Connected", "No leads found. Scan your location to discover businesses.", "info");
          }
        }
      } catch (err) {
        setBackendConnected(false);
        addToast("Backend Offline", "Start the FastAPI backend on port 8000 to scan live businesses.", "warning");
      }
    }
    fetchBackendLeads();
  }, []);

  const updateLeadStatus = async (id: string, status: BusinessLead["status"]) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, status } : lead))
    );
    if (selectedLead?.id === id) {
      setSelectedLead((prev) => (prev ? { ...prev, status } : null));
    }

    try {
      await fetch(`${API_BASE}/businesses/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
    } catch (e) {
      // Local state already updated
    }

    addToast("Status Updated", `Lead status changed to ${status}`, "info");
  };

  const openAuditDrawer = (lead: BusinessLead) => {
    setSelectedLead(lead);
    setAuditDrawerOpen(true);
  };

  const closeAuditDrawer = () => {
    setAuditDrawerOpen(false);
  };

  const openOutreachStudio = (lead: BusinessLead) => {
    setSelectedLead(lead);
    setOutreachStudioOpen(true);
  };

  const closeOutreachStudio = () => {
    setOutreachStudioOpen(false);
  };

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      addToast("Location Unavailable", "Geolocation is not supported by your browser.", "warning");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setLocationPermission("granted");
        setSearchFilters(prev => ({ ...prev, city: "My Location" }));
        addToast("Location Centered", `Pinned at ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`, "success");
      },
      (err) => {
        setLocationPermission("denied");
        addToast("Location Denied", "Please allow location permission in your browser.", "warning");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const clearAllLeads = async () => {
    try {
      await fetch(`${API_BASE}/businesses`, { method: "DELETE" });
      setLeads([]);
      setSelectedLead(null);
      addToast("Leads Cleared", "Database purged. Ready to scan your real location.", "info");
    } catch (e) {
      setLeads([]);
      setSelectedLead(null);
      addToast("Leads Cleared", "Local leads reset.", "info");
    }
  };

  const triggerRadarScan = async (overrideLocation: boolean = false) => {
    setIsScanning(true);
    setScanProgress(15);

    let lat: number | undefined;
    let lng: number | undefined;
    let cityToScan = searchFilters.city;

    const isLocationScan = overrideLocation || searchFilters.city === "My Location" || searchFilters.city === "All Cities";

    if (isLocationScan && userLocation) {
      lat = userLocation.lat;
      lng = userLocation.lng;
      cityToScan = "Current Location";
    } else if (searchFilters.city === "All Cities" || !searchFilters.city.trim()) {
      cityToScan = "Mumbai";
    }

    const isAllCategories = searchFilters.category === "All Categories" || searchFilters.category === "All Businesses & Shops";
    const catToScan = isAllCategories ? "All Businesses & Shops" : searchFilters.category;

    const progressTimer = setInterval(() => {
      setScanProgress((prev) => (prev >= 85 ? prev : prev + 20));
    }, 400);

    try {
      const res = await fetch(`${API_BASE}/discovery/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: cityToScan,
          category: catToScan,
          radius_km: searchFilters.radius_km,
          source: "GOOGLE_PLACES",
          latitude: lat,
          longitude: lng,
        })
      });

      clearInterval(progressTimer);
      setScanProgress(100);

      if (res.ok) {
        const refreshRes = await fetch(`${API_BASE}/businesses`);
        if (refreshRes.ok) {
          const updated = await refreshRes.json();
          setLeads(updated);
          if (updated.length > 0) setSelectedLead(updated[0]);
          addToast("Scan Complete", `Discovered ${updated.length} leads via Google Places & OSM!`, "success");
        }
      } else {
        addToast("Radar Completed", "Scan finished with no new results.", "info");
      }
    } catch (err) {
      setScanProgress(100);
      addToast("Radar Error", "Scan failed. Make sure the backend is running on port 8000.", "warning");
    } finally {
      setTimeout(() => {
        setIsScanning(false);
        setScanProgress(0);
      }, 500);
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // 1. City / Location matching
      if (
        searchFilters.city !== "All Cities" &&
        searchFilters.city !== "My Location" &&
        searchFilters.city !== "Current Location"
      ) {
        const targetCity = searchFilters.city.toLowerCase().trim();
        const leadCity = (lead.city || "").toLowerCase().trim();
        const matchesCity =
          leadCity.includes(targetCity) ||
          targetCity.includes(leadCity) ||
          leadCity === "current location" ||
          leadCity === "nearby";
        if (!matchesCity) {
          return false;
        }
      }

      // 2. Category matching
      const targetCat = searchFilters.category.trim().toLowerCase();
      const leadCat = (lead.category || "").toLowerCase();

      const isAllCat =
        targetCat === "all categories" ||
        targetCat === "all businesses & shops" ||
        targetCat === "all" ||
        targetCat === "";

      if (!isAllCat) {
        let matches = leadCat.includes(targetCat);

        // Smart semantic mappings for category presets & searches
        if (!matches) {
          if (targetCat.includes("retail") || targetCat.includes("shop") || targetCat.includes("store")) {
            matches = /store|shop|mall|market|clothing|electronics|grocery|retail|book|hardware|supermarket|department|boutique/.test(leadCat);
          } else if (targetCat.includes("restaurant") || targetCat.includes("cafe")) {
            matches = /restaurant|cafe|food|dining|bakery|bistro|bar|pizza|burger|fast_food/.test(leadCat);
          } else if (targetCat.includes("bakery") || targetCat.includes("food")) {
            matches = /bakery|pastry|cake|sweet|confectionery|food|deli/.test(leadCat);
          } else if (targetCat.includes("salon") || targetCat.includes("spa")) {
            matches = /salon|spa|beauty|hair|barber|parlour|massage/.test(leadCat);
          } else if (targetCat.includes("auto") || targetCat.includes("repair")) {
            matches = /auto|car|motor|repair|mechanic|service|tyre|garage/.test(leadCat);
          } else if (targetCat.includes("gym") || targetCat.includes("fitness")) {
            matches = /gym|fitness|sports|crossfit|yoga|training/.test(leadCat);
          } else if (targetCat.includes("clinic") || targetCat.includes("health")) {
            matches = /clinic|hospital|doctor|dental|health|pharmacy|medical/.test(leadCat);
          } else if (targetCat.includes("hotel") || targetCat.includes("resort")) {
            matches = /hotel|resort|lodge|guest|inn|hostel/.test(leadCat);
          } else if (targetCat.includes("coaching") || targetCat.includes("academ")) {
            matches = /coaching|academy|school|classes|institute|education|college/.test(leadCat);
          }
        }

        if (!matches) {
          return false;
        }
      }
      if (searchFilters.status_filter === "HIGH_URGENCY" && lead.score.total_score < 80) {
        return false;
      }
      if (searchFilters.status_filter === "AUDITED" && lead.audit.website_status === "NO_WEBSITE") {
        return false;
      }
      if (searchFilters.status_filter === "CONTACTED" && lead.status !== "CONTACTED") {
        return false;
      }
      if (searchFilters.status_filter === "CONVERTED" && lead.status !== "CONVERTED") {
        return false;
      }
      if (searchFilters.query.trim()) {
        const q = searchFilters.query.toLowerCase();
        const matchesName = lead.name.toLowerCase().includes(q);
        const matchesLocality = (lead.locality || "").toLowerCase().includes(q);
        const matchesCategory = lead.category.toLowerCase().includes(q);
        return matchesName || matchesLocality || matchesCategory;
      }
      return true;
    });
  }, [leads, searchFilters]);

  return (
    <AppContext.Provider
      value={{
        leads,
        filteredLeads,
        selectedLead,
        searchFilters,
        isScanning,
        scanProgress,
        auditDrawerOpen,
        outreachStudioOpen,
        toasts,
        backendConnected,
        userLocation,
        locationPermission,
        setSelectedLead,
        setSearchFilters,
        openAuditDrawer,
        closeAuditDrawer,
        openOutreachStudio,
        closeOutreachStudio,
        updateLeadStatus,
        triggerRadarScan,
        clearAllLeads,
        requestUserLocation,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

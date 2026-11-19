"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { MapComponent } from "@/components/MapComponent";
import { 
  Search, 
  MapPin, 
  Filter, 
  Sparkles, 
  Globe, 
  Star, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Radar, 
  ArrowRight, 
  X,
  ExternalLink,
  Sliders,
  Flame,
  Trash2,
  Navigation
} from "lucide-react";
import { getScoreBadgeStyles, getWebsiteStatusBadge } from "@/lib/utils";

const PRESET_CITIES = [
  "My Location",
  "All Cities", 
  "Delhi NCR", 
  "Mumbai", 
  "Bengaluru", 
  "Pune", 
  "Hyderabad", 
  "Chennai", 
  "Ahmedabad", 
  "Kolkata", 
  "Jaipur", 
  "Chandigarh", 
  "Goa"
];

const CATEGORIES = [
  "All Businesses & Shops",
  "Retail Shops & Stores",
  "Restaurants & Cafes",
  "Bakeries & Food",
  "Salons & Spas",
  "Automobile & Repair",
  "Gyms & Fitness",
  "Clinics & Healthcare",
  "Hotels & Resorts",
  "Coaching & Academies",
];

export function RadarScreen() {
  const {
    filteredLeads,
    selectedLead,
    setSelectedLead,
    searchFilters,
    setSearchFilters,
    triggerRadarScan,
    clearAllLeads,
    requestUserLocation,
    isScanning,
    scanProgress,
    openAuditDrawer,
    openOutreachStudio,
    userLocation,
    locationPermission,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"all" | "urgent">("all");
  const [customCityMode, setCustomCityMode] = useState(false);
  const [customCategoryMode, setCustomCategoryMode] = useState(false);

  const displayLeads = activeTab === "urgent" 
    ? filteredLeads.filter(l => l.score.total_score >= 80)
    : filteredLeads;

  return (
    <section 
      id="radar-section"
      className="relative h-screen w-full flex flex-col bg-zinc-950 text-white snap-start overflow-hidden pt-16 border-t border-zinc-800"
    >
      {/* Sub Header Bar */}
      <div className="h-12 px-6 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-sm font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
              Live Geographic Radar
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                {displayLeads.length} leads in viewport
              </span>
            </h2>
          </div>
        </div>

        {/* Scan Actions & Progress */}
        <div className="flex items-center gap-2.5">
          {/* Clear Leads Button */}
          {filteredLeads.length > 0 && !isScanning && (
            <button
              onClick={clearAllLeads}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-300 border border-zinc-800 hover:border-rose-800/60 text-xs transition-colors flex items-center gap-1.5 active:scale-95 cursor-pointer"
              title="Purge all leads to start fresh"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Leads</span>
            </button>
          )}

          {/* Location Request Prompt */}
          {!userLocation && (
            <button
              onClick={requestUserLocation}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-cyan-950/40 text-zinc-300 hover:text-cyan-300 border border-zinc-800 hover:border-cyan-500/50 text-xs transition-colors flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              <span>Detect My Location</span>
            </button>
          )}

          {isScanning && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400">Scanning Places: {scanProgress}%</span>
              <div className="w-24 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          )}

          {!isScanning && (
            <button
              onClick={() => triggerRadarScan(userLocation ? true : false)}
              className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Radar className="w-3.5 h-3.5" />
              {userLocation ? "Scan Around My Location" : "Scan Selected City"}
            </button>
          )}
        </div>
      </div>

      {/* Split Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Filters & Feed (35% width, min 380px) */}
        <div className="w-full md:w-[380px] lg:w-[420px] h-full flex flex-col border-r border-zinc-800 bg-zinc-950/95 z-10 shrink-0">
          {/* Filter Form Controls */}
          <div className="p-4 border-b border-zinc-800/80 space-y-3 bg-zinc-900/30">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by business name, locality..."
                value={searchFilters.query}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, query: e.target.value }))}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* City & Category Selectors */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-mono uppercase text-zinc-500 block">City / Target</label>
                  <button 
                    onClick={() => setCustomCityMode(!customCityMode)}
                    className="text-[10px] text-cyan-400 hover:underline"
                  >
                    {customCityMode ? "Presets" : "Type City"}
                  </button>
                </div>

                {customCityMode ? (
                  <input
                    type="text"
                    placeholder="Enter city or locality..."
                    value={searchFilters.city}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500"
                  />
                ) : (
                  <select
                    value={searchFilters.city}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                  >
                    {PRESET_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-mono uppercase text-zinc-500 block">Category</label>
                  <button 
                    onClick={() => setCustomCategoryMode(!customCategoryMode)}
                    className="text-[10px] text-cyan-400 hover:underline"
                  >
                    {customCategoryMode ? "Presets" : "Type Category"}
                  </button>
                </div>

                {customCategoryMode ? (
                  <input
                    type="text"
                    placeholder="e.g. bakery, salon, hardware..."
                    value={searchFilters.category}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500"
                  />
                ) : (
                  <select
                    value={searchFilters.category}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                )}
              </div>
            </div>

            {/* Radius & Segment Toggle */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-xs">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === "all" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  All ({filteredLeads.length})
                </button>
                <button
                  onClick={() => setActiveTab("urgent")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 ${
                    activeTab === "urgent" ? "bg-rose-500/20 text-rose-300" : "text-zinc-400 hover:text-rose-300"
                  }`}
                >
                  <Flame className="w-3 h-3 text-rose-400" />
                  High Urgency ({filteredLeads.filter(l => l.score.total_score >= 80).length})
                </button>
              </div>

              {/* Radius Select */}
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                <span>Radius:</span>
                <select
                  value={searchFilters.radius_km}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, radius_km: Number(e.target.value) }))}
                  className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-zinc-200 text-xs"
                >
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={15}>15 km</option>
                  <option value={25}>25 km</option>
                </select>
              </div>
            </div>
          </div>

          {/* Discovery Feed List */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-900/80 p-2 space-y-1">
            {displayLeads.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center h-full my-auto text-zinc-400">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
                  <Radar className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-200">No leads discovered yet</h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs leading-relaxed">
                  Database is clean. Click below to scan real businesses around your location via Google Places!
                </p>
                <button
                  onClick={() => triggerRadarScan(userLocation ? true : false)}
                  className="mt-4 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 cursor-pointer"
                >
                  <Radar className="w-3.5 h-3.5" />
                  {userLocation ? "Scan Around My Location" : "Scan Selected City"}
                </button>
              </div>
            ) : (
              displayLeads.map((lead) => {
                const isSelected = selectedLead?.id === lead.id;
                const scoreStyle = getScoreBadgeStyles(lead.score.total_score);
                const webBadge = getWebsiteStatusBadge(lead.audit.website_status);

                return (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`p-3.5 rounded-xl transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-zinc-900/90 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                        : "bg-zinc-950/60 hover:bg-zinc-900/50 border-zinc-800/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-zinc-100 truncate flex items-center gap-1.5">
                          {lead.name}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-0.5">
                          <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                          <span className="truncate">{lead.locality}, {lead.city}</span>
                        </div>
                      </div>

                      {/* Opportunity Score Pill */}
                      <div className={`px-2 py-0.5 rounded-full border text-[11px] font-mono font-bold shrink-0 ${scoreStyle.bg} ${scoreStyle.text} ${scoreStyle.border}`}>
                        {lead.score.total_score}
                      </div>
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${webBadge.bg} ${webBadge.text} ${webBadge.border}`}>
                        {webBadge.label}
                      </span>

                      <span className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        {lead.star_rating} ({lead.review_count})
                      </span>

                      {lead.contact.email && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          <Mail className="w-2.5 h-2.5" />
                          MX Verified
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Map Canvas with Floating Card (65% width) */}
        <div className="flex-1 relative h-full">
          <MapComponent 
            leads={displayLeads}
            selectedLead={selectedLead}
            onSelectLead={(lead) => setSelectedLead(lead)}
            userLocation={userLocation}
          />

          {/* Floating Selected Business Card */}
          {selectedLead && (
            <div className="absolute top-16 left-6 z-30 max-w-sm w-full bg-zinc-900/95 border border-zinc-700/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl p-4 transition-all animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                      {selectedLead.category}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-[10px] text-zinc-400">{selectedLead.locality}</span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-100 mt-0.5 leading-snug">
                    {selectedLead.name}
                  </h3>
                </div>

                {/* Score Circle Badge */}
                <div className={`w-10 h-10 rounded-full border flex flex-col items-center justify-center shrink-0 ${getScoreBadgeStyles(selectedLead.score.total_score).bg} ${getScoreBadgeStyles(selectedLead.score.total_score).border}`}>
                  <span className={`text-xs font-bold font-mono ${getScoreBadgeStyles(selectedLead.score.total_score).text}`}>
                    {selectedLead.score.total_score}
                  </span>
                  <span className="text-[8px] text-zinc-400 -mt-0.5">SCORE</span>
                </div>
              </div>

              {/* Status & Evidence Callout */}
              <div className="mt-3 p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-zinc-500" />
                    Website Status:
                  </span>
                  <span className={`font-semibold ${getWebsiteStatusBadge(selectedLead.audit.website_status).text}`}>
                    {getWebsiteStatusBadge(selectedLead.audit.website_status).label}
                  </span>
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed border-t border-zinc-800/80 pt-1.5">
                  {selectedLead.ai_analysis.qualification_reason}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => openOutreachStudio(selectedLead)}
                  className="flex-1 py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-zinc-950" />
                  Generate AI Pitch
                </button>

                <button
                  onClick={() => openAuditDrawer(selectedLead)}
                  className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium transition-colors active:scale-95"
                >
                  View Audit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

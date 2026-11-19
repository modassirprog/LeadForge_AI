"use client";

import React, { useState, useEffect, useRef } from "react";
import { Radar, Database, ArrowRight, ArrowDown, ChevronDown, Sparkles, MapPin, ShieldCheck, Globe, Star } from "lucide-react";
import { SpaceBackground } from "./background/SpaceBackground";

interface HeroSectionProps {
  onScrollToRadar: () => void;
  onScrollToCRM: () => void;
}

export function HeroSection({ onScrollToRadar, onScrollToCRM }: HeroSectionProps) {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 30;
      const y = (e.clientY / innerHeight - 0.5) * 30;
      setMousePos({ x, y });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Parallax calculations
  const textTranslateY = scrollY * 0.16;
  const textOpacity = Math.max(0, 1 - scrollY / 600);
  const cardTranslateY = scrollY * -0.05;
  const cardRotateX = Math.max(0, 6 - scrollY * 0.02);
  const cardScale = Math.min(1.03, 1 + scrollY * 0.00012);

  return (
    <section 
      ref={containerRef}
      id="hero-section"
      className="relative min-h-[105vh] w-full flex flex-col justify-start items-center px-6 pt-32 pb-24 bg-[#03050a] text-white snap-start overflow-hidden select-none"
    >
      {/* =========================================================================
          PROCEDURAL THREE.JS CINEMATIC SPACE ENVIRONMENT & PLANETARY HORIZON
          ========================================================================= */}
      <SpaceBackground />

      {/* =========================================================================
          FOREGROUND EDITORIAL CONTENT (Agence Typography: Medium/Semibold Weight)
          ========================================================================= */}
      <div 
        className="relative z-10 max-w-3xl w-full mx-auto flex flex-col items-center text-center gap-6 will-change-transform"
        style={{
          transform: `translateY(${textTranslateY}px)`,
          opacity: textOpacity,
        }}
      >
        {/* Top Minimal Badge (Basalt / Agence style with glowing dot) */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-orange-500/25 bg-orange-500/10 text-xs text-orange-200/90 font-normal shadow-sm backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          <span>v2.0 — Autonomous Google Places Intelligence</span>
        </div>

        {/* Headline: Clean, Editorial, NOT Fat Bold (Basalt / Agence Style) */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium sm:font-semibold tracking-[-0.03em] text-zinc-100 leading-[1.12] max-w-2xl drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
          Find businesses with no website. Pitch them{" "}
          <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent">
            in seconds.
          </span>
        </h1>

        {/* Subtitle: Refined, balanced spacing */}
        <p className="max-w-lg text-sm sm:text-base text-zinc-400 font-normal leading-relaxed drop-shadow">
          Visually discover unindexed local businesses, audit mobile performance, 
          verify mailboxes, and deploy grounded sales pitches.
        </p>

        {/* Action Pill Dock (Agence Clean Pill Buttons) */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onScrollToRadar}
            className="px-6 py-2.5 rounded-full bg-white hover:bg-zinc-100 text-zinc-950 font-medium text-xs transition-all shadow-[0_0_24px_rgba(255,255,255,0.2)] active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            Launch Live Radar
            <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
          </button>

          <button
            onClick={onScrollToCRM}
            className="px-6 py-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 font-medium text-xs backdrop-blur-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-zinc-400" />
            Lead CRM
          </button>
        </div>
      </div>

      {/* =========================================================================
          FLOATING PILL TAGS AROUND THE CELESTIAL ARC (Agence Floating Badges)
          ========================================================================= */}
      <div className="relative z-10 w-full max-w-4xl pointer-events-none">
        {/* Left Floating Badge */}
        <div className="hidden md:flex absolute -top-12 left-4 items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/80 border border-zinc-800/80 text-[11px] text-zinc-300 shadow-xl backdrop-blur-md">
          <span className="text-orange-400">✦</span>
          <span>10,000+ Unindexed Businesses</span>
        </div>

        {/* Right Floating Badge */}
        <div className="hidden md:flex absolute -top-8 right-4 items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/80 border border-zinc-800/80 text-[11px] text-zinc-300 shadow-xl backdrop-blur-md">
          <span className="text-amber-400">📍</span>
          <span>Google Places Verified</span>
        </div>
      </div>

      {/* =========================================================================
          DESKTOP PREVIEW WINDOW MOCKUP (WITH 3D PERSPECTIVE SCROLL PARALLAX)
          ========================================================================= */}
      <div 
        onClick={onScrollToRadar}
        className="relative z-10 w-full max-w-4xl mt-12 rounded-2xl border border-zinc-800 bg-zinc-950/85 shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden cursor-pointer group transition-all duration-500 hover:border-zinc-700 backdrop-blur-2xl will-change-transform"
        style={{
          transform: `perspective(1200px) rotateX(${cardRotateX}deg) translateY(${cardTranslateY}px) scale(${cardScale}) translate(${mousePos.x * -0.15}px, ${mousePos.y * -0.15}px)`,
          transition: "transform 0.15s ease-out, border-color 0.3s ease",
          boxShadow: "0 25px 70px -15px rgba(0,0,0,0.9), 0 0 35px rgba(52, 76, 131, 0.18)"
        }}
      >
        {/* macOS Window Top Bar */}
        <div className="h-9 px-4 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="text-[11px] font-mono text-zinc-500 ml-2">leadforge-radar — live viewport</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span>Autonomous Radar Active</span>
          </div>
        </div>

        {/* Window Mock Body Teaser */}
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-3.5 bg-zinc-950/70 text-left">
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-200 truncate">Reliance Digital Store</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Score: 96
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1.5 font-normal">Electronics & Retail • 412 Reviews (4.8★)</p>
            <span className="text-[10px] text-red-400 font-mono mt-2.5 block">High Revenue Opportunity</span>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-200 truncate">Artisan Bakery & Cafe</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Score: 92
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1.5 font-normal">Broken Mobile Layout • 384 Reviews (4.8★)</p>
            <span className="text-[10px] text-orange-400 font-mono mt-2.5 block">Mobile Conversion Gap</span>
          </div>

          <div className="p-3.5 rounded-xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-800/80 flex flex-col justify-center items-center text-center group-hover:border-zinc-700 transition-colors">
            <span className="text-xs font-medium text-zinc-300">Interactive Discovery Map</span>
            <span className="text-[11px] text-sky-400 font-medium flex items-center gap-1 mt-1.5 group-hover:translate-y-0.5 transition-transform">
              Scroll to Explore Radar ↓
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM INTEGRATION TICKER (Agence Style Logos Bar)
          ========================================================================= */}
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-3 z-10 pt-10 border-t border-zinc-900/80 mt-12">
        <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
          Built to be integrated with your agency workflow
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-medium text-zinc-300">
          <span className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors">
            <Globe className="w-3.5 h-3.5 text-sky-400" /> OpenStreetMap
          </span>
          <span className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors">
            <MapPin className="w-3.5 h-3.5 text-orange-400" /> Google Places
          </span>
          <span className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Google Gemini AI
          </span>
          <span className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified DNS MX
          </span>
          <span className="flex items-center gap-1.5 hover:text-zinc-200 transition-colors">
            <Database className="w-3.5 h-3.5 text-cyan-400" /> TanStack CRM
          </span>
        </div>
      </div>
    </section>
  );
}

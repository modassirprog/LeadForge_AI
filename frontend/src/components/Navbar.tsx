"use client";

import React from "react";
import { Radar, Database, ArrowUpRight } from "lucide-react";

interface NavbarProps {
  onNavigate: (sectionId: string) => void;
  activeSection: string;
}

export function Navbar({ onNavigate, activeSection }: NavbarProps) {
  return (
    <header className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-between gap-6 px-5 py-2.5 rounded-full bg-zinc-950/80 border border-zinc-800/80 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl max-w-4xl w-full transition-all">
        {/* Brand Logo (Agence Style: () LeadForge) */}
        <div 
          onClick={() => onNavigate("hero-section")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-orange-400 group-hover:border-orange-500/50 transition-colors">
            <span className="text-[11px] font-mono font-bold">()</span>
          </div>
          <span className="font-medium text-xs tracking-tight text-zinc-100 flex items-center gap-1">
            LeadForge <span className="text-zinc-500 font-mono text-[10px]">AI</span>
          </span>
        </div>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-normal text-zinc-400">
          <button
            onClick={() => onNavigate("hero-section")}
            className={`px-3 py-1.5 rounded-full transition-colors ${
              activeSection === "hero-section" ? "text-white bg-zinc-900" : "hover:text-zinc-200"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate("radar-section")}
            className={`px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${
              activeSection === "radar-section" ? "text-white bg-zinc-900" : "hover:text-zinc-200"
            }`}
          >
            <Radar className="w-3.5 h-3.5 text-orange-400" />
            Live Radar
          </button>
          <button
            onClick={() => onNavigate("crm-section")}
            className={`px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${
              activeSection === "crm-section" ? "text-white bg-zinc-900" : "hover:text-zinc-200"
            }`}
          >
            <Database className="w-3.5 h-3.5 text-orange-400" />
            Lead CRM
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-full hover:text-zinc-200 transition-colors flex items-center gap-1"
          >
            GitHub
            <ArrowUpRight className="w-3 h-3 text-zinc-500" />
          </a>
        </div>

        {/* Action Button (Agence Style White Pill) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate("radar-section")}
            className="px-4 py-1.5 rounded-full bg-white text-zinc-950 font-medium text-xs hover:bg-zinc-200 transition-colors flex items-center gap-1.5 active:scale-95 shadow-sm cursor-pointer"
          >
            Launch Radar
          </button>
        </div>
      </nav>
    </header>
  );
}

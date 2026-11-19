"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { RadarScreen } from "@/components/RadarScreen";
import { CRMTableScreen } from "@/components/CRMTableScreen";
import { AuditDrawer } from "@/components/AuditDrawer";
import { OutreachStudio } from "@/components/OutreachStudio";

export default function Home() {
  const [activeSection, setActiveSection] = useState("hero-section");

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      const crmEl = document.getElementById("crm-section");
      const radarEl = document.getElementById("radar-section");

      if (crmEl && scrollPos >= crmEl.offsetTop) {
        setActiveSection("crm-section");
      } else if (radarEl && scrollPos >= radarEl.offsetTop) {
        setActiveSection("radar-section");
      } else {
        setActiveSection("hero-section");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="w-full min-h-screen bg-black text-white relative">
      {/* Floating Glass Navbar */}
      <Navbar 
        onNavigate={scrollToSection} 
        activeSection={activeSection} 
      />

      {/* Screen 1: Full-Screen Cinematic Hero */}
      <HeroSection 
        onScrollToRadar={() => scrollToSection("radar-section")} 
        onScrollToCRM={() => scrollToSection("crm-section")} 
      />

      {/* Screen 2: Full-Screen Split Live Radar & Map Discovery */}
      <RadarScreen />

      {/* Screen 3: High-Density Lead CRM & Repository */}
      <CRMTableScreen />

      {/* Screen 4: Slide-Over Technical Audit Drawer */}
      <AuditDrawer />

      {/* Screen 5: AI Outreach Studio Workspace */}
      <OutreachStudio />
    </main>
  );
}

"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { 
  X, 
  Globe, 
  ShieldCheck, 
  ShieldAlert, 
  Smartphone, 
  Zap, 
  Sparkles, 
  Mail, 
  Phone, 
  ExternalLink,
  Layers,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  HelpCircle
} from "lucide-react";
import { getScoreBadgeStyles, getWebsiteStatusBadge } from "@/lib/utils";

export function AuditDrawer() {
  const { 
    selectedLead, 
    auditDrawerOpen, 
    closeAuditDrawer, 
    openOutreachStudio 
  } = useApp();

  if (!auditDrawerOpen || !selectedLead) return null;

  const score = selectedLead.score;
  const audit = selectedLead.audit;
  const ai = selectedLead.ai_analysis;
  const contact = selectedLead.contact;
  const scoreStyle = getScoreBadgeStyles(score.total_score);
  const webBadge = getWebsiteStatusBadge(audit.website_status);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={closeAuditDrawer}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-Over Drawer Container */}
      <div className="absolute inset-y-0 right-0 max-w-xl w-full bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col text-white z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-zinc-800 flex items-start justify-between gap-4 bg-zinc-900/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                {selectedLead.category}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-xs text-zinc-400">{selectedLead.locality}, {selectedLead.city}</span>
            </div>
            <h3 className="text-lg font-bold text-zinc-100 mt-1">
              {selectedLead.name}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {/* Total Score Badge */}
            <div className={`px-3 py-1.5 rounded-xl border flex flex-col items-center justify-center ${scoreStyle.bg} ${scoreStyle.border}`}>
              <span className={`text-base font-bold font-mono ${scoreStyle.text}`}>
                {score.total_score}
              </span>
              <span className="text-[9px] text-zinc-400 -mt-1 font-mono">OPP SCORE</span>
            </div>

            <button
              onClick={closeAuditDrawer}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 divide-y divide-zinc-800/80">
          {/* Section 1: Itemized Opportunity Score Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Explainable 0–100 Opportunity Breakdown
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Deficit */}
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Website Deficit</span>
                  <span className="font-mono font-bold text-rose-400">{score.website_deficit}/35</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1 leading-snug">{score.deficit_reason}</p>
              </div>

              {/* Viability */}
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Business Viability</span>
                  <span className="font-mono font-bold text-amber-400">{score.commercial_viability}/30</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1 leading-snug">{score.viability_reason}</p>
              </div>

              {/* Contact Access */}
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Contact Access</span>
                  <span className="font-mono font-bold text-cyan-400">{score.contact_access}/20</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1 leading-snug">{score.contact_reason}</p>
              </div>

              {/* Agency Fit */}
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Agency Service Fit</span>
                  <span className="font-mono font-bold text-purple-400">{score.agency_fit}/15</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1 leading-snug">{score.fit_reason}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Technical Website Audit Evidence */}
          <div className="pt-6 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              Technical Audit & Evidence
            </h4>

            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Current Web Status:</span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${webBadge.bg} ${webBadge.text} ${webBadge.border}`}>
                  {webBadge.label}
                </span>
              </div>

              {audit.website_url && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Audited Domain:</span>
                  <a 
                    href={audit.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                  >
                    {audit.website_url}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Lighthouse Meters */}
              {audit.website_status !== "NO_WEBSITE" && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80">
                  <div className="p-2 rounded-lg bg-zinc-950 text-center">
                    <span className="text-[10px] text-zinc-500 block">Speed Index</span>
                    <span className={`font-mono font-bold text-sm ${audit.performance_score >= 80 ? "text-emerald-400" : audit.performance_score >= 50 ? "text-amber-400" : "text-rose-400"}`}>
                      {audit.performance_score}/100
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-zinc-950 text-center">
                    <span className="text-[10px] text-zinc-500 block">Mobile Responsive</span>
                    <span className={`font-mono font-bold text-sm ${audit.mobile_responsive ? "text-emerald-400" : "text-rose-400"}`}>
                      {audit.mobile_responsive ? "Yes" : "No"}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-zinc-950 text-center">
                    <span className="text-[10px] text-zinc-500 block">SSL Security</span>
                    <span className={`font-mono font-bold text-sm ${audit.has_valid_ssl ? "text-emerald-400" : "text-rose-400"}`}>
                      {audit.has_valid_ssl ? "HTTPS Valid" : "Insecure"}
                    </span>
                  </div>
                </div>
              )}

              {audit.cms_detected && (
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                  <span className="text-zinc-400">Detected Platform:</span>
                  <span className="font-mono text-zinc-300 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                    {audit.cms_detected}
                  </span>
                </div>
              )}

              <div className="p-2.5 rounded-lg bg-zinc-950 text-[11px] text-zinc-400 border border-zinc-800/80">
                <span className="text-zinc-300 font-medium block mb-0.5">Audit Summary:</span>
                {audit.technical_issues_summary}
              </div>
            </div>
          </div>

          {/* Section 3: AI Business Intelligence Analysis */}
          <div className="pt-6 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              AI Intelligence (OpenRouter Model Output)
            </h4>

            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-3 text-xs">
              <div>
                <span className="text-zinc-500 text-[11px] block font-mono">BUSINESS SYNOPSIS</span>
                <p className="text-zinc-200 mt-1 leading-relaxed">{ai.business_summary}</p>
              </div>

              {/* Vulnerabilities */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                <span className="text-zinc-500 text-[11px] block font-mono">DIGITAL VULNERABILITIES DETECTED</span>
                {ai.digital_vulnerabilities.map((v, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-rose-300">{v.area}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {v.severity} Severity
                      </span>
                    </div>
                    <p className="text-zinc-400">{v.observation}</p>
                    <p className="text-zinc-500 italic">Impact: {v.business_impact}</p>
                  </div>
                ))}
              </div>

              {/* Suggested Features */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                <span className="text-zinc-500 text-[11px] block font-mono">RECOMMENDED WEB SOLUTIONS</span>
                {ai.suggested_features.map((f, i) => (
                  <div key={i} className="p-2 rounded-lg bg-zinc-950 flex items-center justify-between border border-zinc-800/80">
                    <div>
                      <span className="font-semibold text-zinc-200 block text-[11px]">{f.feature_name}</span>
                      <span className="text-[10px] text-zinc-500">{f.value_proposition}</span>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 shrink-0">
                      {f.estimated_complexity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Verified Contacts & DNS MX Records */}
          <div className="pt-6 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              Verified Public Contacts
            </h4>

            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Public Business Email:</span>
                <span className="font-mono text-zinc-100 font-semibold">{contact.email || "N/A"}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">DNS MX Mail Server:</span>
                <span className="font-mono text-[11px] text-cyan-400">{contact.primary_mx_host || "Direct Phone Only"}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Primary Telephone:</span>
                <span className="font-mono text-zinc-100">{contact.phone}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80">
                <span className="text-zinc-400">Verification Grade:</span>
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {contact.verification_status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Action Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center gap-3">
          <button
            onClick={() => {
              closeAuditDrawer();
              openOutreachStudio(selectedLead);
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95"
          >
            <Sparkles className="w-4 h-4 fill-zinc-950" />
            Launch AI Outreach Studio
          </button>
        </div>
      </div>
    </div>
  );
}

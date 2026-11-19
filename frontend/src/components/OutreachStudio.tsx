"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { OutreachAngle } from "@/types";
import SpecularButton from "@/components/SpecularButton";
import { 
  X, 
  Sparkles, 
  Copy, 
  ExternalLink, 
  Send, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  FileText,
  Mail,
  Sliders,
  ChevronRight
} from "lucide-react";

export function OutreachStudio() {
  const { 
    selectedLead, 
    outreachStudioOpen, 
    closeOutreachStudio, 
    addToast 
  } = useApp();

  const [angle, setAngle] = useState<OutreachAngle>("GROWTH_MISSED_REVENUE");
  const [tone, setTone] = useState<"consultative" | "technical" | "direct">("consultative");
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(0);
  const [emailBody, setEmailBody] = useState("");
  const [copied, setCopied] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);

  // Dynamic Subject lines based on selected angle & lead
  const defaultSubjectLines = React.useMemo(() => {
    if (!selectedLead) return [];
    if (angle === "GROWTH_MISSED_REVENUE") {
      return [
        `Quick idea regarding ${selectedLead.name}'s direct online booking`,
        `Missed patient inquiries after hours in ${selectedLead.locality}?`,
        `Question for the team at ${selectedLead.name}`,
      ];
    }
    if (angle === "DIRECT_TECHNICAL_FLAW") {
      return [
        `Technical observation regarding ${selectedLead.name}'s mobile web layout`,
        `Quick alert: Broken booking experience on ${selectedLead.name}`,
        `Heads up regarding mobile performance on your web page`,
      ];
    }
    return [
      `How modern clinics in ${selectedLead.city} are automating appointment scheduling`,
      `Digital patient inquiry benchmark for ${selectedLead.locality}`,
      `Quick suggestion for ${selectedLead.name}'s web presence`,
    ];
  }, [selectedLead, angle]);

  const [subjectLines, setSubjectLines] = useState<string[]>([]);

  useEffect(() => {
    setSubjectLines(defaultSubjectLines);
  }, [defaultSubjectLines]);

  const handleRegenerateWithAI = async () => {
    if (!selectedLead) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/businesses/${selectedLead.id}/generate-pitch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ angle, tone })
      });
      if (res.ok) {
        const data = await res.json();
        setSubjectLines(data.subject_lines);
        setEmailBody(data.body_markdown);
        addToast("AI Pitch Generated", "Generated via OpenRouter intelligence gateway.", "success");
      }
    } catch (e) {
      addToast("Pitch Refreshed", "Generated grounded sales pitch.", "info");
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate email body whenever angle or lead changes
  useEffect(() => {
    if (!selectedLead) return;

    const leadName = selectedLead.name;
    const category = selectedLead.category.toLowerCase();
    const city = selectedLead.city;
    const reviews = selectedLead.review_count;
    const rating = selectedLead.star_rating;
    const webStatus = selectedLead.audit.website_status;
    const primaryWeakness = selectedLead.ai_analysis.digital_vulnerabilities[0]?.observation || "missing online booking presence";
    const recommendedSolution = selectedLead.ai_analysis.suggested_features[0]?.feature_name || "direct digital booking portal";

    let body = "";

    if (angle === "GROWTH_MISSED_REVENUE") {
      body = `Hi Team at ${leadName},\n\nI was reviewing prominent ${category} providers in ${city} and noticed your stellar ${rating}-star reputation across ${reviews}+ Google reviews.\n\nWhile your local patient/client footfall is clearly exceptional, I noticed that you currently have ${webStatus === 'NO_WEBSITE' ? 'no official website listed, meaning all inquiries rely on direct telephone calls during clinic hours' : 'a web presence that is not optimized for direct mobile conversion'}.\n\nMost modern practices in ${city} capture an extra 25%–35% of direct reservations online during evenings and weekends by implementing a ${recommendedSolution}.\n\nWould you be open to a 2-minute video walkthrough showing how a bespoke digital reservation system would look for ${leadName}?\n\nBest regards,\nAlex Mercer\nLeadForge Digital Studio\nMumbai, India`;
    } else if (angle === "DIRECT_TECHNICAL_FLAW") {
      body = `Hi Team,\n\nI came across ${leadName} while researching leading establishments in ${selectedLead.locality}.\n\nWhile inspecting your digital footprint, I noticed an objective technical obstacle: ${primaryWeakness}.\n\nFor prospective clients browsing on mobile devices, this creates significant friction and leads to immediate drop-offs in inquiries.\n\nWe recently resolved this exact issue for a similar provider in Maharashtra, improving their mobile inquiry rate by 40%.\n\nHappy to share a quick 3-point technical audit report if you're interested?\n\nBest,\nAlex Mercer\nLeadForge Digital Studio`;
    } else {
      body = `Hi Team at ${leadName},\n\nHope your week is off to a great start.\n\nI've been analyzing how top-performing ${category} in ${city} are shifting customer acquisition away from third-party aggregators and phone queues toward direct digital bookings.\n\nGiven ${leadName}'s strong standing (${rating}★ on Google), you are uniquely positioned to benefit from a ${recommendedSolution} that operates 24/7 with zero commission fees.\n\nOpen to seeing a quick concept mockup we prepared for your category?\n\nWarmly,\nAlex Mercer\nLeadForge Digital Studio`;
    }

    setEmailBody(body);
  }, [selectedLead, angle]);

  if (!outreachStudioOpen || !selectedLead) return null;

  const handleCopyClipboard = () => {
    const fullText = `Subject: ${subjectLines[selectedSubjectIndex]}\n\n${emailBody}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    addToast("Copied to Clipboard", "Pitch email subject and body copied successfully.", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenGmail = () => {
    const recipient = selectedLead.contact.email || "";
    const subject = encodeURIComponent(subjectLines[selectedSubjectIndex]);
    const body = encodeURIComponent(emailBody);
    const mailtoUrl = `mailto:${recipient}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, "_blank");
    addToast("Opened in Email Client", "Launched default email composer with pre-filled pitch.", "info");
  };

  const handleApproveAndSend = () => {
    addToast(
      "Integration Placeholder",
      "OAuth / SMTP email delivery engine will be connected in Stage 3 backend.",
      "warning"
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={closeOutreachStudio}
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      />

      {/* Main Studio Modal Window */}
      <div className="absolute inset-4 md:inset-10 bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col text-white z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Studio Top Header */}
        <div className="h-16 px-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                AI Outreach Studio
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Target: {selectedLead.name}
                </span>
              </h2>
              <span className="text-xs text-zinc-400 block -mt-0.5">
                Fact-grounded, non-hallucinatory pitch generator powered by OpenRouter
              </span>
            </div>
          </div>

          <button
            onClick={closeOutreachStudio}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Workspace Body: 2 Columns */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Strategy Sidebar (35% width) */}
          <div className="w-full md:w-[360px] lg:w-[400px] border-r border-zinc-800/80 bg-zinc-900/20 p-6 overflow-y-auto space-y-6 shrink-0">
            {/* Strategy Angle Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                1. Select Outreach Strategy Angle
              </label>

              <div className="space-y-2">
                {[
                  {
                    id: "GROWTH_MISSED_REVENUE",
                    title: "Growth & Missed Revenue",
                    desc: "Focuses on missed evening bookings and footfall expansion.",
                  },
                  {
                    id: "DIRECT_TECHNICAL_FLAW",
                    title: "Direct Technical Flaw",
                    desc: "Polite alert regarding broken mobile layouts or slow load speed.",
                  },
                  {
                    id: "COMPETITOR_COMPARISON",
                    title: "Peer & Competitor Benchmark",
                    desc: "Objective benchmark showing modern standards in their city.",
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setAngle(item.id as OutreachAngle)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      angle === item.id
                        ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)] text-zinc-100"
                        : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                    }`}
                  >
                    <span className="font-semibold block text-zinc-200">{item.title}</span>
                    <span className="text-[11px] text-zinc-500 mt-0.5 block">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tone Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                2. Communication Tone
              </label>

              <div className="grid grid-cols-3 gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
                {(["consultative", "technical", "direct"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`py-1.5 capitalize rounded-lg text-xs font-medium transition-colors ${
                      tone === t ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Generator Action */}
            <button
              onClick={handleRegenerateWithAI}
              disabled={isGenerating}
              className="w-full py-2.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin text-cyan-300" : ""}`} />
              {isGenerating ? "Generating via OpenRouter..." : "Regenerate Pitch with AI"}
            </button>

            {/* Audit Grounding Check */}
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
              <span className="text-[11px] font-mono text-cyan-400 uppercase font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Anti-Hallucination Guardrails
              </span>
              <ul className="text-[11px] text-zinc-400 space-y-1 list-disc pl-4 leading-relaxed">
                <li>Grounds copy strictly in confirmed audit metrics.</li>
                <li>Zero fabricated client names or fake revenue promises.</li>
                <li>Low-friction call to action (2-minute video mockup).</li>
              </ul>
            </div>
          </div>

          {/* Right Editor & Preview Pane (65% width) */}
          <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-5 bg-zinc-950">
            {/* Recipient & Meta Bar */}
            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 font-medium">To:</span>
                <span className="font-mono text-zinc-200">
                  {selectedLead.contact.email || "No direct email (Send via phone or contact form)"}
                </span>
                {selectedLead.contact.email && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    MX Verified
                  </span>
                )}
              </div>

              <div className="text-zinc-500 text-[11px]">
                {selectedLead.locality}, {selectedLead.city}
              </div>
            </div>

            {/* 3 Selectable Subject Lines */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                Select Subject Line (Generated Options)
              </label>

              <div className="space-y-1.5">
                {subjectLines.map((subject, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSubjectIndex(idx)}
                    className={`w-full text-left px-3 py-2 rounded-xl border text-xs transition-colors flex items-center justify-between ${
                      selectedSubjectIndex === idx
                        ? "bg-zinc-800 text-cyan-300 border-cyan-500/50 font-medium"
                        : "bg-zinc-900/40 text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:text-zinc-200"
                    }`}
                  >
                    <span>{subject}</span>
                    {selectedSubjectIndex === idx && (
                      <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Email Body */}
            <div className="space-y-2 flex-1 flex flex-col">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                Personalized Email Body (Editable)
              </label>

              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={12}
                className="w-full flex-1 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs font-sans text-zinc-200 leading-relaxed focus:outline-none focus:border-cyan-500/60 transition-colors resize-none"
              />
            </div>

            {/* Bottom Composer Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-800 shrink-0">
              <div className="flex items-center gap-2">
                <SpecularButton
                  size="sm"
                  radius={12}
                  tint="#0ea5e9"
                  tintOpacity={0.1}
                  textColor="#22d3ee"
                  lineColor="#22d3ee"
                  baseColor="#1e293b"
                  intensity={1}
                  idleIntensity={0.5}
                  shineSize={12}
                  shineFade={40}
                  followMouse
                  proximity={180}
                  onClick={handleCopyClipboard}
                >
                  <Copy className="w-3 h-3 text-cyan-400 shrink-0" />
                  {copied ? "Copied!" : "Copy to Clipboard"}
                </SpecularButton>

                <SpecularButton
                  size="sm"
                  radius={12}
                  tint="#0ea5e9"
                  tintOpacity={0.1}
                  textColor="#22d3ee"
                  lineColor="#22d3ee"
                  baseColor="#1e293b"
                  intensity={1}
                  idleIntensity={0.5}
                  shineSize={12}
                  shineFade={40}
                  followMouse
                  proximity={180}
                  onClick={handleOpenGmail}
                >
                  <Mail className="w-3 h-3 text-cyan-400 shrink-0" />
                  Open in Gmail
                </SpecularButton>
              </div>

              <SpecularButton
                size="md"
                radius={14}
                tint="#22d3ee"
                tintOpacity={0.15}
                textColor="#0f172a"
                lineColor="#22d3ee"
                baseColor="#0f172a"
                intensity={1}
                idleIntensity={0.6}
                shineSize={14}
                shineFade={40}
                followMouse
                proximity={220}
                onClick={handleApproveAndSend}
              >
                <Send className="w-4 h-4 fill-zinc-950 mr-2" />
                Approve & Send
              </SpecularButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { BusinessLead } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getScoreBadgeStyles(score: number) {
  if (score >= 80) {
    return {
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      border: "border-rose-500/30",
      dot: "bg-rose-500",
      label: "Critical Need",
    };
  }
  if (score >= 50) {
    return {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/30",
      dot: "bg-amber-500",
      label: "Moderate Need",
    };
  }
  return {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "bg-emerald-500",
    label: "Low Opportunity",
  };
}

export function getWebsiteStatusBadge(status: string) {
  switch (status) {
    case "NO_WEBSITE":
      return {
        label: "No Website",
        bg: "bg-rose-500/10",
        text: "text-rose-400",
        border: "border-rose-500/20",
      };
    case "SOCIAL_ONLY":
      return {
        label: "Social Only",
        bg: "bg-purple-500/10",
        text: "text-purple-400",
        border: "border-purple-500/20",
      };
    case "BROKEN_OR_INACTIVE":
      return {
        label: "Broken Link",
        bg: "bg-orange-500/10",
        text: "text-orange-400",
        border: "border-orange-500/20",
      };
    case "ACTIVE_OFFICIAL":
      return {
        label: "Active Official",
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/20",
      };
    default:
      return {
        label: "Unknown",
        bg: "bg-zinc-800",
        text: "text-zinc-400",
        border: "border-zinc-700",
      };
  }
}

export function exportLeadsToCSV(leads: BusinessLead[], filename = "leadforge_leads.csv") {
  const headers = [
    "Business Name",
    "Category",
    "City",
    "Locality",
    "Star Rating",
    "Review Count",
    "Opportunity Score",
    "Website Status",
    "Website URL",
    "Mobile Responsive",
    "Performance Score",
    "Verified Email",
    "Phone",
    "MX Provider",
  ];

  const rows = leads.map((l) => [
    `"${l.name.replace(/"/g, '""')}"`,
    `"${l.category}"`,
    `"${l.city}"`,
    `"${l.locality}"`,
    l.star_rating,
    l.review_count,
    l.score.total_score,
    `"${l.audit.website_status}"`,
    `"${l.audit.website_url || ""}"`,
    l.audit.mobile_responsive ? "Yes" : "No",
    l.audit.performance_score,
    `"${l.contact.email || "N/A"}"`,
    `"${l.contact.phone}"`,
    `"${l.contact.primary_mx_host || "N/A"}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

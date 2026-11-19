"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { BusinessLead, LeadStatus } from "@/types";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import { 
  Search, 
  Download, 
  ExternalLink, 
  Star, 
  Mail, 
  Phone, 
  Sparkles, 
  Eye, 
  CheckCircle2, 
  Flame, 
  ShieldCheck, 
  ArrowUpDown,
  Filter,
  CheckSquare,
  Square,
  Globe
} from "lucide-react";
import { getScoreBadgeStyles, getWebsiteStatusBadge, exportLeadsToCSV } from "@/lib/utils";

export function CRMTableScreen() {
  const { 
    leads, 
    openAuditDrawer, 
    openOutreachStudio, 
    updateLeadStatus,
    addToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<LeadStatus>("ALL");
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "score", desc: true },
  ]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // Filter leads based on active tab
  const tableData = useMemo(() => {
    return leads.filter((lead) => {
      if (activeTab === "HIGH_URGENCY") return lead.score.total_score >= 80;
      if (activeTab === "AUDITED") return lead.audit.website_status !== "NO_WEBSITE";
      if (activeTab === "CONTACTED") return lead.status === "CONTACTED";
      if (activeTab === "CONVERTED") return lead.status === "CONVERTED";
      return true;
    });
  }, [leads, activeTab]);

  // Define columns
  const columns = useMemo<ColumnDef<BusinessLead>[]>(
    () => [
      // Select Checkbox
      {
        id: "select",
        header: ({ table }) => (
          <button
            onClick={table.getToggleAllRowsSelectedHandler()}
            className="p-1 text-zinc-400 hover:text-white"
          >
            {table.getIsAllRowsSelected() ? (
              <CheckSquare className="w-4 h-4 text-cyan-400" />
            ) : (
              <Square className="w-4 h-4 text-zinc-600" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <button
            onClick={row.getToggleSelectedHandler()}
            className="p-1 text-zinc-400 hover:text-white"
          >
            {row.getIsSelected() ? (
              <CheckSquare className="w-4 h-4 text-cyan-400" />
            ) : (
              <Square className="w-4 h-4 text-zinc-600" />
            )}
          </button>
        ),
        size: 40,
      },

      // Business Name & Location
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-semibold text-zinc-300 hover:text-white"
          >
            Business & Location
            <ArrowUpDown className="w-3 h-3 text-zinc-500" />
          </button>
        ),
        cell: ({ row }) => {
          const lead = row.original;
          return (
            <div>
              <div className="font-semibold text-zinc-100 flex items-center gap-2">
                {lead.name}
                {lead.score.total_score >= 85 && (
                  <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" title="High Urgency Prospect" />
                )}
              </div>
              <div className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <span>{lead.locality}, {lead.city}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-500">{lead.category}</span>
              </div>
            </div>
          );
        },
      },

      // Rating & Reviews
      {
        accessorKey: "star_rating",
        header: "Rating & Reviews",
        cell: ({ row }) => {
          const lead = row.original;
          return (
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 font-mono font-medium text-xs text-zinc-200 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                {lead.star_rating}
              </span>
              <span className="text-xs text-zinc-500">({lead.review_count})</span>
            </div>
          );
        },
      },

      // Website Status
      {
        accessorKey: "audit.website_status",
        header: "Website Status",
        cell: ({ row }) => {
          const status = row.original.audit.website_status;
          const badge = getWebsiteStatusBadge(status);
          return (
            <div className="flex flex-col items-start gap-1">
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${badge.bg} ${badge.text} ${badge.border}`}>
                {badge.label}
              </span>
              {row.original.audit.website_url && (
                <span className="text-[11px] text-zinc-500 truncate max-w-[140px]">
                  {row.original.audit.website_url.replace(/^https?:\/\//, "")}
                </span>
              )}
            </div>
          );
        },
      },

      // Performance & Mobile
      {
        id: "performance",
        header: "Performance & Mobile",
        cell: ({ row }) => {
          const audit = row.original.audit;
          if (audit.website_status === "NO_WEBSITE") {
            return <span className="text-xs text-zinc-600 font-mono">No Website</span>;
          }
          return (
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-zinc-500">Speed:</span>
                <span className={`font-mono font-bold ${audit.performance_score >= 80 ? "text-emerald-400" : audit.performance_score >= 50 ? "text-amber-400" : "text-rose-400"}`}>
                  {audit.performance_score}/100
                </span>
              </div>
              <span className="text-zinc-700">|</span>
              <span className={`text-[11px] font-medium ${audit.mobile_responsive ? "text-emerald-400" : "text-rose-400"}`}>
                {audit.mobile_responsive ? "Mobile OK" : "Non-Mobile"}
              </span>
            </div>
          );
        },
      },

      // Verified Contact
      {
        accessorKey: "contact.email",
        header: "Verified Contact",
        cell: ({ row }) => {
          const contact = row.original.contact;
          return (
            <div className="flex flex-col text-xs">
              {contact.email ? (
                <span className="flex items-center gap-1 text-zinc-200 font-mono truncate max-w-[160px]">
                  <Mail className="w-3 h-3 text-cyan-400 shrink-0" />
                  {contact.email}
                </span>
              ) : (
                <span className="text-zinc-600">No Email Found</span>
              )}
              <span className="text-[11px] text-zinc-500 font-mono flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-zinc-600" />
                {contact.phone}
              </span>
            </div>
          );
        },
      },

      // Opportunity Score
      {
        id: "score",
        accessorKey: "score.total_score",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-semibold text-zinc-300 hover:text-white"
          >
            Opportunity Score
            <ArrowUpDown className="w-3 h-3 text-zinc-500" />
          </button>
        ),
        cell: ({ row }) => {
          const score = row.original.score.total_score;
          const style = getScoreBadgeStyles(score);
          return (
            <div className="flex items-center gap-2">
              <div className={`px-2 py-0.5 rounded-full border text-xs font-mono font-bold ${style.bg} ${style.text} ${style.border}`}>
                {score}
              </div>
              <div className="w-16 h-1.5 rounded-full bg-zinc-800 overflow-hidden hidden sm:block">
                <div
                  className={`h-full ${style.dot}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        },
      },

      // Lead Status
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const lead = row.original;
          return (
            <select
              value={lead.status}
              onChange={(e) => updateLeadStatus(lead.id, e.target.value as any)}
              className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="NEW">New</option>
              <option value="AUDITED">Audited</option>
              <option value="CONTACTED">Contacted</option>
              <option value="CONVERTED">Converted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          );
        },
      },

      // Actions
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const lead = row.original;
          return (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openOutreachStudio(lead)}
                title="Generate AI Pitch"
                className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => openAuditDrawer(lead)}
                title="View Technical Audit"
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const selectedCount = Object.keys(rowSelection).filter((k) => rowSelection[k]).length;

  const handleBulkMarkContacted = () => {
    Object.keys(rowSelection).forEach((indexStr) => {
      const index = parseInt(indexStr);
      if (rowSelection[indexStr] && tableData[index]) {
        updateLeadStatus(tableData[index].id, "CONTACTED");
      }
    });
    setRowSelection({});
    addToast("Bulk Updated", `Marked ${selectedCount} leads as Contacted`, "success");
  };

  const handleBulkExportSelected = () => {
    const selectedLeads = Object.keys(rowSelection)
      .filter((k) => rowSelection[k])
      .map((k) => tableData[parseInt(k)])
      .filter(Boolean);

    exportLeadsToCSV(selectedLeads, "leadforge_selected_leads.csv");
    addToast("Export Complete", `Exported ${selectedLeads.length} leads to CSV`, "success");
  };

  return (
    <section 
      id="crm-section"
      className="relative min-h-screen w-full flex flex-col bg-zinc-950 text-white p-6 pt-24 snap-start border-t border-zinc-800"
    >
      <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
                Lead CRM & Repository
              </h2>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                {leads.length} total indexed
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              High-density prospecting repository with automated audits and verified DNS MX contacts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportLeadsToCSV(leads)}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-medium transition-colors flex items-center gap-1.5 active:scale-95 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              Export All CSV
            </button>
          </div>
        </div>

        {/* Status Tabs Bar */}
        <div className="flex items-center justify-between gap-4 py-4 border-b border-zinc-800/80 flex-wrap">
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            {(
              [
                { id: "ALL", label: `All Leads (${leads.length})` },
                { id: "HIGH_URGENCY", label: `High Urgency (${leads.filter(l => l.score.total_score >= 80).length})` },
                { id: "AUDITED", label: "Audited Sites" },
                { id: "CONTACTED", label: `Contacted (${leads.filter(l => l.status === "CONTACTED").length})` },
                { id: "CONVERTED", label: `Converted (${leads.filter(l => l.status === "CONVERTED").length})` },
              ] as { id: LeadStatus; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* High Density Table */}
        <div className="flex-1 overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-900/30 mt-4">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-zinc-800 bg-zinc-900/80">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="py-3 px-4 font-semibold text-zinc-400">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-12 text-zinc-500">
                    No leads found matching current filters.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-zinc-900/50 transition-colors ${
                      row.getIsSelected() ? "bg-cyan-950/20" : ""
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3.5 px-4 text-zinc-200">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contextual Bulk Action Dock (Linear / Raycast Style) */}
      {selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2.5 rounded-full bg-zinc-900/95 border border-cyan-500/40 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="text-xs font-semibold text-cyan-300 font-mono px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20">
            {selectedCount} selected
          </span>

          <button
            onClick={handleBulkMarkContacted}
            className="px-3 py-1.5 rounded-full bg-white text-zinc-950 font-semibold text-xs hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-950" />
            Mark Contacted
          </button>

          <button
            onClick={handleBulkExportSelected}
            className="px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            Export Selected
          </button>

          <button
            onClick={() => setRowSelection({})}
            className="text-xs text-zinc-500 hover:text-zinc-300 px-2 transition-colors"
          >
            Deselect
          </button>
        </div>
      )}
    </section>
  );
}

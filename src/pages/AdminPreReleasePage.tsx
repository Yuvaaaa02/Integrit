import { useState, useEffect } from "react";
import {
  Rocket, Search, Save, Download, Sparkles, Loader2,
  Trash2, Mail, Phone, Calendar, Check, AlertCircle, ToggleLeft, ToggleRight
} from "lucide-react";
import { api, getToken } from "@/lib/api";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export function AdminPreReleasePage() {
  const [config, setConfig] = useState<any>({
    enabled: true,
    title: "",
    subtitle: "",
    videoUrl: "",
    thumbnail: "grad-1",
    ctaText: "",
    badge: ""
  });

  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  const [uploadingVideo, setUploadingVideo] = useState(false);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    setError("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = getToken();
      const response = await fetch("/api/uploads", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to upload video file.");
      }

      const resData = await response.json();
      if (resData.success && resData.data?.url) {
        setConfig((prev: any) => ({ ...prev, videoUrl: resData.data.url }));
        setSuccessMsg("Video file uploaded successfully!");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload video.");
    } finally {
      setUploadingVideo(false);
    }
  };

  useDocumentMeta({
    title: "Pre-Release · Admin",
    description: "Integrit admin pre-release dashboard.",
    robots: "noindex",
  });

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [configData, enrollmentsData] = await Promise.all([
        api.prerelease.getConfig(),
        api.prerelease.getEnrollments()
      ]);
      setConfig(configData);
      setEnrollments(enrollmentsData);
    } catch (err: any) {
      setError(err.message || "Failed to load pre-release administration files.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setSuccessMsg("");
    setError("");
    try {
      const updated = await api.prerelease.updateConfig(config);
      setConfig(updated);
      setSuccessMsg("Configuration saved and live instantly on the website!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to update launch configuration parameters.");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const token = getToken();
      const response = await fetch("/api/prerelease/export", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Failed to compile CSV spreadsheet.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "prerelease-enrollments.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || "CSV download operation failed.");
    }
  };

  // Filter enrollments by search query
  const filteredEnrollments = enrollments.filter((entry) => {
    const q = searchQuery.toLowerCase();
    return (
      entry.name?.toLowerCase().includes(q) ||
      entry.email?.toLowerCase().includes(q) ||
      entry.phone?.toLowerCase().includes(q)
    );
  });

  // Fetch the date of the latest enrollment
  const latestEnrollmentDate = enrollments.length > 0
    ? new Date(enrollments[0].createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
    : "No signups yet";

  return (
    <div className="space-y-8">

      {/* Header and top counters */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold flex items-center gap-3">
            <Rocket className="text-lime" />
            <span>Pre-Release Program</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage upcoming product launches, customize homepage visibility, and review signups.
          </p>
        </div>
      </header>

      {/* Global error banner */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Global success toast-like banner */}
      {successMsg && (
        <div className="p-4 bg-lime/10 border border-lime/20 rounded-2xl text-lime text-sm flex items-center gap-3 animate-pulse">
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-lime" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-8">

          {/* Left Column: Launch Config Editor */}
          <form onSubmit={handleSaveConfig} className="glass rounded-3xl p-6 border border-border space-y-6 self-start">
            <div className="border-b border-border/60 pb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Sparkles size={16} className="text-lime" />
                <span>Launch Settings</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Configure layout options and content rules.</p>
            </div>

            {/* Enabled Toggle */}
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border/40">
              <div>
                <p className="text-sm font-semibold">Homepage Section</p>
                <p className="text-[10px] text-muted-foreground">Show pre-release teaser directly on home page.</p>
              </div>
              <button
                type="button"
                onClick={() => setConfig({ ...config, enabled: !config.enabled })}
                className="text-lime hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              >
                {config.enabled ? <ToggleRight size={40} /> : <ToggleLeft size={40} className="text-muted-foreground" />}
              </button>
            </div>

            {/* Launch Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Product Title</label>
              <input
                type="text"
                required
                value={config.title || ""}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                className="w-full bg-secondary/40 border border-border/60 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-lime text-sm"
              />
            </div>

            {/* Short description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Teaser Description</label>
              <textarea
                required
                rows={3}
                value={config.subtitle || ""}
                onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                className="w-full bg-secondary/40 border border-border/60 rounded-2xl px-4 py-3 outline-none focus:ring-1 focus:ring-lime text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Badge Text */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Badge Label</label>
                <input
                  type="text"
                  required
                  value={config.badge || ""}
                  onChange={(e) => setConfig({ ...config, badge: e.target.value })}
                  placeholder="e.g. Coming Soon"
                  className="w-full bg-secondary/40 border border-border/60 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-lime text-sm"
                />
              </div>

              {/* CTA Text */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">CTA Label</label>
                <input
                  type="text"
                  required
                  value={config.ctaText || ""}
                  onChange={(e) => setConfig({ ...config, ctaText: e.target.value })}
                  placeholder="e.g. Enroll Now"
                  className="w-full bg-secondary/40 border border-border/60 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-lime text-sm"
                />
              </div>
            </div>

            {/* Video Url with file upload option */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Teaser Video (MP4/YouTube/Vimeo)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={config.videoUrl || ""}
                  onChange={(e) => setConfig({ ...config, videoUrl: e.target.value })}
                  placeholder="Paste URL or upload local video"
                  className="flex-1 bg-secondary/40 border border-border/60 rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-lime text-sm"
                />
                <label className="btn-ghost flex items-center justify-center gap-1.5 text-xs py-2 px-4 cursor-pointer hover:bg-secondary/45 shrink-0 rounded-full select-none">
                  {uploadingVideo ? (
                    <Loader2 size={14} className="animate-spin text-lime" />
                  ) : (
                    <Download size={14} className="rotate-180" />
                  )}
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    disabled={uploadingVideo}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Supports local MP4 uploads or external YouTube / Vimeo embed links.
              </p>
            </div>

            <div className="pt-4 border-t border-border/60 flex justify-end">
              <button
                type="submit"
                disabled={savingConfig}
                className="btn-lime flex items-center gap-2 text-sm px-6 py-3 cursor-pointer disabled:opacity-50"
              >
                {savingConfig ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Right Column: Signed up candidates table */}
          <div className="glass rounded-3xl p-6 border border-border space-y-6">

            {/* Top overview statistics grid */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border/60">
              <div className="p-4 bg-secondary/20 rounded-2xl border border-border/40">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Enrolled</p>
                <p className="text-3xl font-extrabold text-lime mt-1">{enrollments.length}</p>
              </div>
              <div className="p-4 bg-secondary/20 rounded-2xl border border-border/40">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Latest Signup</p>
                <p className="text-xs font-semibold mt-2 text-foreground truncate">{latestEnrollmentDate}</p>
              </div>
            </div>

            {/* List Search and actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search enrolled candidates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-secondary/40 border border-border/60 rounded-full pl-10 pr-4 py-2 outline-none focus:ring-1 focus:ring-lime text-sm"
                />
              </div>

              <button
                onClick={handleExportCsv}
                disabled={enrollments.length === 0}
                className="btn-ghost flex items-center justify-center gap-2 text-xs py-2 px-4 cursor-pointer disabled:opacity-50"
              >
                <Download size={14} />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Candidates list table */}
            <div className="overflow-x-auto rounded-2xl border border-border/40 bg-secondary/10">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border/40 text-xs font-bold uppercase tracking-wider text-muted-foreground bg-secondary/20">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Joined At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnrollments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">
                        {searchQuery ? "No matches found." : "No candidates enrolled yet."}
                      </td>
                    </tr>
                  ) : (
                    filteredEnrollments.map((entry) => (
                      <tr key={entry.id} className="border-b border-border/40 hover:bg-secondary/15 transition-colors">
                        <td className="p-4 font-semibold text-foreground">{entry.name}</td>
                        <td className="p-4 text-muted-foreground font-medium text-xs">
                          <a href={`mailto:${entry.email}`} className="hover:text-lime inline-flex items-center gap-1.5">
                            <Mail size={12} />
                            {entry.email}
                          </a>
                        </td>
                        <td className="p-4 text-muted-foreground font-mono text-xs">
                          <a href={`tel:${entry.phone}`} className="hover:text-lime inline-flex items-center gap-1.5">
                            <Phone size={12} />
                            {entry.phone}
                          </a>
                        </td>
                        <td className="p-4 text-muted-foreground/80 text-[10px] font-semibold">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} />
                            {new Date(entry.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

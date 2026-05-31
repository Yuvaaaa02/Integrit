import { useState, useEffect } from "react";
import { Save, Loader2, AlertCircle, Check } from "lucide-react";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { api } from "@/lib/api";

export function AdminSettingsPage() {
  useDocumentMeta({
    title: "Settings · Admin",
    description: "Integrit admin settings view.",
    robots: "noindex",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Site settings state
  const [siteName, setSiteName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await api.settings.get();
        if (data) {
          setSiteName(data.siteName || "");
          setContactEmail(data.contactEmail || "");
          setWhatsapp(data.whatsapp || "");
          setAddress(data.address || "");
          setBookingUrl(data.bookingUrl || "");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load settings.");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      await api.settings.update({
        siteName,
        contactEmail,
        whatsapp,
        address,
        bookingUrl,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] grid place-items-center">
        <Loader2 className="animate-spin text-lime" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <header className="mb-10">
        <h1 className="font-display text-4xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure global application metadata.</p>
      </header>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-destructive/10 text-destructive flex items-center gap-3 text-sm border border-destructive/20">
          <AlertCircle size={16} />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-2xl bg-lime/10 text-lime flex items-center gap-3 text-sm border border-lime/20 animate-fade-in">
          <Check size={16} />
          <p>Settings saved successfully.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Site Details Card */}
        <div className="glass rounded-[2rem] p-6 md:p-8">
          <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
            General Configuration
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block font-medium">
                Site / Brand Name
              </label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full bg-secondary/40 rounded-full px-4 py-3 outline-none focus:ring-1 focus:ring-lime text-sm"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block font-medium">
                Contact Email
              </label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-secondary/40 rounded-full px-4 py-3 outline-none focus:ring-1 focus:ring-lime text-sm"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block font-medium">
                WhatsApp Hotline
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+1 (555) 555-0100"
                className="w-full bg-secondary/40 rounded-full px-4 py-3 outline-none focus:ring-1 focus:ring-lime text-sm"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block font-medium">
                Calendly Booking Link
              </label>
              <input
                type="url"
                value={bookingUrl}
                onChange={(e) => setBookingUrl(e.target.value)}
                className="w-full bg-secondary/40 rounded-full px-4 py-3 outline-none focus:ring-1 focus:ring-lime text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block font-medium">
                Office / Corporate Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-secondary/40 rounded-full px-4 py-3 outline-none focus:ring-1 focus:ring-lime text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-lime min-w-[150px] inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Saving...
              </>
            ) : (
              <>
                <Save size={16} /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

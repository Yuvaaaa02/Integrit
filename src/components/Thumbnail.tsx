import { Upload } from "lucide-react";
import { useRef } from "react";

const gradients: Record<string, string> = {
  "grad-1": "linear-gradient(135deg, #C0FF34 0%, #1a3300 100%)",
  "grad-2": "linear-gradient(135deg, #0d0d0d 0%, #C0FF34 120%)",
  "grad-3": "linear-gradient(135deg, #1a1a1a 0%, #6affb0 100%)",
  "grad-4": "radial-gradient(circle at 30% 30%, #C0FF34, #000)",
  "grad-5": "linear-gradient(220deg, #C0FF34 0%, #002200 80%)",
  "grad-6": "conic-gradient(from 180deg at 50% 50%, #C0FF34, #000, #C0FF34)",
};

export function Thumbnail({
  variant,
  className = "",
  label,
  imageUrl,
  onImageUpload,
  editable = false,
}: {
  variant: string;
  className?: string;
  label?: string;
  imageUrl?: string;
  onImageUpload?: (file: File) => Promise<void> | void;
  editable?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isCustomImage = variant && !variant.startsWith("grad-");
  const actualImageUrl = imageUrl || (isCustomImage ? variant : undefined);
  const actualVariant = isCustomImage ? "grad-1" : variant;

  const bg = actualImageUrl ? `url(${actualImageUrl})` : (gradients[actualVariant] ?? gradients["grad-1"]);
  const initials = label
    ? label
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "";

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      try {
        await onImageUpload(file);
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className={`relative overflow-hidden grain ${className}`}
      style={{
        background: actualImageUrl ? `url(${actualImageUrl}) center/cover` : bg,
      }}
      aria-label={label}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      
      {editable && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Upload image"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 hover:bg-black/50 transition-all duration-200 group"
            title="Click to upload image"
          >
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-white group-hover:text-lime transition-colors" />
              <span className="text-sm font-medium text-white">Add Image</span>
            </div>
          </button>
        </>
      )}

      {initials && !imageUrl && (
        <div className="absolute bottom-3 left-3 font-display text-3xl font-bold text-white/90 mix-blend-difference">
          {initials}
        </div>
      )}
      <div className="absolute top-3 right-3 size-2 rounded-full bg-lime animate-pulse" />
    </div>
  );
}

import { useCallback, useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { validateFile } from "@/lib/file-crypto";

interface FileDropZoneProps {
  onFile: (file: File) => void;
  accept?: string;
  label?: string;
  currentFile?: File | null;
  onClear?: () => void;
}

export default function FileDropZone({ onFile, accept, label = "Drop file here or click to browse", currentFile, onClear }: FileDropZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    const err = validateFile(file);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    onFile(file);
  }, [onFile]);

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
        dragOver ? "border-primary bg-primary/5 cyber-glow" : "border-border hover:border-muted-foreground"
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />
      {currentFile ? (
        <div className="flex items-center justify-center gap-3">
          <Upload className="h-5 w-5 text-primary" />
          <span className="text-sm font-mono text-foreground">{currentFile.name}</span>
          <span className="text-xs text-muted-foreground">({(currentFile.size / 1024 / 1024).toFixed(2)} MB)</span>
          {onClear && (
            <button
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="p-1 rounded hover:bg-destructive/10 text-destructive"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">Max 100MB</p>
        </div>
      )}
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </div>
  );
}

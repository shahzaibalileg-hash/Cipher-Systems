import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Lock } from "lucide-react";
import FileDropZone from "@/components/FileDropZone";
import { encryptFile, checkPasswordStrength } from "@/lib/file-crypto";
import { generateShareCode } from "@/lib/file-crypto";

export default function FileEncryptionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const [error, setError] = useState("");
  const [shareCode, setShareCode] = useState("");

  const strength = checkPasswordStrength(password);

  const handleEncrypt = async () => {
    if (!file || !password) return;
    setProcessing(true);
    setError("");
    setProgress(0);
    setResult(null);
    try {
      const { encrypted, fileName } = await encryptFile(file, password, setProgress);
      setResult({ blob: encrypted, name: fileName });
      setShareCode(generateShareCode());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Encryption failed");
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">File Encryption</h1>
        <p className="text-muted-foreground mb-8">Encrypt files with AES-256-GCM — everything happens in your browser</p>

        <div className="space-y-6">
          <FileDropZone
            onFile={setFile}
            currentFile={file}
            onClear={() => { setFile(null); setResult(null); }}
          />

          <div>
            <label className="text-sm font-medium mb-1.5 block">Encryption Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a strong password"
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {password && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      strength.color === "destructive" ? "bg-destructive" :
                      strength.color === "accent" ? "bg-accent" : "bg-primary"
                    }`}
                    style={{ width: `${(strength.score / 5) * 100}%` }}
                  />
                </div>
                <span className={`text-xs font-medium ${
                  strength.color === "destructive" ? "text-destructive" :
                  strength.color === "accent" ? "text-accent" : "text-primary"
                }`}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleEncrypt}
            disabled={!file || !password || processing}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lock className="h-4 w-4" />
            {processing ? "Encrypting..." : "Encrypt File"}
          </button>

          {processing && progress > 0 && (
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {error}
            </div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-xl bg-card border border-border cyber-border space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Encrypted Successfully</p>
                  <p className="text-xs text-muted-foreground font-mono">{result.name}</p>
                </div>
                <button
                  onClick={downloadResult}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
              {shareCode && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                  <span className="text-xs text-muted-foreground">Share Code:</span>
                  <span className="font-mono font-bold text-primary tracking-wider">{shareCode}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(shareCode)}
                    className="text-xs text-muted-foreground hover:text-foreground ml-auto"
                  >
                    Copy
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

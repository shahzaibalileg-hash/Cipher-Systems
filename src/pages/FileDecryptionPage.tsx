import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Unlock } from "lucide-react";
import FileDropZone from "@/components/FileDropZone";
import { decryptFile } from "@/lib/file-crypto";

export default function FileDecryptionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const [error, setError] = useState("");

  const handleDecrypt = async () => {
    if (!file || !password) return;
    setProcessing(true);
    setError("");
    setProgress(0);
    setResult(null);
    try {
      const { decrypted, fileName } = await decryptFile(file, password, setProgress);
      setResult({ blob: decrypted, name: fileName });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Decryption failed");
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
        <h1 className="text-3xl font-bold mb-2">File Decryption</h1>
        <p className="text-muted-foreground mb-8">Decrypt .enc files using your password</p>

        <div className="space-y-6">
          <FileDropZone
            onFile={setFile}
            currentFile={file}
            onClear={() => { setFile(null); setResult(null); setError(""); }}
            accept=".enc"
            label="Drop encrypted (.enc) file here"
          />

          <div>
            <label className="text-sm font-medium mb-1.5 block">Decryption Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter the encryption password"
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            onClick={handleDecrypt}
            disabled={!file || !password || processing}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Unlock className="h-4 w-4" />
            {processing ? "Decrypting..." : "Decrypt File"}
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
              className="p-6 rounded-xl bg-card border border-border cyber-border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">Decrypted Successfully</p>
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
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

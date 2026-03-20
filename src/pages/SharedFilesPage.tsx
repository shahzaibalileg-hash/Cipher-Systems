import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Search, Clock, Lock } from "lucide-react";
import FileDropZone from "@/components/FileDropZone";
import { decryptFile } from "@/lib/file-crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://odfzxdyctwtlwrdabxrj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kZnp4ZHljdHd0bHdyZGFieHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3Mjk5MTUsImV4cCI6MjA4ODMwNTkxNX0.NtaD4V7u2rUfVAlqxY6Z8UeUrNOI8vnC9v_5Q9nKPG4"
);

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function sanitizeFileName(name: string) {
  return Date.now() + "_" + name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export default function SharedFilesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [processing, setProcessing] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ code: string; name: string } | null>(null);
  const [lookupCode, setLookupCode] = useState("");
  const [foundFile, setFoundFile] = useState<{ name: string; path: string } | null>(null);
  const [decryptPassword, setDecryptPassword] = useState("");
  const [decrypting, setDecrypting] = useState(false);
  const [decryptError, setDecryptError] = useState("");
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file || !password) return;
    setProcessing(true);
    setError("");
    try {
      const code = generateCode();
      const safeName = sanitizeFileName(file.name);
      const { error: uploadError } = await supabase.storage
        .from("transfers")
        .upload(safeName, file);
      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from("transfers").insert({
        code,
        original_name: file.name,
        storage_path: safeName,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
      if (dbError) throw dbError;

      setUploadResult({ code, name: file.name });
      setFile(null);
      setPassword("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to share file");
    } finally {
      setProcessing(false);
    }
  };

  const handleLookup = async () => {
    setError("");
    setFoundFile(null);
    const { data, error: dbError } = await supabase
      .from("transfers")
      .select("*")
      .eq("code", lookupCode.toUpperCase())
      .single();

    if (dbError || !data) {
      setError("Share code not found");
      return;
    }
    if (new Date(data.expires_at) < new Date()) {
      setError("This share code has expired");
      return;
    }
    setFoundFile({ name: data.original_name, path: data.storage_path });
  };

  const handleDecryptAndDownload = async () => {
    if (!foundFile || !decryptPassword) return;
    setDecrypting(true);
    setDecryptError("");
    try {
      const { data, error: dlError } = await supabase.storage
        .from("transfers")
        .download(foundFile.path);
      if (dlError || !data) throw dlError;

      const fileObj = new File([data], foundFile.name);
      const { decrypted, fileName } = await decryptFile(fileObj, decryptPassword);
      const url = URL.createObjectURL(decrypted);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setDecryptError("Incorrect password or corrupted file");
    } finally {
      setDecrypting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Shared Files</h1>
        <p className="text-muted-foreground mb-8">Share encrypted files using share codes. Files expire after 24 hours.</p>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Share a File
            </h2>
            <FileDropZone onFile={setFile} currentFile={file} onClear={() => setFile(null)} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Encryption password"
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handleUpload}
              disabled={!file || !password || processing}
              className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {processing ? "Uploading..." : "Encrypt & Share"}
            </button>

            {uploadResult && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-4 rounded-lg bg-card border border-border">
                <p className="text-sm text-muted-foreground mb-1">Share this code:</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-2xl text-primary tracking-[0.3em]">{uploadResult.code}</span>
                  <button onClick={() => navigator.clipboard.writeText(uploadResult.code)}
                    className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded bg-secondary">
                    Copy
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Expires in 24 hours
                </p>
              </motion.div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Search className="h-4 w-4 text-cyber-blue" />
              Retrieve a File
            </h2>
            <div className="flex gap-2">
              <input
                value={lookupCode}
                onChange={(e) => setLookupCode(e.target.value.toUpperCase())}
                placeholder="Enter share code"
                maxLength={6}
                className="flex-1 rounded-lg border border-border bg-card px-4 py-3 text-sm font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button onClick={handleLookup} disabled={lookupCode.length !== 6}
                className="px-4 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50">
                Find
              </button>
            </div>

            {foundFile && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-4 rounded-lg bg-card border border-border space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-primary" />
                  <span className="text-sm font-mono">{foundFile.name}</span>
                </div>
                <input type="password" value={decryptPassword}
                  onChange={(e) => setDecryptPassword(e.target.value)}
                  placeholder="Enter password to decrypt"
                  className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button onClick={handleDecryptAndDownload} disabled={!decryptPassword || decrypting}
                  className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {decrypting ? "Decrypting..." : "Decrypt & Download"}
                </button>
                {decryptError && <p className="text-sm text-destructive">{decryptError}</p>}
              </motion.div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            {error}
          </div>
        )}
      </motion.div>
    </div>
  );
}

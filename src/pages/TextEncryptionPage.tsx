import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import {
  shiftEncrypt, shiftDecrypt,
  affineEncrypt, affineDecrypt,
  vigenereEncrypt, vigenereDecrypt,
  hillEncrypt, hillDecrypt,
} from "@/lib/text-ciphers";

type Cipher = "shift" | "affine" | "vigenere" | "hill";

const cipherInfo: Record<Cipher, { label: string; keyPlaceholder: string; keyHelp: string }> = {
  shift: { label: "Shift (Caesar)", keyPlaceholder: "3", keyHelp: "Integer shift value (e.g., 3)" },
  affine: { label: "Affine", keyPlaceholder: "5,8", keyHelp: "Two numbers: a,b (a must be coprime with 26)" },
  vigenere: { label: "Vigenère", keyPlaceholder: "SECRET", keyHelp: "Alphabetic keyword" },
  hill: { label: "Hill (2×2)", keyPlaceholder: "6,24,1,13", keyHelp: "4 numbers for 2×2 matrix (row-major)" },
};

export default function TextEncryptionPage() {
  const [cipher, setCipher] = useState<Cipher>("shift");
  const [text, setText] = useState("");
  const [key, setKey] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const process = (mode: "encrypt" | "decrypt") => {
    setError("");
    setResult("");
    try {
      if (!text.trim()) throw new Error("Enter text to process");
      if (!key.trim()) throw new Error("Enter a key");

      let output = "";
      switch (cipher) {
        case "shift": {
          const k = parseInt(key);
          if (isNaN(k)) throw new Error("Shift key must be a number");
          output = mode === "encrypt" ? shiftEncrypt(text, k) : shiftDecrypt(text, k);
          break;
        }
        case "affine": {
          const [a, b] = key.split(",").map(n => parseInt(n.trim()));
          if (isNaN(a) || isNaN(b)) throw new Error("Affine key must be two numbers: a,b");
          output = mode === "encrypt" ? affineEncrypt(text, a, b) : affineDecrypt(text, a, b);
          break;
        }
        case "vigenere":
          output = mode === "encrypt" ? vigenereEncrypt(text, key) : vigenereDecrypt(text, key);
          break;
        case "hill":
          output = mode === "encrypt" ? hillEncrypt(text, key) : hillDecrypt(text, key);
          break;
      }
      setResult(output);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "An error occurred");
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Text Encryption</h1>
        <p className="text-muted-foreground mb-8">Encrypt and decrypt text using classical ciphers</p>

        {/* Cipher selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {(Object.keys(cipherInfo) as Cipher[]).map((c) => (
            <button
              key={c}
              onClick={() => { setCipher(c); setResult(""); setError(""); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                cipher === c
                  ? "bg-primary/10 text-primary cyber-border cyber-glow"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {cipherInfo[c].label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to encrypt or decrypt..."
              rows={4}
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Key</label>
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={cipherInfo[cipher].keyPlaceholder}
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground mt-1">{cipherInfo[cipher].keyHelp}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => process("encrypt")}
            className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Encrypt
          </button>
          <button
            onClick={() => process("decrypt")}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-card text-foreground font-medium hover:bg-secondary transition-colors"
          >
            Decrypt
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm mb-4">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <label className="text-sm font-medium mb-1.5 block">Result</label>
            <div className="relative rounded-lg border border-border bg-card p-4 font-mono text-sm break-all cyber-border">
              {result}
              <button
                onClick={copyResult}
                className="absolute top-2 right-2 p-1.5 rounded hover:bg-secondary transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

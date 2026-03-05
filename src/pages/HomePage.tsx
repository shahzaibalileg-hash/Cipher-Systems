import { motion } from "framer-motion";
import { Shield, Lock, FileText, Share2, Zap, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: FileText,
    title: "Text Encryption",
    desc: "Shift, Affine, Vigenère & Hill ciphers",
    path: "/text-encryption",
    color: "text-primary",
  },
  {
    icon: Lock,
    title: "File Encryption",
    desc: "AES-256-GCM encryption for any file",
    path: "/file-encryption",
    color: "text-cyber-purple",
  },
  {
    icon: Eye,
    title: "File Decryption",
    desc: "Decrypt .enc files with password",
    path: "/file-decryption",
    color: "text-cyber-blue",
  },
  {
    icon: Share2,
    title: "Secure Sharing",
    desc: "Share encrypted files with share codes",
    path: "/shared-files",
    color: "text-primary",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] grid-bg">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 cyber-gradient opacity-50" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-mono mb-6">
              <Zap className="h-3.5 w-3.5" />
              Client-side AES-256 Encryption
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
              <span className="text-gradient">CipherVault</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Encrypt text and files directly in your browser. Nothing leaves your device unencrypted. Zero-knowledge security with military-grade AES-256.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/text-encryption"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors cyber-glow"
              >
                <Shield className="h-4 w-4" />
                Start Encrypting
              </Link>
              <Link
                to="/file-encryption"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border bg-card text-foreground font-medium hover:bg-secondary transition-colors"
              >
                <Lock className="h-4 w-4" />
                Encrypt Files
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
            >
              <Link
                to={f.path}
                className="block p-6 rounded-xl bg-card border border-border hover:cyber-border hover:cyber-glow transition-all group"
              >
                <f.icon className={`h-8 w-8 ${f.color} mb-3 group-hover:scale-110 transition-transform`} />
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

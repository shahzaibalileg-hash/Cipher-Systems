import { Link, useLocation } from "react-router-dom";
import { Shield, Lock, Unlock, Share2, FileText, Home } from "lucide-react";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/text-encryption", label: "Text Encryption", icon: FileText },
  { path: "/file-encryption", label: "File Encryption", icon: Lock },
  { path: "/file-decryption", label: "File Decryption", icon: Unlock },
  { path: "/shared-files", label: "Shared Files", icon: Share2 },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-primary" />
            <span className="text-lg font-bold font-mono text-gradient">CipherVault</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  pathname === path
                    ? "bg-primary/10 text-primary cyber-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>
        {/* Mobile nav */}
        <div className="flex md:hidden overflow-x-auto pb-2 gap-1 -mx-2 px-2 scrollbar-none">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                pathname === path
                  ? "bg-primary/10 text-primary cyber-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

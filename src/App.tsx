import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HomePage from "@/pages/HomePage";
import TextEncryptionPage from "@/pages/TextEncryptionPage";
import FileEncryptionPage from "@/pages/FileEncryptionPage";
import FileDecryptionPage from "@/pages/FileDecryptionPage";
import SharedFilesPage from "@/pages/SharedFilesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/text-encryption" element={<TextEncryptionPage />} />
          <Route path="/file-encryption" element={<FileEncryptionPage />} />
          <Route path="/file-decryption" element={<FileDecryptionPage />} />
          <Route path="/shared-files" element={<SharedFilesPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

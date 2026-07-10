import { Navbar } from "@/components/layouts/Navbar";
import { HeroSection } from "@/components/features/landing/HeroSection";
import { ChatbotFab } from "@/components/features/chatbot/ChatbotFab";

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <ChatbotFab />
    </main>
  );
}

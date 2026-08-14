import type { Metadata } from "next";
import { AIChat } from "@/components/history/AIChat";
import { PageHeader } from "@/components/history/PageHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI History Assistant — AI Global History Map",
  description:
    "Chat with an AI guide about the Tang Dynasty era (618–907) and its world contemporaries.",
};

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <PageHeader icon="bot" titleKey="page.chat.title" subtitleKey="page.chat.subtitle" />
      <AIChat />
    </div>
  );
}

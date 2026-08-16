import type { Metadata } from "next";
import { headers } from "next/headers";
import { AIChat } from "@/components/history/AIChat";
import { PageHeader } from "@/components/history/PageHeader";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const accept = headers().get("accept-language") ?? "";
  const isZh = /\bzh(?:-|\b|$)/i.test(accept);
  return {
    title: isZh ? "AI 历史助手 — AI 全球历史地图" : "AI History Assistant — AI Global History Map",
    description: isZh ? "与 AI 向导对话，探索唐朝时期（618–907）及其世界同时代。" : "Interactive historical atlas of the Tang Dynasty era (618–907) and its world.",
  };
}

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <PageHeader icon="bot" titleKey="page.chat.title" subtitleKey="page.chat.subtitle" />
      <AIChat />
    </div>
  );
}

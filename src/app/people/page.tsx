import type { Metadata } from "next";
import { headers } from "next/headers";
import { PersonGraph } from "@/components/history/PersonGraph";
import { PageHeader } from "@/components/history/PageHeader";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const accept = headers().get("accept-language") ?? "";
  const isZh = /\bzh(?:-|\b|$)/i.test(accept);
  return {
    title: isZh ? "人物与关系 — AI 全球历史地图" : "People & Relationships — AI Global History Map",
    description: isZh ? "唐朝时期及其世界的 25 位关键人物：帝王、诗人、将领、僧侣与哈里发的人物关系图谱。" : "Interactive historical atlas of the Tang Dynasty era (618–907) and its world.",
  };
}

export default function PeoplePage() {
  return (
    <div className="space-y-6">
      <PageHeader icon="users" titleKey="page.people.title" subtitleKey="page.people.subtitle" />
      <PersonGraph />
    </div>
  );
}

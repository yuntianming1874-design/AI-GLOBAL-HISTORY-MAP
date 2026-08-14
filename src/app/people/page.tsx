import type { Metadata } from "next";
import { PersonGraph } from "@/components/history/PersonGraph";
import { PageHeader } from "@/components/history/PageHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "People & Relationships — AI Global History Map",
  description:
    "Force-directed graph of 25 key figures of the Tang era and its world: emperors, poets, generals, monks and caliphs.",
};

export default function PeoplePage() {
  return (
    <div className="space-y-6">
      <PageHeader icon="users" titleKey="page.people.title" subtitleKey="page.people.subtitle" />
      <PersonGraph />
    </div>
  );
}

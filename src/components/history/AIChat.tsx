"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, ChatResponse } from "@/lib/types";
import { Icon } from "@/components/ui/icons";
import { useExplorer } from "./ExplorerProvider";
import { useLocale } from "./LocaleProvider";
import {
  civilizations as seedCivs,
  events as seedEvents,
  locations as seedLocs,
  people as seedPeople,
} from "@/data/seed";

const entityZh = new Map<string, string>();
for (const e of seedEvents) entityZh.set(e.id, e.chineseTitle);
for (const p of seedPeople) entityZh.set(p.id, p.chineseName);
for (const c of seedCivs) entityZh.set(c.id, c.chineseName);
for (const l of seedLocs) entityZh.set(l.id, l.chineseName);
import { ActionButtons, EntityLinks, RecommendationsBlock, RichText } from "./chatBlocks";

interface UiMessage extends ChatMessage {
  source?: "openai" | "local";
  citations?: string[];
  links?: ChatResponse["links"];
  actions?: ChatResponse["actions"];
  recommendations?: ChatResponse["recommendations"];
}

/**
 * Context-aware AI history assistant (V0.2).
 * Sends the current HistoryContext (what the user is viewing) with every
 * request; renders entity links and navigation actions returned by the
 * engine. The UI follows the active locale (EN / 中文).
 */
export function AIChat({ className = "" }: { className?: string }) {
  const { context } = useExplorer();
  const { locale, t } = useLocale();
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: t("chat.greeting"),
        source: "local",
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy]);

  const entityName = (id: string | null) =>
    id ? (locale === "zh" ? entityZh.get(id) ?? id : id) : null;
  const contextNote = [
    context.eventId ? entityName(context.eventId) : null,
    context.personId ? entityName(context.personId) : null,
    context.civilizationId ? entityName(context.civilizationId) : null,
    context.locationId ? entityName(context.locationId) : null,
    context.year !== null
      ? locale === "zh"
        ? `${context.year} 年`
        : `year ${context.year}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  async function send(raw: string) {
    const content = raw.trim();
    if (!content || busy) return;
    setInput("");
    setError(null);
    const history: ChatMessage[] = messages
      .map((m): ChatMessage => ({ role: m.role, content: m.content }))
      .concat({ role: "user", content })
      .slice(-20);
    setMessages((m) => [...m, { role: "user", content }]);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, context, locale }),
      });
      if (!res.ok) throw new Error(`chat ${res.status}`);
      const data = (await res.json()) as ChatResponse;
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply,
          source: data.source,
          citations: data.citations,
          links: data.links,
          actions: data.actions,
          recommendations: data.recommendations,
        },
      ]);
    } catch {
      setError(t("chat.error"));
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  const showSuggestions = messages.length <= 1 && !busy;

  return (
    <div className={className}>
      <div className="panel flex h-[640px] flex-col overflow-hidden">
        <header className="flex items-center gap-3 border-b border-parchment-200 bg-parchment-100/70 px-5 py-3.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-vermilion text-white shadow-card">
            <Icon name="bot" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold text-ink">{t("page.chat.title")}</h2>
            <p className="truncate text-xs text-ink-faint">
              {contextNote
                ? t("chat.contextViewing", { ctx: contextNote })
                : t("chat.noContext")}
            </p>
          </div>
          <span className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full border border-parchment-300 bg-parchment-50 px-2.5 py-1 text-[11px] font-medium text-ink-faint">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-jade" />
            {t("chat.online")}
          </span>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-vermilion px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm">
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold-dark">
                  <Icon name="sparkles" className="h-4 w-4" />
                </span>
                <div className="max-w-[85%] space-y-2">
                  <div className="rounded-2xl rounded-tl-sm border border-parchment-200 bg-white px-4 py-3 shadow-sm">
                    <RichText text={m.content} />
                  </div>
                  <EntityLinks links={m.links ?? []} />
                  <ActionButtons actions={m.actions ?? []} />
                  <RecommendationsBlock recommendations={m.recommendations ?? []} />
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-faint">
                    <span
                      className={
                        "flex items-center gap-1 rounded-full px-2 py-0.5 font-medium " +
                        (m.source === "openai"
                          ? "bg-vermilion/10 text-vermilion-dark"
                          : "bg-gold/15 text-gold-dark")
                      }
                    >
                      <Icon name={m.source === "openai" ? "sparkles" : "book"} className="h-3 w-3" />
                      {m.source === "openai" ? t("chat.model") : t("chat.local")}
                    </span>
                    {m.citations && m.citations.length > 0 && (
                      <span className="flex items-center gap-1">
                        {t("chat.sources")}
                        {m.citations.slice(0, 4).map((c) => (
                          <span key={c} className="chip !px-1.5 !py-0 font-mono">
                            {c}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ),
          )}

          {busy && (
            <div className="flex items-center gap-3">
              <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold-dark">
                <Icon name="sparkles" className="h-4 w-4" />
              </span>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-parchment-200 bg-white px-4 py-3 shadow-sm">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-2 animate-bounce rounded-full bg-parchment-400"
                    style={{ animationDelay: `${i * 120}ms` }}
                  />
                ))}
                <span className="ml-1 text-xs text-ink-faint">{t("chat.thinking")}</span>
              </div>
            </div>
          )}

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {t("chat.error")}
            </p>
          )}
        </div>

        {showSuggestions && (
          <div className="flex flex-wrap gap-2 border-t border-parchment-200 bg-parchment-100/50 px-5 py-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                onClick={() => send(t(("chat.sugg." + i) as never))}
                className="rounded-full border border-parchment-300 bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-gold hover:text-ink"
              >
                {t(("chat.sugg." + i) as never)}
              </button>
            ))}
          </div>
        )}

        <form
          className="flex items-center gap-2 border-t border-parchment-200 bg-parchment-100/70 px-4 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("chat.placeholder")}
            aria-label={t("chat.placeholder")}
            className="input-field flex-1"
            maxLength={2000}
          />
          <button
            type="submit"
            disabled={busy || input.trim() === ""}
            aria-label={t("chat.send")}
            className="btn-primary !px-3.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon name="send" className="h-4 w-4" />
            <span className="hidden sm:inline">{t("chat.send")}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";

/**
 * V0.3 P0-4 — global error boundary (parchment style, no white screen).
 * Keeps the Atlas chrome: shows what went wrong and offers a retry.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("page error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl space-y-6 py-10 text-center">
      <div className="panel p-8">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gold-dark">
          Atlas error
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink">
          页面加载失败
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          历史地图集的这一页遇到了问题。你的探索进度都保存在网址里，不会丢失。
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2.5">
          <button onClick={reset} className="btn-primary !px-4 !py-2 text-sm">
            重试
          </button>
          <a href="/" className="btn-ghost !px-4 !py-2 text-sm">
            回到世界地图
          </a>
        </div>
        {error.digest && (
          <p className="mt-4 font-mono text-[10px] text-ink-faint">ref: {error.digest}</p>
        )}
      </div>
    </div>
  );
}

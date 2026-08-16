/** V0.3 P0-4 — 404 page in the atlas style. */
export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl space-y-6 py-10 text-center">
      <div className="panel p-8">
        <p className="font-mono text-xs text-gold-dark">404</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink">
          这段历史还不在图集里
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          你要找的页面不存在——也许它属于另一个时代。
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2.5">
          <a href="/" className="btn-primary !px-4 !py-2 text-sm">
            回到世界地图
          </a>
          <a href="/journeys" className="btn-ghost !px-4 !py-2 text-sm">
            查看学习旅程
          </a>
        </div>
      </div>
    </div>
  );
}

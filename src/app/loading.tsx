/** V0.3 P0-4 — route loading skeleton (keeps the atlas frame stable). */
export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="panel h-24 bg-parchment-200/60" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="panel h-80 bg-parchment-200/60" />
        <div className="panel h-80 bg-parchment-200/60" />
      </div>
      <div className="panel h-56 bg-parchment-200/60" />
    </div>
  );
}

import type { ReactNode } from "react";
import { Icon, type IconName } from "./icons";

export function Section({
  id,
  icon,
  title,
  subtitle,
  action,
  children,
}: {
  id?: string;
  icon?: IconName;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
            {icon && (
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gold/15 text-gold-dark">
                <Icon name={icon} className="h-4 w-4" />
              </span>
            )}
            {title}
          </h2>
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-ink-soft">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="flex h-64 items-center justify-center rounded-xl border border-parchment-300 bg-parchment-50/60"
    >
      <div className="flex flex-col items-center gap-3 text-ink-faint">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-parchment-300 border-t-vermilion" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}

export function ErrorBlock({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex h-40 items-center justify-center rounded-xl border border-red-200 bg-red-50 px-6 text-center text-sm text-red-700"
    >
      {message}
    </div>
  );
}

export function EmptyBlock({ message }: { message: string }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-parchment-300 bg-parchment-50/60 px-6 text-center text-sm text-ink-faint">
      {message}
    </div>
  );
}

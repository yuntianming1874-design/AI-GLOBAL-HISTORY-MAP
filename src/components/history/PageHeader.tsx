"use client";

import { Section } from "@/components/ui/primitives";
import type { IconName } from "@/components/ui/icons";
import { useLocale } from "./LocaleProvider";
import type { TranslationKey } from "@/lib/i18n";

/** Page header that follows the active locale. */
export function PageHeader({
  icon,
  titleKey,
  subtitleKey,
}: {
  icon: IconName;
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
}) {
  const { t } = useLocale();
  return <Section icon={icon} title={t(titleKey)} subtitle={t(subtitleKey)} />;
}

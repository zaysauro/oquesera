import type { ReactNode } from 'react';

/**
 * Marketing-pages layout (route group `(pages)`). Kumo One's public pages use
 * the regular theme tokens, so they follow the visitor's light/dark choice.
 * `overflow-x-clip` keeps any wide decorative element from panning on phones.
 */
export default function MarketingPagesLayout({ children }: { children: ReactNode }) {
  return <div className="overflow-x-clip bg-background text-foreground">{children}</div>;
}

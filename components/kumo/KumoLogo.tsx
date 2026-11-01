import { BRAND_NAME } from '@/config/brand';

/** Kumo One cloud mark: yellow cloud on a black tile. Same geometry as public/brand/kumo-mark.svg. */
export function KumoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#0a0a0a" />
      <g fill="#facc15">
        <circle cx="25" cy="34" r="10" />
        <circle cx="37" cy="29" r="13" />
        <circle cx="47" cy="37" r="8" />
        <rect x="15" y="34" width="40" height="11" rx="5.5" />
      </g>
      <rect x="30" y="49" width="4" height="7" rx="2" fill="#facc15" />
    </svg>
  );
}

export function KumoLogo({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-extrabold tracking-tight ${className}`}>
      <KumoMark size={size} />
      <span className="text-lg leading-none">
        Kumo <span className="text-yellow-500 dark:text-yellow-400">One</span>
      </span>
      <span className="sr-only">{BRAND_NAME}</span>
    </span>
  );
}

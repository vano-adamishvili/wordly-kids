import { WORDMARK_DOTS_SVG, WORDMARK_INK, WORDMARK_PATH, WORDMARK_RATIO, WORDMARK_VIEWBOX } from "./wordmark";
import Wivi from "../Wivi";

/** "wivilo" wordmark (vector, from public/brand). height in px. */
export function WiviloWordmark({ height = 28, className = "" }: { height?: number; className?: string }) {
  return (
    <svg
      viewBox={WORDMARK_VIEWBOX}
      height={height}
      width={Math.round(height * WORDMARK_RATIO)}
      className={className}
      role="img"
      aria-label="Wivilo"
    >
      <path d={WORDMARK_PATH} fill={WORDMARK_INK} />
      <g dangerouslySetInnerHTML={{ __html: WORDMARK_DOTS_SVG }} />
    </svg>
  );
}

/** Horizontal logo: Wivi + wordmark. */
export default function WiviloLogo({ height = 36, animate = false }: { height?: number; animate?: boolean }) {
  return (
    <span className="inline-flex items-end gap-1.5" aria-label="Wivilo" role="img">
      <Wivi mood="happy" size={Math.round(height * 1.15)} animate={animate} title="Wivi" className="-mb-[3%] shrink-0" />
      <WiviloWordmark height={height} />
    </span>
  );
}

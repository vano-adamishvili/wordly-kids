/**
 * Wobble — the Wordly Kids mascot.
 * An original, soft, jelly-like creature with a mint leaf sprout.
 * Pure SVG (no gradients/ids) so many instances can live on one page.
 */
export type WobbleMood = "happy" | "excited" | "thinking" | "encouraging";

const C = {
  body: "#8B6CE8",
  bodyDark: "#7556D6",
  belly: "#B7A3F6",
  ink: "#252442",
  leaf: "#72D9B3",
  leafDark: "#4FBF95",
  bud: "#FFD85A",
  cheek: "#FF8D85",
};

export default function Wobble({
  mood = "happy",
  size = 120,
  className = "",
  animate = true,
  title = "Wobble",
}: {
  mood?: WobbleMood;
  size?: number;
  className?: string;
  animate?: boolean;
  title?: string;
}) {
  const anim = !animate ? "" : mood === "excited" ? "wobble-bounce" : "wobble-idle";
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={`${anim} ${className}`}
      role="img"
      aria-label={title}
      style={{ overflow: "visible" }}
    >
      {/* ground shadow */}
      <ellipse cx="100" cy="186" rx="52" ry="7" fill={C.ink} opacity="0.08" />

      {/* legs */}
      <rect x="70" y="160" width="22" height="22" rx="11" fill={C.bodyDark} />
      <rect x="108" y="160" width="22" height="22" rx="11" fill={C.bodyDark} />

      {/* arms (behind body) */}
      <Arms mood={mood} />

      {/* sprout */}
      <path d="M100 46 C100 38 101 32 103 26" stroke={C.leafDark} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M102 30 C92 16 78 16 72 24 C80 34 94 36 102 30Z" fill={C.leaf} />
      <path d="M104 28 C112 12 130 10 138 18 C130 32 114 34 104 28Z" fill={C.leaf} />
      <path d="M106 27 C114 21 122 18 130 18" stroke={C.leafDark} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />

      {/* body – a soft jelly drop */}
      <path
        d="M100 42 C142 42 168 78 170 118 C172 154 148 174 100 174 C52 174 28 154 30 118 C32 78 58 42 100 42Z"
        fill={C.body}
      />
      {/* belly + highlights */}
      <ellipse cx="100" cy="146" rx="40" ry="22" fill={C.belly} opacity="0.55" />
      <path d="M58 82 C64 66 78 56 92 54" stroke="#fff" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.35" />
      <circle cx="54" cy="96" r="4" fill="#fff" opacity="0.35" />

      {/* cheeks */}
      <ellipse cx="62" cy="124" rx="11" ry="6.5" fill={C.cheek} opacity="0.55" />
      <ellipse cx="138" cy="124" rx="11" ry="6.5" fill={C.cheek} opacity="0.55" />

      <Face mood={mood} />

      {mood === "thinking" ? (
        <g><path d="M150 150 Q140 146 132 140" stroke={C.bodyDark} strokeWidth="14" strokeLinecap="round" fill="none" /><circle cx="128" cy="137" r="10" fill={C.bodyDark} /></g>
      ) : null}

      {mood === "excited" ? (
        <g fill={C.bud}>
          <Spark x={28} y={50} s={1} />
          <Spark x={172} y={60} s={0.8} />
          <Spark x={164} y={18} s={0.6} />
        </g>
      ) : null}
      {mood === "thinking" ? (
        <g fill="#fff" stroke={C.body} strokeWidth="3">
          <circle cx="160" cy="58" r="5" />
          <circle cx="172" cy="40" r="8" />
        </g>
      ) : null}
    </svg>
  );
}

function Spark({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 -12 C2 -4 4 -2 12 0 C4 2 2 4 0 12 C-2 4 -4 2 -12 0 C-4 -2 -2 -4 0 -12Z"
    />
  );
}

function Eye({ cx, cy, look = [0, 2] }: { cx: number; cy: number; look?: [number, number] }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx="15" ry="17" fill="#fff" />
      <circle cx={cx + look[0]} cy={cy + look[1]} r="9" fill={C.ink} />
      <circle cx={cx + look[0] + 3} cy={cy + look[1] - 4} r="3.2" fill="#fff" />
    </g>
  );
}

function Face({ mood }: { mood: WobbleMood }) {
  const ink = { stroke: C.ink, strokeWidth: 5, strokeLinecap: "round" as const, fill: "none" };
  switch (mood) {
    case "excited":
      return (
        <g>
          {/* happy closed eyes */}
          <path d="M66 102 Q78 88 90 102" {...ink} />
          <path d="M110 102 Q122 88 134 102" {...ink} />
          {/* big open smile */}
          <path d="M82 118 Q100 148 118 118Z" fill={C.ink} />
          <path d="M90 130 Q100 140 110 130 Q100 126 90 130Z" fill={C.cheek} />
        </g>
      );
    case "thinking":
      return (
        <g>
          <Eye cx={80} cy={100} look={[4, -5]} />
          <Eye cx={120} cy={100} look={[4, -5]} />
          <ellipse cx="100" cy="130" rx="6" ry="7" fill={C.ink} />
        </g>
      );
    case "encouraging":
      return (
        <g>
          <Eye cx={80} cy={100} />
          {/* wink */}
          <path d="M108 102 Q120 94 132 102" {...ink} />
          <path d="M82 120 Q100 142 118 120" {...ink} />
        </g>
      );
    default:
      return (
        <g>
          <Eye cx={80} cy={100} />
          <Eye cx={120} cy={100} />
          <path d="M80 119 Q100 148 120 119Z" fill={C.ink} />
          <path d="M89 131 Q100 141 111 131 Q100 126 89 131Z" fill={C.cheek} />
        </g>
      );
  }
}

function Arms({ mood }: { mood: WobbleMood }) {
  const arm = (x: number, y: number, rot: number) => (
    <rect x={x - 9} y={y - 18} width="18" height="36" rx="9" fill={C.bodyDark} transform={`rotate(${rot} ${x} ${y})`} />
  );
  switch (mood) {
    case "excited":
      return (
        <g>
          {arm(36, 78, -35)}
          {arm(164, 78, 35)}
        </g>
      );
    case "thinking":
      return (
        <g>
          {arm(34, 132, 35)}
          {/* hand to chin, drawn over the body below */}
          <g transform="translate(0 0)">
            <rect x="122" y="132" width="34" height="17" rx="8.5" fill={C.bodyDark} transform="rotate(-25 139 140)" />
          </g>
        </g>
      );
    case "encouraging":
      return (
        <g>
          {arm(34, 132, 35)}
          {arm(166, 82, 30)}
        </g>
      );
    default:
      return (
        <g>
          {arm(34, 132, 35)}
          {arm(166, 132, -35)}
        </g>
      );
  }
}

// Original physique silhouettes (angular vector style matching the hero panel).
// One per physiques.ts `silhouette` key — no copyrighted characters, pure SVG.

interface ArtProps {
  color: string;
}

function Frame({ color, children }: ArtProps & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 120 140" className="w-full h-full" aria-hidden
      style={{ filter: `drop-shadow(0 0 10px ${color}55)` }}>
      <g fill="#0b0b12" stroke={color} strokeWidth="2" strokeLinejoin="round">{children}</g>
    </svg>
  );
}

/* Each silhouette varies shoulder:waist:leg proportions + a signature prop. */

const Runner = ({ color }: ArtProps) => (
  <Frame color={color}>
    <ellipse cx="60" cy="18" rx="8" ry="9" />
    {/* lean torso, mid-stride legs */}
    <polygon points="52,28 44,34 42,62 50,70 46,96 34,120 44,124 56,98 60,84 66,100 80,118 88,112 72,92 70,68 78,60 76,34 68,28" />
  </Frame>
);

const Athletic = ({ color }: ArtProps) => (
  <Frame color={color}>
    <ellipse cx="60" cy="16" rx="8" ry="9" />
    {/* balanced shoulders, defined waist */}
    <polygon points="42,26 32,34 34,58 44,64 42,78 46,92 42,122 52,124 58,94 62,94 68,124 78,122 74,92 78,78 76,64 86,58 88,34 78,26 70,32 50,32" />
  </Frame>
);

const VTaper = ({ color }: ArtProps) => (
  <Frame color={color}>
    <ellipse cx="60" cy="15" rx="8" ry="9" />
    {/* wide lats to narrow waist — the classic V */}
    <polygon points="34,26 22,36 28,56 42,62 50,76 48,92 44,122 54,124 60,96 66,124 76,122 72,92 70,76 78,62 92,56 98,36 86,26 72,33 48,33" />
  </Frame>
);

const Block = ({ color }: ArtProps) => (
  <Frame color={color}>
    <ellipse cx="60" cy="15" rx="9" ry="9" />
    {/* thick torso and hips, powerlifter base */}
    <polygon points="38,25 26,34 26,66 36,74 36,92 40,124 54,124 56,96 64,96 66,124 80,124 84,92 84,74 94,66 94,34 82,25 70,31 50,31" />
  </Frame>
);

const Mass = ({ color }: ArtProps) => (
  <Frame color={color}>
    <ellipse cx="60" cy="14" rx="9" ry="9" />
    {/* maximum width everywhere */}
    <polygon points="30,24 14,36 18,62 34,70 34,88 38,124 54,124 56,98 64,98 66,124 82,124 86,88 86,70 102,62 106,36 90,24 74,31 46,31" />
  </Frame>
);

const BarAthlete = ({ color }: ArtProps) => (
  <Frame color={color}>
    {/* pull-up bar */}
    <line x1="16" y1="14" x2="104" y2="14" stroke={color} strokeWidth="3" />
    <line x1="16" y1="14" x2="16" y2="30" stroke={color} strokeWidth="3" />
    <line x1="104" y1="14" x2="104" y2="30" stroke={color} strokeWidth="3" />
    <ellipse cx="60" cy="34" rx="7" ry="8" />
    {/* athlete hanging mid pull-up, L-sit legs */}
    <polygon points="44,16 40,20 46,42 54,46 52,66 50,80 74,84 76,72 68,66 66,46 74,42 80,20 76,16 70,32 50,32" />
  </Frame>
);

const Rings = ({ color }: ArtProps) => (
  <Frame color={color}>
    {/* gymnastics rings */}
    <line x1="34" y1="6" x2="34" y2="26" stroke={color} strokeWidth="2.5" />
    <line x1="86" y1="6" x2="86" y2="26" stroke={color} strokeWidth="2.5" />
    <circle cx="34" cy="32" r="7" fill="none" />
    <circle cx="86" cy="32" r="7" fill="none" />
    <ellipse cx="60" cy="40" rx="7" ry="8" />
    {/* support hold, straight body */}
    <polygon points="41,34 48,50 54,54 52,78 48,102 54,124 60,104 66,124 72,102 68,78 66,54 72,50 79,34 72,44 48,44" />
  </Frame>
);

const Hybrid = ({ color }: ArtProps) => (
  <Frame color={color}>
    <ellipse cx="58" cy="16" rx="8" ry="9" />
    {/* athletic frame with kettlebell */}
    <polygon points="42,26 32,34 34,58 44,64 42,88 44,122 54,124 58,96 62,98 66,124 76,122 74,88 74,64 84,58 86,34 76,26 68,32 48,32" />
    <circle cx="94" cy="106" r="9" fill="none" />
    <path d="M 88 100 Q 94 90 100 100" fill="none" strokeWidth="2.5" />
  </Frame>
);

const Beach = ({ color }: ArtProps) => (
  <Frame color={color}>
    <ellipse cx="60" cy="16" rx="8" ry="9" />
    {/* big chest/arms emphasis, relaxed stance + sun */}
    <circle cx="100" cy="24" r="8" fill="none" strokeDasharray="3 3" />
    <polygon points="38,26 26,36 30,58 44,62 48,76 46,92 44,122 54,124 60,98 66,124 76,122 74,92 72,76 76,62 90,58 94,36 82,26 70,33 50,33" />
  </Frame>
);

const Arrow = ({ color }: ArtProps) => (
  <Frame color={color}>
    {/* before → after transformation arc */}
    <ellipse cx="34" cy="30" rx="7" ry="8" />
    <polygon points="24,40 18,48 20,72 26,76 24,100 28,118 36,118 36,98 42,98 44,118 52,118 50,92 48,72 50,48 44,40" opacity="0.45" />
    <path d="M 52 60 Q 66 44 80 56" fill="none" strokeWidth="2.5" />
    <polygon points="80,48 88,58 76,60" stroke="none" fill={color} />
    <ellipse cx="90" cy="52" rx="7" ry="8" />
    <polygon points="80,62 74,70 76,88 84,92 82,106 84,124 92,124 94,104 98,124 106,124 104,92 108,88 106,70 100,62" />
  </Frame>
);

export const PHYSIQUE_ART: Record<string, (props: ArtProps) => JSX.Element> = {
  runner: Runner,
  athletic: Athletic,
  'v-taper': VTaper,
  block: Block,
  mass: Mass,
  'bar-athlete': BarAthlete,
  rings: Rings,
  hybrid: Hybrid,
  beach: Beach,
  arrow: Arrow,
};

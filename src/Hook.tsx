import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT } from "./theme";
import { HOOK_KESTO } from "./timing";

const RIVIT = ["Kuka on pitänyt", "Suomen kassaa", "hallussaan viimeiset", "40 vuotta?"];

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ulos = interpolate(frame, [HOOK_KESTO - 15, HOOK_KESTO], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  let sanaIndeksi = 0;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT,
        color: COLORS.text,
        opacity: ulos,
      }}
    >
      <div style={{ textAlign: "center", fontSize: 84, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
        {RIVIT.map((rivi) => (
          <div key={rivi}>
            {rivi.split(" ").map((sana) => {
              const s = spring({ frame: frame - 6 - sanaIndeksi++ * 4, fps, config: { damping: 200 } });
              return (
                <span
                  key={sana}
                  style={{
                    display: "inline-block",
                    margin: "0 0.14em",
                    opacity: s,
                    transform: `translateY(${(1 - s) * 30}px)`,
                  }}
                >
                  {sana}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT } from "./theme";
import { LOPETUS } from "./timing";

export const Lopetus: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rivi1 = spring({ frame: frame - LOPETUS.rivi1, fps, config: { damping: 200 }, durationInFrames: 30 });
  const rivi2 = spring({ frame: frame - LOPETUS.rivi2, fps, config: { damping: 200 }, durationInFrames: 30 });

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", fontFamily: FONT, color: COLORS.text, textAlign: "center" }}
    >
      <div
        style={{
          fontSize: 84,
          fontWeight: 500,
          letterSpacing: "-0.02em",
          opacity: rivi1,
          transform: `translateY(${(1 - rivi1) * 24}px)`,
        }}
      >
        On aika kokeilla
      </div>
      <div
        style={{
          fontSize: 140,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          marginTop: 12,
          opacity: rivi2,
          transform: `translateY(${(1 - rivi2) * 24}px)`,
        }}
      >
        jotain muuta.
      </div>
    </AbsoluteFill>
  );
};

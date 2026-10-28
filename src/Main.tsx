import { AbsoluteFill, Sequence } from "remotion";
import { Hook } from "./Hook";
import { Story } from "./Story";
import { COLORS } from "./theme";
import { HOOK_KESTO, STORY_KESTO } from "./timing";

export const Main: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.bg }}>
    <Sequence durationInFrames={HOOK_KESTO} name="1 Koukku">
      <Hook />
    </Sequence>
    <Sequence from={HOOK_KESTO} durationInFrames={STORY_KESTO} name="2–4 Aikajana ja vertailu">
      <Story />
    </Sequence>
  </AbsoluteFill>
);

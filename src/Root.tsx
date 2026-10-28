import { Composition } from "remotion";
import { Main } from "./Main";
import { FPS } from "./theme";
import { KOKONAISKESTO } from "./timing";

export const RemotionRoot: React.FC = () => (
  <Composition id="Main-9x16" component={Main} durationInFrames={KOKONAISKESTO} fps={FPS} width={1080} height={1920} />
);

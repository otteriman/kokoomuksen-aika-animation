import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setCodec("h264");
Config.setCrf(18);
Config.setEntryPoint("src/index.ts");

// Valinnainen: käytä valmiiksi asennettua Chromea Remotionin oman latauksen sijaan.
const browser = process.env.REMOTION_BROWSER_EXECUTABLE;
if (browser) {
  Config.setBrowserExecutable(browser);
}

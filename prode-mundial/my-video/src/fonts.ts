import { loadFont as loadBarlow } from "@remotion/google-fonts/BarlowCondensed";
import { loadFont as loadRoboto } from "@remotion/google-fonts/Roboto";

export const { fontFamily: barlowCondensed } = loadBarlow("normal", {
  weights: ["700", "900"],
  subsets: ["latin"],
});

export const { fontFamily: roboto } = loadRoboto("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin"],
});

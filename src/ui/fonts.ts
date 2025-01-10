import {Inter, DM_Serif_Text, Sora} from "next/font/google";

export const fontSans = Inter({subsets: ["latin"], variable: "--font-sans"});

export const fontSerif = DM_Serif_Text({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
});

export const fontHead = Sora({
  subsets: ["latin"],
  weight: ["700", "800", "500", "600"],
  variable: "--font-head",
});

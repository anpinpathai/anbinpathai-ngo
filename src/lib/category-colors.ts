import type { ColorKey } from "@/content/ta-LK";

export const categoryColor: Record<
  ColorKey,
  { solid: string; soft: string; text: string; border: string; dot: string; topBorder: string; tint: string }
> = {
  red: {
    solid: "bg-cat-red text-white",
    soft: "bg-cat-red/10 text-cat-red",
    text: "text-cat-red",
    border: "border-cat-red",
    dot: "bg-cat-red",
    topBorder: "border-t-cat-red",
    tint: "bg-cat-red/5",
  },
  green: {
    solid: "bg-cat-green text-white",
    soft: "bg-cat-green/10 text-cat-green",
    text: "text-cat-green",
    border: "border-cat-green",
    dot: "bg-cat-green",
    topBorder: "border-t-cat-green",
    tint: "bg-cat-green/5",
  },
  purple: {
    solid: "bg-cat-purple text-white",
    soft: "bg-cat-purple/10 text-cat-purple",
    text: "text-cat-purple",
    border: "border-cat-purple",
    dot: "bg-cat-purple",
    topBorder: "border-t-cat-purple",
    tint: "bg-cat-purple/5",
  },
  blue: {
    solid: "bg-cat-blue text-white",
    soft: "bg-cat-blue/10 text-cat-blue",
    text: "text-cat-blue",
    border: "border-cat-blue",
    dot: "bg-cat-blue",
    topBorder: "border-t-cat-blue",
    tint: "bg-cat-blue/5",
  },
  teal: {
    solid: "bg-cat-teal text-white",
    soft: "bg-cat-teal/10 text-cat-teal",
    text: "text-cat-teal",
    border: "border-cat-teal",
    dot: "bg-cat-teal",
    topBorder: "border-t-cat-teal",
    tint: "bg-cat-teal/5",
  },
};

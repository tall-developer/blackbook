import React from "react";
import { SvgXml } from "react-native-svg";

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
</svg>
`;

type Props = {
  size?: number;
  color?: string;
};

export default function HomeIcon({ size = 24, color = "#000" }: Props) {
  return <SvgXml xml={svg} width={size} height={size} fill={color} />;
}

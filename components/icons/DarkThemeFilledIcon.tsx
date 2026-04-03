import React from "react";
import Svg, { Circle, Defs, Mask, Path, Rect } from "react-native-svg";

type DarkThemeFilledIconProps = {
  size?: number;
  color?: string;
};

export default function DarkThemeFilledIcon({
  size = 22,
  color = "#1C1C1C",
}: DarkThemeFilledIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs>
        <Mask id="cutout">
          <Rect width="512" height="512" fill="#fff" />
          <Path d="M256 86 A170 170 0 0 1 256 426 Z" fill="#000" />
        </Mask>
      </Defs>
      <Circle cx="256" cy="256" r="240" fill={color} mask="url(#cutout)" />
      <Path d="M256 16 A240 240 0 0 0 256 496 Z" fill={color} />
    </Svg>
  );
}

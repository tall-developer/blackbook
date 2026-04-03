import React, { memo } from "react";
import { SvgXml } from "react-native-svg";

type BmcLogoIconProps = {
  size?: number;
};

const ICON_XML = "\u003c?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?\u003e\n\u003csvg width=\"256\" height=\"306\" viewBox=\"0 0 256 306\" xmlns=\"http://www.w3.org/2000/svg\"\u003e\n  \u003c!-- Coffee Cup Lid (top swirl) --\u003e\n  \u003cpath d=\"M 95 35 Q 85 45, 85 58 Q 85 68, 95 75 Q 125 82, 155 75 Q 165 68, 165 58 Q 165 45, 155 35 Q 125 28, 95 35 Z\" \n        fill=\"none\" stroke=\"#333\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/\u003e\n  \n  \u003c!-- Inner lid swirl --\u003e\n  \u003cellipse cx=\"125\" cy=\"50\" rx=\"35\" ry=\"8\" \n           fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/\u003e\n  \n  \u003c!-- Middle lid section --\u003e\n  \u003cpath d=\"M 75 85 Q 70 95, 72 105 Q 75 115, 85 122 Q 120 135, 165 122 Q 175 115, 178 105 Q 180 95, 175 85 Q 165 75, 145 72 Q 105 70, 85 72 Q 75 75, 75 85 Z\" \n        fill=\"none\" stroke=\"#333\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/\u003e\n  \n  \u003c!-- Inner middle section --\u003e\n  \u003cellipse cx=\"127\" cy=\"98\" rx=\"42\" ry=\"10\" \n           fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/\u003e\n  \n  \u003c!-- Coffee cup body outline --\u003e\n  \u003cpath d=\"M 85 135 L 95 235 Q 95 250, 110 255 L 145 255 Q 160 250, 160 235 L 170 135 Q 168 125, 155 125 L 100 125 Q 87 125, 85 135 Z\" \n        fill=\"none\" stroke=\"#333\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/\u003e\n  \n  \u003c!-- Coffee inside cup (yellow liquid) --\u003e\n  \u003cpath d=\"M 100 145 L 107 225 Q 107 235, 115 238 L 140 238 Q 148 235, 148 225 L 155 145 Q 154 140, 145 138 L 110 138 Q 101 140, 100 145 Z\" \n        fill=\"#FFD700\" stroke=\"#333\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/\u003e\n  \n  \u003c!-- Cup opening (top ellipse) --\u003e\n  \u003cellipse cx=\"127.5\" cy=\"130\" rx=\"42\" ry=\"8\" \n           fill=\"white\" stroke=\"#333\" stroke-width=\"2\"/\u003e\n\u003c/svg\u003e\n";

function BmcLogoIcon({ size = 24 }: BmcLogoIconProps) {
  return <SvgXml xml={ICON_XML} width={size} height={size} />;
}

export default memo(BmcLogoIcon);

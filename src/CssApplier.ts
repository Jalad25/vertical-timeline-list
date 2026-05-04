import type { ColorPair, VerticalTimelineListSettings } from "./main";

//#region Types/Objects/Interfaces

export const Theme = {
  dark:  "dark",
  light: "light",
} as const;
export type Theme = (typeof Theme)[keyof typeof Theme];

export const ColorSpace = {
  RGB:  "RGB",
  RGBA: "RGBA",
  Hex:  "Hex",
  HSL:  "HSL",
  HSLA: "HSLA",
} as const;
export type ColorSpace = (typeof ColorSpace)[keyof typeof ColorSpace];

//#endregion

//#region CSS application

export function applyCssVariables(prefix: string, s: VerticalTimelineListSettings): void {
  const set = (name: string, value: string) => {
    activeDocument.body.setCssProps({ [`--${prefix}-${name}`]: value });
  };
  const px = (n: number) => `${n}px`;
  const themed = (c: ColorPair) =>
    currentColorScheme() === Theme.light ? c.light : c.dark;
  const color = (c: ColorPair, space: ColorSpace) =>
    returnColorSpaceValueFromHex(themed(c), space);

  // Set dimensions
  set("dot-separation", px(s.dotSeparation));
  set("line-padding", px(s.linePadding));
  set("dotChildren-padding", px(s.dotChildrenPadding));
  set("dotChildren-top-margin", px(s.dotChildrenTopMargin));
  set("dotChildren-bottom-margin", px(s.dotChildrenBottomMargin));

  // Set theme
  set("dot-color", color(s.dotColor, ColorSpace.Hex));
  set("dot-collapsible-color", color(s.dotCollapsibleColor, ColorSpace.Hex));
  set("dot-collapsible-shadow-color", color(s.dotCollapsibleShadowColor, ColorSpace.HSLA));
  set("line-color", color(s.lineColor, ColorSpace.Hex));
  set("dotChildren-background-color", color(s.dotChildrenBackgroundColor, ColorSpace.Hex));

  // Set behavior
  if (s.dotCollapsible) {
    set("dot-collapsible-display", "inline-flex");
    set("dot-collapsible-cursor",  "pointer");
  } else {
    set("dot-collapsible-display", "none");
    set("dot-collapsible-cursor",  "none");
  }
}

//#endregion

//#region Utilities

function currentColorScheme(): Theme {
  return activeDocument.querySelector(".theme-light") ? Theme.light : Theme.dark;
}

function returnColorSpaceValueFromHex(value: string, colorSpace: ColorSpace): string {
  switch (colorSpace) {
    case ColorSpace.RGB:  return convertHexToRGB(value, true) as string;
    case ColorSpace.RGBA: return convertHexToRGBA(value, true, 0.15) as string;
    case ColorSpace.Hex:  return value;
    case ColorSpace.HSL:  return convertHexToHSL(value, true) as string;
    case ColorSpace.HSLA: return convertHexToHSLA(value, true, 0.15) as string;
  }
}

function convertHexToRGB(hex: string, returnString: boolean) {
  let r = 0,
      g = 0,
      b = 0;

  if (hex.length == 4) {
    r = parseInt("0x" + hex[1] + hex[1], 16);
    g = parseInt("0x" + hex[2] + hex[2], 16);
    b = parseInt("0x" + hex[3] + hex[3], 16);
  } else if (hex.length == 5) {
    r = parseInt("0x" + hex[1] + hex[1], 16);
    g = parseInt("0x" + hex[2] + hex[2], 16);
    b = parseInt("0x" + hex[3] + hex[3], 16);
  } else if (hex.length == 7) {
    r = parseInt("0x" + hex[1] + hex[2], 16);
    g = parseInt("0x" + hex[3] + hex[4], 16);
    b = parseInt("0x" + hex[5] + hex[6], 16);
  } else if (hex.length == 9) {
    r = parseInt("0x" + hex[1] + hex[2], 16);
    g = parseInt("0x" + hex[3] + hex[4], 16);
    b = parseInt("0x" + hex[5] + hex[6], 16);
  }

  const rgb = [+r, +g, +b];

  return returnString ? "rgb(" + rgb.join(", ") + ")" : rgb;
}

function convertHexToRGBA(hex: string, returnString: boolean, defaultAlpha: number) {
  let a = defaultAlpha;

  const rgb = convertHexToRGB(hex, false) as number[];

  if (hex.length == 5) {
    a = parseInt("0x" + hex[4] + hex[4], 16);
    a = parseFloat((a / 255).toFixed(2));
  } else if (hex.length == 9) {
    a = parseInt("0x" + hex[7] + hex[8], 16);
    a = parseFloat((a / 255).toFixed(2));
  }

  const rgba = rgb;
  rgba.push(+a);

  return returnString ? "rgba(" + rgba.join(", ") + ")" : rgba;
}

function convertHexToHSL(hex: string, returnString: boolean) {
  let r = 0,
      g = 0,
      b = 0;

  const rgb = convertHexToRGB(hex, false) as number[];
  r = rgb[0];
  g = rgb[1];
  b = rgb[2];

  r /= 255;
  g /= 255;
  b /= 255;
  const cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin;
  let h = 0,
      s = 0,
      l = 0;

  if (delta == 0)
    h = 0;
  else if (cmax == r)
    h = ((g - b) / delta) % 6;
  else if (cmax == g)
    h = (b - r) / delta + 2;
  else
    h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0)
    h += 360;

  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(0);
  l = +(l * 100).toFixed(0);

  const hsl = [h, s, l];

  return returnString ? "hsl(" + hsl[0] + "," + hsl[1] + "%," + hsl[2] + "%)" : hsl;
}

function convertHexToHSLA(hex: string, returnString: boolean, defaultAlpha: number) {
  let a = defaultAlpha;

  const hsl = convertHexToHSL(hex, false) as number[];

  if (hex.length == 5) {
    a = parseFloat((parseInt(("0x" + hex[4] + hex[4])) / 255).toFixed(2));
  } else if (hex.length == 9) {
    a = parseFloat((parseInt(("0x" + hex[7] + hex[8])) / 255).toFixed(2));
  }

  const hsla = hsl;
  hsla.push(a);

  return returnString ? "hsla(" + hsla[0] + "," + hsla[1] + "%," + hsla[2] + "%," + hsla[3] + ")" : hsla;
}

//#endregion

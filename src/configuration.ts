import { ColorSpace } from 'src/constants'
import { returnColorSpaceValueFromHex, currentColorScheme } from 'src/utilities';

//#region Configuration

type ConfigurationDetails = {
  name: string | undefined;
  description: string | undefined;
  image: string | undefined;
}

//#endregion

//#region CSS Properties

type CSSProperty = {
  property: string;
  value: string;
}

export interface CSSColorProperty extends CSSProperty {
  colorSpace: ColorSpace;
}

export interface ThemesCSSColorProperty {
  [theme: number]: CSSColorProperty;
}

interface CSSToggleProperty {
  [behavior: string]: CSSProperty[];
}

export interface CSSToggleProperties {
  enabled: boolean;
  "true": CSSToggleProperty;
  "false": CSSToggleProperty;
}

//#endregion

//#region Plugin Configuration

interface TimelinePiece {
  [key: string]: ((ThemesCSSColorProperty | CSSToggleProperties) & ConfigurationDetails)[];
}

export class VerticalTimelineListPluginConfiguration {
  pluginPrefix: string
  "timelineThemesCSSColors": TimelinePiece = {};
  "timelineCSSToggles": TimelinePiece = {};

  constructor(pluginPrefix: string) {
    //Set CSS Properties for Themes
    this.timelineThemesCSSColors["dot"] = [
      {
        name: "Dot color",
        description: "Dots without details",
        image: "Dot.png",
        0: {
          property: "color",
          value: "#888888",
          colorSpace: ColorSpace.Hex
        },
        1: {
          property: "color",
          value: "#888888",
          colorSpace: ColorSpace.Hex
        }
      } as ThemesCSSColorProperty & ConfigurationDetails,
      {
        name: "Dot collapsible color",
        description: "Dots with details",
        image: "CollapsibleDot.png",
        0: {
          property: "collapsible-color",
          value: "#8A5CF5",
          colorSpace: ColorSpace.Hex
        },
        1: {
          property: "collapsible-color",
          value: "#8A5CF5",
          colorSpace: ColorSpace.Hex
        }
      } as ThemesCSSColorProperty & ConfigurationDetails,
      {
        name: "Dot collapsible hover color",
        description: "Only visible when collapsible option is on",
        image: "CollapsibleDot.png",
        0: {
          property: "collapsible-shadow-color",
          value: "#8A5CF5",
          colorSpace: ColorSpace.HSLA
        },
        1: {
          property: "collapsible-shadow-color",
          value: "#8A5CF5",
          colorSpace: ColorSpace.HSLA
        }
      } as ThemesCSSColorProperty & ConfigurationDetails
    ];
    this.timelineThemesCSSColors["line"] = [
      {
        name: "Line color",
        description: "",
        image: "Line.png",
        0: {
          property: "color",
          value: "#ffffff",
          colorSpace: ColorSpace.Hex
        },
        1: {
          property: "color",
          value: "#000000",
          colorSpace: ColorSpace.Hex
        }
      } as ThemesCSSColorProperty & ConfigurationDetails
    ];
    this.timelineThemesCSSColors["dotChildren"] = [
      {
        name: "Dot details background color",
        description: "",
        image: "DotDescription.png",
        0: {
          property: "background-color",
          value: "#00000067",
          colorSpace: ColorSpace.Hex
        },
        1: {
          property: "background-color",
          value: "#8f8f8f67",
          colorSpace: ColorSpace.Hex
        }
      } as ThemesCSSColorProperty & ConfigurationDetails
    ];

    //Set CSS Properties based on toggles
    this.timelineCSSToggles["dot"] = [
      {
        name: "Dot collapsible",
        description: "Dots with details can be collapsed",
        image: "CollapsingDot.gif",
        enabled: false,
        true: {
          "collapsible": [
            {
              property: "display",
              value: "inline-flex"
            },
            {
              property: "cursor",
              value: "pointer"
            }
          ]
        },
        false: {
          "collapsible": [
            {
              property: "display",
              value: "none"
            },
            {
              property: "cursor",
              value: "none"
            }
          ]
        }
      } as CSSToggleProperties & ConfigurationDetails
    ];

    this.pluginPrefix = pluginPrefix;
  }

  async loadConfiguration() {
    // Set CSS Color
    Object.keys(this.timelineThemesCSSColors).forEach(
      (timelinePiece: keyof TimelinePiece) => {
        const themesCSSColorProperty = this.timelineThemesCSSColors[timelinePiece] as ThemesCSSColorProperty[];
        themesCSSColorProperty.forEach(
          (themeCSSColorProperty: ThemesCSSColorProperty) => {
            this.setColorCSSSetting(document, timelinePiece as string, `${themeCSSColorProperty[currentColorScheme()].property}`, themeCSSColorProperty[currentColorScheme()].value, themeCSSColorProperty[currentColorScheme()].colorSpace);
          }
        )
      }
    )

    // Set CSS toggles
    Object.keys(this.timelineCSSToggles).forEach(
      (timelinePiece: keyof TimelinePiece) => {
        const cssToggleProperties = this.timelineCSSToggles[timelinePiece] as CSSToggleProperties[];
        cssToggleProperties.forEach(
          (cssToggleProperty: CSSToggleProperties) => {
            const enabledCSSToggleProperty = cssToggleProperty.enabled ? cssToggleProperty.true : cssToggleProperty.false;
            Object.keys(enabledCSSToggleProperty).forEach(
              (behavior: string) => {
                enabledCSSToggleProperty[behavior].forEach(
                  (cssProperty: CSSProperty) => {
                    this.setCSSSetting(document, timelinePiece as string, `${behavior}-${cssProperty.property}`, cssProperty.value);
                  }
                )
              }
            )
          }
        )
      }
    )
  }

  private buildCSSProperty (piece: string, cssProperty: string) : string {
    return ([`--${this.pluginPrefix}`, piece, cssProperty]).filter(c => { return c !== null; }).join("-");
  }
  
  private setCSSProperty (el: HTMLElement, property: string, value: string) {
    el.setCssProps({ [property]: value });
  }
  
  private setColorCSSSetting (document: Document, piece: string, property: string, value: string, colorSpace: ColorSpace) {
    this.setCSSSetting(document, piece, property, returnColorSpaceValueFromHex(value, colorSpace));
  }
  
  private setCSSSetting (document: Document, piece: string, property: string, value: string) {
    this.setCSSProperty(document.body, this.buildCSSProperty(piece, property), value);
  }
}

//#endregion
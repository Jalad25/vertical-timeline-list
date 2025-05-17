import { ColorSpace, Theme } from 'src/constants'
import { returnColorSpaceValueFromHex, currentColorScheme } from 'src/utilities';

//#region Images

// @ts-ignore  
import CollapsibleDot from 'screenshots/CollapsibleDot.png';
// @ts-ignore  
import CollapsingDot from 'screenshots/CollapsingDot.gif';
// @ts-ignore  
import Dot from 'screenshots/Dot.png';
// @ts-ignore  
import DotDescription from 'screenshots/DotDescription.png';
// @ts-ignore  
import Line from 'screenshots/Line.png';

//#endregion

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
  version: string;
  "timelineThemesCSSColors": TimelinePiece = {};
  "timelineCSSToggles": TimelinePiece = {};

  constructor (pluginPrefix: string, version: string) {
    //Set version and plugin prefix
    this.version = version;
    this.pluginPrefix = pluginPrefix;

    //Set CSS Properties for Themes
    this.timelineThemesCSSColors["dot"] = [
      {
        name: "Dot color",
        description: "Dots without details",
        image: Dot.replace('./', ''),
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
        image: CollapsibleDot.replace('./', ''),
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
        image: CollapsibleDot.replace('./', ''),
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
        image: Line.replace('./', ''),
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
        image: DotDescription.replace('./', ''),
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
        image: CollapsingDot.replace('./', ''),
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
  }

  async loadConfiguration () {
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

  async loadExistingConfiguration (savedConfiguration: any) {
    if (savedConfiguration && savedConfiguration !== null) {
      //Override CSS Properties for Themes
      Object.keys(this.timelineThemesCSSColors).forEach(
        (timelinePieceKey: string) => {
          if (savedConfiguration.timelineThemesCSSColors[timelinePieceKey]) {
            this.timelineThemesCSSColors[timelinePieceKey].forEach(
              (cssColorProperty: ThemesCSSColorProperty & ConfigurationDetails, index: number) => {
                if (cssColorProperty.name === savedConfiguration.timelineThemesCSSColors[timelinePieceKey][index].name) {
                  (this.timelineThemesCSSColors[timelinePieceKey][index] as ThemesCSSColorProperty & ConfigurationDetails)[Theme.dark].value = (savedConfiguration.timelineThemesCSSColors[timelinePieceKey][index] as ThemesCSSColorProperty & ConfigurationDetails)[Theme.dark].value ?? (this.timelineThemesCSSColors[timelinePieceKey][index] as ThemesCSSColorProperty & ConfigurationDetails)[Theme.dark].value;
                  (this.timelineThemesCSSColors[timelinePieceKey][index] as ThemesCSSColorProperty & ConfigurationDetails)[Theme.light].value = (savedConfiguration.timelineThemesCSSColors[timelinePieceKey][index] as ThemesCSSColorProperty & ConfigurationDetails)[Theme.light].value ?? (this.timelineThemesCSSColors[timelinePieceKey][index] as ThemesCSSColorProperty & ConfigurationDetails)[Theme.light].value;
                }
              }
            );
          }
        }
      );

      //Override CSS Properites based on toggles
      Object.keys(this.timelineCSSToggles).forEach(
        (timelinePieceKey: string) => {
          if (savedConfiguration.timelineCSSToggles[timelinePieceKey]) {
            this.timelineCSSToggles[timelinePieceKey].forEach(
              (cssToggleProperty: CSSToggleProperties & ConfigurationDetails, index: number) => {
                if (cssToggleProperty.name === savedConfiguration.timelineCSSToggles[timelinePieceKey][index].name) {
                  (this.timelineCSSToggles[timelinePieceKey][index] as CSSToggleProperties & ConfigurationDetails).enabled = (savedConfiguration.timelineCSSToggles[timelinePieceKey][index] as CSSToggleProperties & ConfigurationDetails).enabled ?? (this.timelineCSSToggles[timelinePieceKey][index] as CSSToggleProperties & ConfigurationDetails).enabled;
                }
              }
            );
          }
        }
      );
    }
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
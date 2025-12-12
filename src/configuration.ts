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
// @ts-ignore
import LinePadding from 'screenshots/LinePadding.png'
// @ts-ignore
import DotSeparation from 'screenshots/DotSeparation.png'
// @ts-ignore
import DotDetailPadding from 'screenshots/DotDetailPadding.png'
// @ts-ignore
import DotDetailTopSeparation from 'screenshots/DotDetailTopSeparation.png'
// @ts-ignore
import DotDetailBottomSeparation from 'screenshots/DotDetailBottomSeparation.png'

//#endregion

//#region Configuration

type ConfigurationDetails = {
  id: string;
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

export type CSSDimensionProperty = CSSProperty;

//#endregion

//#region Plugin Configuration

interface TimelinePiece {
  [key: string]: ((ThemesCSSColorProperty | CSSToggleProperties | CSSDimensionProperty) & ConfigurationDetails)[];
}

export class VerticalTimelineListPluginConfiguration {
  pluginPrefix: string
  version: string;
  "timelineCSSDimensions": TimelinePiece = {};
  "timelineThemesCSSColors": TimelinePiece = {};
  "timelineCSSToggles": TimelinePiece = {};

  constructor (pluginPrefix: string, version: string) {
    //Set version and plugin prefix
    this.version = version;
    this.pluginPrefix = pluginPrefix;

    //Set CSS Properties for Dimensions
    this.timelineCSSDimensions["dot"] = [
      {
        id: "dot-separation",
        name: "Dot separation",
        description: "Gap between dots on line",
        image: DotSeparation,
        property: "separation",
        value: "10px"
      }
    ];
    this.timelineCSSDimensions["line"] = [
      {
        id: "line-padding",
        name: "Line padding",
        description: "Line left and right padding",
        image: LinePadding,
        property: "padding",
        value: "12px"
      }
    ];
    this.timelineCSSDimensions["dotChildren"] = [
      {
        id: "dotChildren-padding",
        name: "Dot details padding",
        description: "Details top, bottom, left, and right padding",
        image: DotDetailPadding,
        property: "padding",
        value: "10px"
      },
      {
        id: "dotChildren-top-margin",
        name: "Dot details top separation",
        description: "",
        image: DotDetailTopSeparation,
        property: "top-margin",
        value: "10px"
      },
      {
        id: "dotChildren-bottom-margin",
        name: "Dot details bottom separation",
        description: "",
        image: DotDetailBottomSeparation,
        property: "bottom-margin",
        value: "10px"
      }
    ];

    //Set CSS Properties for Themes
    this.timelineThemesCSSColors["dot"] = [
      {
        id: "dot-color",
        name: "Dot color",
        description: "Dots without details",
        image: Dot,
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
        id: "dot-collapsible-color",
        name: "Dot collapsible color",
        description: "Dots with details",
        image: CollapsibleDot,
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
        id: "dot-collapsible-shadow-color",
        name: "Dot collapsible hover color",
        description: "Only visible when collapsible option is on",
        image: CollapsibleDot,
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
        id: "line-color",
        name: "Line color",
        description: "",
        image: Line,
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
        id: "dotChildren-background-color",
        name: "Dot details background color",
        description: "",
        image: DotDescription,
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
        id: "dot-collapsible",
        name: "Dot collapsible",
        description: "Dots with details can be collapsed",
        image: CollapsingDot,
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
    // Set CSS Dimensions
    Object.keys(this.timelineCSSDimensions).forEach(
      (timelinePiece: keyof TimelinePiece) => {
        const cssDimensionProperties = this.timelineCSSDimensions[timelinePiece] as CSSDimensionProperty[];
        cssDimensionProperties.forEach(
          (cssDimensionProperty: CSSDimensionProperty) => {
            this.setCSSSetting(document, timelinePiece as string, cssDimensionProperty.property, cssDimensionProperty.value);
          }
        )
      }
    )

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
      //Override CSS Properties for Dimensions
      Object.keys(this.timelineCSSDimensions).forEach(
        (timelinePieceKey: string) => {
          if (savedConfiguration.timelineCSSDimensions[timelinePieceKey]) {
            this.timelineCSSDimensions[timelinePieceKey].forEach(
              (cssDimensionProperty: CSSDimensionProperty & ConfigurationDetails, index: number) => {
                const savedPropertyIndex = savedConfiguration.timelineCSSDimensions[timelinePieceKey].findIndex((value: CSSDimensionProperty & ConfigurationDetails) => { return value.id === cssDimensionProperty.id; });
                if (savedPropertyIndex > -1) {
                  (this.timelineCSSDimensions[timelinePieceKey][index] as CSSDimensionProperty & ConfigurationDetails).property = (savedConfiguration.timelineCSSDimensions[timelinePieceKey][savedPropertyIndex] as CSSDimensionProperty & ConfigurationDetails).property ?? (this.timelineCSSDimensions[timelinePieceKey][index] as CSSDimensionProperty & ConfigurationDetails).property;
                  (this.timelineCSSDimensions[timelinePieceKey][index] as CSSDimensionProperty & ConfigurationDetails).value = (savedConfiguration.timelineCSSDimensions[timelinePieceKey][savedPropertyIndex] as CSSDimensionProperty & ConfigurationDetails).value ?? (this.timelineCSSDimensions[timelinePieceKey][index] as CSSDimensionProperty & ConfigurationDetails).value;
                }
              }
            );
          }
        }
      );

      //Override CSS Properties for Themes
      Object.keys(this.timelineThemesCSSColors).forEach(
        (timelinePieceKey: string) => {
          if (savedConfiguration.timelineThemesCSSColors[timelinePieceKey]) {
            this.timelineThemesCSSColors[timelinePieceKey].forEach(
              (cssColorProperty: ThemesCSSColorProperty & ConfigurationDetails, index: number) => {
                const savedPropertyIndex = savedConfiguration.timelineThemesCSSColors[timelinePieceKey].findIndex((value: ThemesCSSColorProperty & ConfigurationDetails) => { return value.id === cssColorProperty.id; });
                if (savedPropertyIndex > -1) {
                  (this.timelineThemesCSSColors[timelinePieceKey][index] as ThemesCSSColorProperty & ConfigurationDetails)[Theme.dark].value = (savedConfiguration.timelineThemesCSSColors[timelinePieceKey][savedPropertyIndex] as ThemesCSSColorProperty & ConfigurationDetails)[Theme.dark].value ?? (this.timelineThemesCSSColors[timelinePieceKey][index] as ThemesCSSColorProperty & ConfigurationDetails)[Theme.dark].value;
                  (this.timelineThemesCSSColors[timelinePieceKey][index] as ThemesCSSColorProperty & ConfigurationDetails)[Theme.light].value = (savedConfiguration.timelineThemesCSSColors[timelinePieceKey][savedPropertyIndex] as ThemesCSSColorProperty & ConfigurationDetails)[Theme.light].value ?? (this.timelineThemesCSSColors[timelinePieceKey][index] as ThemesCSSColorProperty & ConfigurationDetails)[Theme.light].value;
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
                const savedPropertyIndex = savedConfiguration.timelineCSSToggles[timelinePieceKey].findIndex((value: CSSToggleProperties & ConfigurationDetails) => { return value.id === cssToggleProperty.id; });
                if (savedPropertyIndex > -1) {
                  (this.timelineCSSToggles[timelinePieceKey][index] as CSSToggleProperties & ConfigurationDetails).enabled = (savedConfiguration.timelineCSSToggles[timelinePieceKey][savedPropertyIndex] as CSSToggleProperties & ConfigurationDetails).enabled ?? (this.timelineCSSToggles[timelinePieceKey][index] as CSSToggleProperties & ConfigurationDetails).enabled;
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
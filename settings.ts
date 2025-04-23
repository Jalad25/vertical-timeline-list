import { App, PluginSettingTab, Setting } from 'obsidian';
import VerticalTimelineListPlugin from 'main';

//#region Constants

enum SettingsSection {
  cssColors,
  cssToggles
}

enum SettingObjectType {
  section,
  input
}

enum SettingInputType {
  color,
  boolean
}

enum ColorSpace {
  RGB,
  RGBA,
  Hex,
  HSL,
  HSLA
}

//#endregion

//#region Objects

interface CSSProperty {
  property: string;
  value: string;
}

interface SettingDisplay {
  display: string;
  description: string | null;
}

interface BaseSetting extends SettingDisplay {
  type: SettingObjectType; 
}

//#endregion

//#region Classes

class ColorCSSSetting implements BaseSetting {
  display: string;
  description: string | null;
  type: SettingObjectType;
  inputType: SettingInputType;
  cssProperties: CSSProperty[];
  colorSpace: ColorSpace;

  constructor(display: string, description: string | null, cssProperties: CSSProperty[], colorSpace: ColorSpace) {
    this.type = SettingObjectType.input;
    this.inputType = SettingInputType.color;
    this.display = display;
    this.description = description;
    this.cssProperties = cssProperties;
    this.colorSpace = colorSpace;
  }
}

class BooleanCSSSetting implements BaseSetting {
  display: string;
  description: string | null;
  type: SettingObjectType;
  inputType: SettingInputType;
  value: boolean;
  trueCSS: CSSProperty[];
  falseCSS: CSSProperty[];

  constructor(display: string, description: string | null, value: boolean, trueCSS: CSSProperty[], falseCSS: CSSProperty[]) {
    this.type = SettingObjectType.input;
    this.inputType = SettingInputType.boolean;
    this.display = display;
    this.description = description;
    this.value = value;
    this.trueCSS = trueCSS;
    this.falseCSS = falseCSS;
  }
}

class SectionSetting implements BaseSetting {
  display: string;
  description: string | null;
  type: SettingObjectType;
  colorCSSSettings: ColorCSSSetting[];
  booleanCSSSettings: BooleanCSSSetting[];

  constructor(display: string, description: string | null, colorCSSSettings: ColorCSSSetting[], booleanCSSSettings: BooleanCSSSetting[]) {
    this.type = SettingObjectType.section;
    this.display = display;
    this.description = description;
    this.colorCSSSettings = colorCSSSettings;
    this.booleanCSSSettings = booleanCSSSettings;
  }
}

//#endregion

export class VerticalTimelineListPluginSettings {
  dot: SectionSetting;
  line: SectionSetting;
  dotChildren: SectionSetting;

  constructor() {
    this.dot = new SectionSetting("Date dot", null, [
      new ColorCSSSetting("Color", "Dates without descriptions", [
        {
          property: "color-light",
          value: "#888888"
        },
        {
          property: "color-dark",
          value: "#888888"
        }
      ], ColorSpace.Hex),
      new ColorCSSSetting("Collapsible color", "Dates with descriptions", [
        {
          property: "collapsible-color-light",
          value: "#8A5CF5"
        },
        {
          property: "collapsible-color-dark",
          value: "#8A5CF5"
        }
      ], ColorSpace.Hex),
      new ColorCSSSetting("Collapsible hover color", "Only visible when collapsible option is on", [
        {
          property: "collapsible-shadow-color-light",
          value: "#8a5cf5"
        },
        {
          property: "collapsible-shadow-color-dark",
          value: "#8a5cf5"
        }
      ], ColorSpace.HSLA),
    ], [
      new BooleanCSSSetting("Collapsible", "Dates with descriptions can be collapsed", false, [
        {
          property: "collapsible-display",
          value: "inline-flex"
        },
        {
          property: "collapsible-cursor",
          value: "pointer"
        }
      ], [
        {
          property: "collapsible-display",
          value: "none"
        },
        {
          property: "collapsible-cursor",
          value: "none"
        }
      ])
    ]);
    this.line = new SectionSetting("Time line", null, [
      new ColorCSSSetting("Color", null, [
        {
          property: "color-light",
          value: "#000000"
        },
        {
          property: "color-dark",
          value: "#ffffff"
        }
      ], ColorSpace.Hex)
    ], []);
    this.dotChildren = new SectionSetting("Date description", null, [
      new ColorCSSSetting("Background color", null, [
        {
          property: "background-color-light",
          value: "#8f8f8f67"
        },
        {
          property: "background-color-dark",
          value: "#00000067"
        }
      ], ColorSpace.Hex)
    ], []);
  }

  loadSettings() : void {
    // Set CSS
    Object.keys(this as VerticalTimelineListPluginSettings).forEach(
      (settingKey: keyof VerticalTimelineListPluginSettings) => {
        const setting = this[settingKey] as BaseSetting;
        switch (setting.type) {
          case SettingObjectType.section:
            const setting = this[settingKey] as SectionSetting;
            setColorCSSSetting(document, settingKey, setting.colorCSSSettings);
            setBooleanCSSSetting(document, settingKey, setting.booleanCSSSettings);
            break;
          default:
            break;
        }
      }
    );
  }
}

export class VerticalTimelineListPluginSettingsTab extends PluginSettingTab {
  plugin: VerticalTimelineListPlugin;

  constructor(app: App, plugin: VerticalTimelineListPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const {containerEl} = this;

    containerEl.empty();

    // CSS Colors
    this.buildSettings(containerEl, SettingsSection.cssColors);

    // CSS Toggles 
    this.buildSettings(containerEl, SettingsSection.cssToggles);
  }

  private addColorsTableHeader(containerEl: HTMLElement) {
    const colorTableHeader: HTMLDivElement = containerEl.createDiv({ cls: "setting-color-table-header" });
    colorTableHeader.createDiv({ text: "Theme" });
    const colorTableHeaderTwo: HTMLDivElement = colorTableHeader.createDiv({ cls: "setting-color-table-header-theme-columns" });
    colorTableHeaderTwo.createDiv({ text: "Dark", cls: "setting-color-table-header-dark-theme-column" });
    colorTableHeaderTwo.createDiv({ text: "Light", cls: "setting-color-table-header-light-theme-column" });
  }

  private addSettingSection(containerEl: HTMLElement, text: string) {
    return containerEl.createDiv({ text: text, cls: "setting-section" });
  }

  private addSettingSectionHeader(containerEl: HTMLElement, name: string, description: string | null) {
    new Setting(containerEl)
      .setName(name)
      .setDesc(description ?? "")
      .setClass("setting-section-header")
      .setHeading();
  }

  private addSettingSectionChild(containerEl: HTMLElement, name: string, description: string | null) {
    return new Setting(containerEl)
              .setName(name)
              .setDesc(description ?? "")
              .setClass("setting-section-child")
  }

  private buildSettings(containerEl: HTMLElement, settingsSection: SettingsSection) {
    switch (settingsSection) {
      case SettingsSection.cssColors:
        this.addSettingSection(containerEl, "Colors");
        this.addColorsTableHeader(containerEl);
        Object.keys(this.plugin.settings).forEach(
          (settingKey: keyof VerticalTimelineListPluginSettings) => {
            let setting = this.plugin.settings[settingKey] as SectionSetting;
            switch (setting.type) {
              case SettingObjectType.section:
                setting = this.plugin.settings[settingKey] as SectionSetting;
                if (setting.colorCSSSettings.length > 0) {
                  this.addSettingSectionHeader(containerEl, setting.display, setting.description);
    
                  setting.colorCSSSettings.forEach(
                    (colorSetting: ColorCSSSetting, index: number) => {
                      const s = this.addSettingSectionChild(containerEl, colorSetting.display, colorSetting.description);
    
                      colorSetting.cssProperties.forEach(
                        (cssProperty: CSSProperty, cssPropertyIndex: number) => {
                          s.addColorPicker(cp => cp
                            .setValue(cssProperty.value)
                            .onChange(async (value) => {
                              ((this.plugin.settings[settingKey] as SectionSetting).colorCSSSettings[index] as ColorCSSSetting).cssProperties[cssPropertyIndex].value = value;
                              await this.plugin.saveSettings();
                              this.plugin.settings.loadSettings();
                            })
                          )
                        }
                      )
    
                      s.controlEl.addClass("color-picker-group");
                    }
                  )
                }
                break;
              default:
                break;
            }
          }
        )
        break;
      case SettingsSection.cssToggles:
        this.addSettingSection(containerEl, "Behavior");
        Object.keys(this.plugin.settings).forEach(
          (settingKey: keyof VerticalTimelineListPluginSettings) => {
            let setting = this.plugin.settings[settingKey] as SectionSetting;
            switch (setting.type) {
              case SettingObjectType.section:
                setting = this.plugin.settings[settingKey] as SectionSetting;
                if (setting.booleanCSSSettings.length > 0) {
                  this.addSettingSectionHeader(containerEl, setting.display, setting.description);
    
                  setting.booleanCSSSettings.forEach (
                    (booleanSetting: BooleanCSSSetting, index: number) => {
                      const s = this.addSettingSectionChild(containerEl, booleanSetting.display, booleanSetting.description);
                      s.addToggle(t => t
                        .setValue(booleanSetting.value)
                        .onChange(async (value) => {
                          ((this.plugin.settings[settingKey] as SectionSetting).booleanCSSSettings[index] as BooleanCSSSetting).value = value;
                          await this.plugin.saveSettings();
                          this.plugin.settings.loadSettings();
                        })
                      );
                    }
                  )
                }
                break;
              default:
                break;
            }
          }
        )
        break;
    }
  }
}

//#region Utilities

function buildCSSProperty (piece: string, cssProperty: string) : string {
  return (["--timeline", piece, cssProperty]).filter(c => { return c !== null; }).join("-");
}

function setCSSProperty (el: HTMLElement, property: string, value: string) {
  el.style.setProperty(property, value);
}

function setColorCSSSetting (document: Document, piece: string, colorSettings: ColorCSSSetting[]) {
  if (colorSettings.length > 0) {
    colorSettings.forEach(
      (colorSetting: ColorCSSSetting) => {
        colorSetting.cssProperties.forEach(
          (cssProperty: CSSProperty) => {
            setCSSProperty(document.body, buildCSSProperty(piece, cssProperty.property), returnColorSpaceValueFromHex(cssProperty.value, colorSetting.colorSpace));
          }
        )
      }
    )
  }
}

function setBooleanCSSSetting (document: Document, piece: string, booleanSettings: BooleanCSSSetting[]) {
  if (booleanSettings.length > 0) {
    booleanSettings.forEach(
      (booleanSetting: BooleanCSSSetting) => {
        if (booleanSetting.value) {
          booleanSetting.trueCSS.forEach(
            (cssProperty: CSSProperty) => {
              setCSSProperty(document.body, buildCSSProperty(piece, cssProperty.property), cssProperty.value);
            }
          )
        } else {
          booleanSetting.falseCSS.forEach(
            (cssProperty: CSSProperty) => {
              setCSSProperty(document.body, buildCSSProperty(piece, cssProperty.property), cssProperty.value);
            }
          )
        }
      }
    )
  }
}

function convertHexToRGB (hex: string, returnString: boolean) {
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

function convertHexToRGBA (hex: string, returnString: boolean, defaultAlpha: number) {
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

function convertHexToHSL (hex: string, returnString: boolean) {
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
  const cmin = Math.min(r,g,b),
        cmax = Math.max(r,g,b),
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

function convertHexToHSLA (hex: string, returnString: boolean, defaultAlpha: number) {
  let a = defaultAlpha;

  const hsl = convertHexToHSL(hex, false) as number[];

  if (hex.length == 5) {
    a = parseFloat((parseInt(("0x" + hex[4] + hex[4])) / 255).toFixed(2));
  } else if (hex.length == 9) {
    a = parseFloat((parseInt(("0x" + hex[7] + hex[8])) / 255).toFixed(2));
  }

  const hsla = hsl;
  hsla.push(a);

  return returnString ? "hsla("+ hsla[0] + "," + hsla[1] + "%," + hsla[2] + "%," + hsla[3] + ")" : hsla;
}

function returnColorSpaceValueFromHex (value: string, colorSpace: ColorSpace) {
  switch (colorSpace) {
    case ColorSpace.RGB:
      return convertHexToRGB(value, true) as string;
    case ColorSpace.RGBA:
      return convertHexToRGBA(value, true, 0.15) as string;
    case ColorSpace.Hex:
      return value as string;
    case ColorSpace.HSL:
      return convertHexToHSL(value, true) as string;
    case ColorSpace.HSLA:
      return convertHexToHSLA(value, true, 0.15) as string;
  }
}

//#endregion
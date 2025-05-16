import { App, PluginSettingTab, Setting, setIcon } from 'obsidian';
import VerticalTimelineListPlugin from 'src/main';
import { Theme, ColorSpace } from 'src/constants'
import { ThemesCSSColorProperty, CSSColorProperty, CSSToggleProperties } from "src/configuration"

//#region Constants

enum SettingInputType {
  color,
  boolean
}

//#endregion

//#region Settings

interface SettingDisplay {
  name: string | undefined;
  description: string | undefined;
  tooltipImagePath: string | undefined; 
}

//#region Setting Inputs

abstract class SettingInput implements SettingDisplay {
  name: string | undefined;
  description: string | undefined;
  tooltipImagePath: string | undefined; 
  inputType: SettingInputType;
  disabled: boolean;
  hidden: boolean;

  constructor(inputType: SettingInputType, disabled: boolean, hidden: boolean, tooltipImagePath?: string, name?: string, description?: string) {
    this.name = name;
    this.description = description;
    this.tooltipImagePath = tooltipImagePath;
    this.inputType = inputType;
    this.disabled = disabled;
    this.hidden = hidden;
  }
}

class ColorInput extends SettingInput {
  colorSpace: ColorSpace;
  value: string;
  onChange: (plugin: VerticalTimelineListPlugin, value: string) => void;

  constructor(disabled: boolean, hidden: boolean, colorSpace: ColorSpace, value?: string, onChange?: (plugin: VerticalTimelineListPlugin, value: string) => void, tooltipImagePath?: string, name?: string, description?: string) {
    super(SettingInputType.color, disabled, hidden, tooltipImagePath, name, description);

    this.colorSpace = colorSpace;
    this.value = value ?? "";
    this.onChange = onChange ?? (async (plugin: VerticalTimelineListPlugin, value: string) => { return; });
  }
}

class BooleanInput extends SettingInput {
  value: boolean;
  onChange: (plugin: VerticalTimelineListPlugin, value: boolean) => void;
  
  constructor(disabled: boolean, hidden: boolean, value?: boolean, onChange?: (plugin: VerticalTimelineListPlugin, value: boolean) => void, tooltipImagePath?: string, name?: string, description?: string) {
    super(SettingInputType.boolean, disabled, hidden, tooltipImagePath, name, description);

    this.value = value ?? false;
    this.onChange = onChange ?? (async (plugin: VerticalTimelineListPlugin, value: boolean) => { return; });
  }
}

//#endregion

//#endregion

//#region Plugin Settings

class ThemesCSSColorSetting implements SettingDisplay {
  name: string;
  description: string;
  tooltipImagePath: string | undefined;
  dark: ColorInput;
  light: ColorInput;

  constructor(plugin: VerticalTimelineListPlugin, key: string, index: number, disabled: boolean, hidden: boolean, tooltipImagePath?: string, name?: string, description?: string) {
    this.name = name ?? "";
    this.description = description ?? "";
    this.tooltipImagePath = tooltipImagePath;
    this.dark = new ColorInput(disabled, hidden, (((plugin.configuration.timelineThemesCSSColors[key] as ThemesCSSColorProperty[])[index] as ThemesCSSColorProperty)[Theme.dark] as CSSColorProperty).colorSpace, (((plugin.configuration.timelineThemesCSSColors[key] as ThemesCSSColorProperty[])[index] as ThemesCSSColorProperty)[Theme.dark] as CSSColorProperty).value, async (plugin: VerticalTimelineListPlugin, value: string) => {
      (((plugin.configuration.timelineThemesCSSColors[key] as ThemesCSSColorProperty[])[index] as ThemesCSSColorProperty)[Theme.dark] as CSSColorProperty).value = value;
      this.dark.value = value;
      await plugin.saveSettings();
      await plugin.configuration.loadConfiguration();
    });
    this.light = new ColorInput(disabled, hidden, (((plugin.configuration.timelineThemesCSSColors[key] as ThemesCSSColorProperty[])[index] as ThemesCSSColorProperty)[Theme.light] as CSSColorProperty).colorSpace, (((plugin.configuration.timelineThemesCSSColors[key] as ThemesCSSColorProperty[])[index] as ThemesCSSColorProperty)[Theme.light] as CSSColorProperty).value, async (plugin: VerticalTimelineListPlugin, value: string) => {
      (((plugin.configuration.timelineThemesCSSColors[key] as ThemesCSSColorProperty[])[index] as ThemesCSSColorProperty)[Theme.light] as CSSColorProperty).value = value;
      this.light.value = value;
      await plugin.saveSettings();
      await plugin.configuration.loadConfiguration();
    });
  }
}

class ToggleCSSSetting {
  toggle: BooleanInput;

  constructor(plugin: VerticalTimelineListPlugin, key: string, index: number, disabled: boolean, hidden: boolean, tooltipImagePath?: string, name?: string, description?: string) {
    this.toggle = new BooleanInput(disabled, hidden, ((plugin.configuration.timelineCSSToggles[key] as CSSToggleProperties[])[index] as CSSToggleProperties).enabled, async (plugin: VerticalTimelineListPlugin, value: boolean) => {
      ((plugin.configuration.timelineCSSToggles[key] as CSSToggleProperties[])[index] as CSSToggleProperties).enabled = value;
      this.toggle.value = value;
      await plugin.saveSettings();
      await plugin.configuration.loadConfiguration();
    }, tooltipImagePath, name, description);
  }
}

interface TimelinePieceSetting {
  [key: string]: ThemesCSSColorSetting[] | ToggleCSSSetting[];
}

export class VerticalTimelineListPluginSettings {
  "timelineThemesCSSColors": TimelinePieceSetting = {};
  "timelineCSSToggles": TimelinePieceSetting = {};

  constructor(plugin: VerticalTimelineListPlugin) {
    Object.keys(this).forEach(
      (property: string) => {
        switch (property) {
          case "timelineThemesCSSColors": //Set CSS Settings for Themes
            Object.keys(plugin.configuration[property]).forEach(
              (timelinePiece: string) => {
                const configurations = plugin.configuration[property][timelinePiece];
                this[property][timelinePiece] = [] as ThemesCSSColorSetting[];
                configurations.forEach(
                  (configuration, index: number) => {
                    (this[property][timelinePiece] as ThemesCSSColorSetting[]).push(new ThemesCSSColorSetting(plugin, timelinePiece, index, false, false, configuration.image, configuration.name, configuration.description));
                  }
                )
              }
            )
            break;
          case "timelineCSSToggles": //Set CSS Settings for Toggles
            Object.keys(plugin.configuration[property]).forEach(
              (timelinePiece: string) => {
                const configurations = plugin.configuration[property][timelinePiece];
                this[property][timelinePiece] = [] as ToggleCSSSetting[];
                configurations.forEach(
                  (configuration, index: number) => {
                    (this[property][timelinePiece] as ToggleCSSSetting[]).push(new ToggleCSSSetting(plugin, timelinePiece, index, false, false, configuration.image, configuration.name, configuration.description));
                  }
                )
              }
            )
            break;
        }
      }
    )
  }
}

export class VerticalTimelineListPluginSettingsTab extends PluginSettingTab {
  plugin: VerticalTimelineListPlugin;
  settings: VerticalTimelineListPluginSettings;

  constructor(app: App, plugin: VerticalTimelineListPlugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.settings = new VerticalTimelineListPluginSettings(plugin);
  }

  display(): void {
    const {containerEl} = this;

    containerEl.empty();

    // CSS Colors
    let section = this.addSettingSection(containerEl, "Theme colors");
    this.addThemeColorTable(section, Object.values(this.settings.timelineThemesCSSColors).flat() as ThemesCSSColorSetting[]);

    // CSS Toggles 
    section = this.addSettingSection(containerEl, "Behavior");
    Object.keys(this.settings.timelineCSSToggles).forEach(
      (settingKey: keyof TimelinePieceSetting) => {
        const toggleCSSSettings = this.settings.timelineCSSToggles[settingKey] as ToggleCSSSetting[];
        toggleCSSSettings.forEach(
          (setting: ToggleCSSSetting) => {
            this.addInput(section, setting.toggle);
          }
        )
      }
    )
  }

  private addSettingSection(containerEl: HTMLElement, sectionHeader: string, sectionDescription?: string) : HTMLElement {
    const container = containerEl.createDiv({ cls: `${this.plugin.PLUGIN_PREFIX}-setting-section` });
    const header = this.addSettingDisplay(container, undefined, sectionHeader, sectionDescription);
    header.setClass("timeline-setting-section-header").setHeading();
    return container;
  }

  private addThemeColorTable(containerEl: HTMLElement, rows: ThemesCSSColorSetting[], name?: string, description?: string) {
    const columns = ["", "Light", "Dark"];
    const table = containerEl.createEl("table", { cls: `${this.plugin.PLUGIN_PREFIX}-setting-table` });

    if (name) {
      const tableNameContainer = table.createEl("thead", { cls: `${this.plugin.PLUGIN_PREFIX}-header` });
      const tableNameRow = tableNameContainer.createEl("tr");
      tableNameRow.createEl("th", { text: name, attr: { colspan: columns.length } });
    }

    if (description) {
      table.createEl("caption", { text: description });
    }

    // Columns
    const thead = table.createEl("thead");
    let tr = thead.createEl("tr");
    columns.forEach((column: string) => {
      tr.createEl("th", { text: column })
    });

    // Rows
    const tbody = table.createEl("tbody");
    rows.forEach((row: ThemesCSSColorSetting) => {
      tr = tbody.createEl("tr");
      let td = tr.createEl("td");
      this.addSettingDisplay(td, row.tooltipImagePath, row.name, row.description);
      td = tr.createEl("td");
      this.addInput(td, row.light);
      td = tr.createEl("td");
      this.addInput(td, row.dark);
    });
  }

  private addInput(containerEl: HTMLElement, input: SettingInput) : Setting {
    const inputSetting = this.addSettingDisplay(containerEl, input.tooltipImagePath, input.name, input.description);

    if (input.hidden) {
      inputSetting.setClass("hidden");
    }

    switch (input.inputType) {
      case SettingInputType.color:
        const colorInput = input as ColorInput;
        inputSetting.addColorPicker(cp => cp
          .setDisabled(colorInput.disabled)
          .setValue(colorInput.value)
          .onChange((value: string) => {
            colorInput.onChange(this.plugin, value);
          })
        );
        break;
      case SettingInputType.boolean:
        const booleanInput = input as BooleanInput;
        inputSetting.addToggle(t => t
          .setValue(booleanInput.value)
          .setDisabled(booleanInput.disabled)
          .onChange((value: boolean) => {
            booleanInput.onChange(this.plugin, value);
          })
        );
        break;
    }

    return inputSetting;
  }

  private addSettingDisplay(containerEl: HTMLElement, tooltipImagePath?: string, name?: string, description?: string) : Setting {
    const el =  new Setting(containerEl)
                    .setClass(`${this.plugin.PLUGIN_PREFIX}-setting-input`)
                    .setName(name ?? "")
                    .setDesc(description ?? "");
    if (tooltipImagePath) {
      const tooltip = (el.infoEl.firstChild as HTMLElement).createDiv({ cls: `${this.plugin.PLUGIN_PREFIX}-setting-tooltip` });
      const tooltipIcon = tooltip.createDiv({ cls: `${this.plugin.PLUGIN_PREFIX}-setting-tooltip-icon` });
      setIcon(tooltipIcon, "info");
      tooltip.createEl("img", { cls: `${this.plugin.PLUGIN_PREFIX}-setting-tooltip-image`, attr: { src: tooltipImagePath } });
    }
    return el;
  }
}

//#endregion
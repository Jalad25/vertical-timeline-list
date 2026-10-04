import {
  App,
	Notice,
  PluginSettingTab,
  Setting,
	requireApiVersion
} from "obsidian";
import { VerticalTimelineListCssSettings, ColorThemePair, DATA_JSON_SCHEMA_VERSION } from "./configuration";
import VerticalTimelineListPlugin from "./main";
import { applyCssVariables } from "./CssApplier";

//#region Types

type NumberKey  = { [K in keyof VerticalTimelineListCssSettings]: VerticalTimelineListCssSettings[K] extends number ? K : never }[keyof VerticalTimelineListCssSettings];
type BooleanKey = { [K in keyof VerticalTimelineListCssSettings]: VerticalTimelineListCssSettings[K] extends boolean ? K : never }[keyof VerticalTimelineListCssSettings];
type ColorKey   = { [K in keyof VerticalTimelineListCssSettings]: VerticalTimelineListCssSettings[K] extends ColorThemePair ? K : never }[keyof VerticalTimelineListCssSettings];

//#endregion

//#region Settings Tab

export class VerticalTimelineListSettingTab extends PluginSettingTab {
  plugin: VerticalTimelineListPlugin;

  constructor(app: App, plugin: VerticalTimelineListPlugin) {
    super(app, plugin);
    this.plugin = plugin;

    // Icon for menu
    this.icon = "timeline";
  }

  refresh(): void {
    if (requireApiVersion("1.13.0")) this.update(); // Declarative settings
    else if (this.containerEl.isShown()) this.display(); // Legacy settings
  }

	//#region Legacy Settings

  //#region Obsidian Binding Hooks

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // Obsidian version < 1.13.0 styling
    this.containerEl.addClass("vertical-timeline-list-legacy-settings-tab");

    // Plugin and data schema version row
    const pluginVersion = `Version ${this.plugin.manifest.version}`;
    const dataJsonSchemaVersion = `Data schema version: ${DATA_JSON_SCHEMA_VERSION}`;
    new Setting(containerEl)
      .setName(pluginVersion)
      .then((s: Setting) => {
        s.descEl.createSpan({ text: dataJsonSchemaVersion });
        s.descEl.createEl("br");
        s.descEl.createEl("a", { text: "Visit GitHub repository", href: "https://github.com/Jalad25/vertical-timeline-list" });
      })
      .addButton((b) => {
        b.setCta()
         .setButtonText("Copy details for bug report")
          .onClick(async () => {
            const data = await this.plugin.loadData();
            const report = `${pluginVersion}\n${dataJsonSchemaVersion}\n\ndata.json:\n${JSON.stringify(data, null, 2)}`;
            await navigator.clipboard.writeText(report);
            new Notice("Copied bug report details");
          });
      });

    // Dimensions
    new Setting(containerEl)
      .setClass(`${this.plugin.manifest.id}-setting-section-header`)
      .setName("Spacing")
      .setDesc("All units in px")
      .setHeading();

    this.dimensionSetting(containerEl, "Dot separation", "Gap between dots on line", "dotSeparation");
    this.dimensionSetting(containerEl, "Line padding", "Line left and right padding", "linePadding");
    this.dimensionSetting(containerEl, "Dot details padding", "Details top, bottom, left, and right padding", "dotChildrenPadding");
    this.dimensionSetting(containerEl, "Dot details top separation", "", "dotChildrenTopMargin");
    this.dimensionSetting(containerEl, "Dot details bottom separation", "", "dotChildrenBottomMargin");

    // Theme
    new Setting(containerEl)
      .setClass(`${this.plugin.manifest.id}-setting-section-header`)
      .setName("Theme colors")
      .setHeading();

    this.renderColorTable(containerEl, [
      { key: "dotColor", name: "Dot color", desc: "Dots without details" },
      { key: "dotCollapsibleColor", name: "Dot collapsible color", desc: "Dots with details" },
      { key: "dotCollapsibleShadowColor", name: "Dot collapsible hover color", desc: "Only visible when collapsible option is on" },
      { key: "lineColor", name: "Line color", desc: "" },
      { key: "dotChildrenBackgroundColor", name: "Dot details background color", desc: "" },
    ]);

    // Behavior
    new Setting(containerEl)
      .setClass(`${this.plugin.manifest.id}-setting-section-header`)
      .setName("Behavior")
      .setHeading();

    this.toggleSetting(containerEl, "Dot collapsible", "Dots with details can be collapsed", "dotCollapsible");
  }

	//#endregion

  private dimensionSetting(el: HTMLElement, name: string, desc: string, key: NumberKey): void {
    new Setting(el)
      .setName(name)
      .setDesc(desc)
      .addText((t) =>
        t.setValue(String(this.plugin.configuration[key]))
          .onChange(async (value) => {
            const n = parseInt(value, 10);
            if (Number.isNaN(n)) return;
            this.plugin.configuration[key] = n;
            await this.plugin.saveConfiguration();
            applyCssVariables(this.plugin.manifest.id, this.plugin.configuration);
          })
      );
  }

  private toggleSetting(el: HTMLElement, name: string, desc: string, key: BooleanKey): void {
    new Setting(el)
      .setName(name)
      .setDesc(desc)
      .addToggle((t) =>
        t.setValue(this.plugin.configuration[key])
          .onChange(async (value) => {
            this.plugin.configuration[key] = value;
            await this.plugin.saveConfiguration();
            applyCssVariables(this.plugin.manifest.id, this.plugin.configuration);
          })
      );
  }

  private renderColorTable(
    containerEl: HTMLElement,
    rows: { key: ColorKey; name: string; desc: string }[],
  ): void {
    const table = containerEl.createEl("table", {
      cls: `${this.plugin.manifest.id}-setting-table`,
    });

    const thead = table.createEl("thead");
    const headRow = thead.createEl("tr");
    headRow.createEl("th", { text: "" });
    headRow.createEl("th", { text: "Light", cls: `${this.plugin.manifest.id}-setting-table-swatch` });
    headRow.createEl("th", { text: "Dark", cls: `${this.plugin.manifest.id}-setting-table-swatch` });

    const tbody = table.createEl("tbody");
    for (const row of rows) {
      const tr = tbody.createEl("tr");

      const labelCell = tr.createEl("td", { cls: `${this.plugin.manifest.id}-setting-table-label` });
      labelCell.createDiv({ text: row.name, cls: `${this.plugin.manifest.id}-setting-table-name` });
      if (row.desc) {
        labelCell.createDiv({ text: row.desc, cls: `${this.plugin.manifest.id}-setting-table-desc` });
      }

      this.renderColorCell(tr.createEl("td", { cls: `${this.plugin.manifest.id}-setting-table-swatch` }), row.key, "light");
      this.renderColorCell(tr.createEl("td", { cls: `${this.plugin.manifest.id}-setting-table-swatch` }), row.key, "dark");
    }
  }

  private renderColorCell(td: HTMLElement, key: ColorKey, theme: "light" | "dark"): void {
    const input = td.createEl("input", { type: "color" });
    input.value = this.plugin.configuration[key][theme];
    input.addEventListener("input", () => {
      this.plugin.configuration[key][theme] = input.value;
      void this.plugin.saveConfiguration().then(() => {
        applyCssVariables(this.plugin.manifest.id, this.plugin.configuration);
      });
    });
  }

	//#endregion
}

//#endregion

import {
  App,
	apiVersion,
	Notice,
  PluginSettingTab,
  Setting,
	requireApiVersion,
	SettingDefinitionItem
} from "obsidian";
import { VerticalTimelineListCssSettings, ColorThemePair, Theme, DATA_JSON_SCHEMA_VERSION } from "./configuration";
import VerticalTimelineListPlugin from "./main";
import { applyCssVariables } from "./CssApplier";

//#region Types

type NumberKey  = { [K in keyof VerticalTimelineListCssSettings]: VerticalTimelineListCssSettings[K] extends number ? K : never }[keyof VerticalTimelineListCssSettings];
type BooleanKey = { [K in keyof VerticalTimelineListCssSettings]: VerticalTimelineListCssSettings[K] extends boolean ? K : never }[keyof VerticalTimelineListCssSettings];
type ColorKey   = { [K in keyof VerticalTimelineListCssSettings]: VerticalTimelineListCssSettings[K] extends ColorThemePair ? K : never }[keyof VerticalTimelineListCssSettings];

interface BugReport {
	pluginVersion: string;
	obsidianVersion: string;
	colorScheme: Theme;
	dataSchemaVersion: number;
	activeTheme: string;
	installedThemes: string[];
	enabledPlugins: string[];
	data: unknown;
}

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

	//#region Shared Obsidian Binding Hooks

  // Override getting value of control for key
  getControlValue(key: string): unknown {
    const [id, theme] = this.decodeKey(key);
    const value = this.plugin.configuration[id];
    if (theme) return (value as ColorThemePair)[theme];
    return value;
  }

	// Override persistance of control value for key
  async setControlValue(key: string, value: unknown): Promise<void> {
    const [id, theme] = this.decodeKey(key);
    if (theme) {
      (this.plugin.configuration[id] as ColorThemePair)[theme] = value as string;
    } else {
      (this.plugin.configuration[id] as unknown) = value;
    }
    await this.plugin.saveConfiguration();
    applyCssVariables(this.app, this.plugin.manifest.id, this.plugin.configuration);
  }

  //#endregion

	//#region Legacy Settings

  //#region Obsidian Binding Hooks

	// Legacy settings
  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // Obsidian version < 1.13.0 styling
    this.containerEl.addClass(`${this.plugin.manifest.id}-legacy-settings-tab`);

    // Plugin and data schema version row w/ bug reporting copy
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
            const report = await this.buildBugReport();
            await navigator.clipboard.writeText(this.formatBugReport(report));
            new Notice("Copied bug report details");
          });
      });

    // Dimensions
    new Setting(containerEl)
      .setName("Spacing")
      .setHeading();

    this.renderDimensionSetting(containerEl, "Dot separation (px)", "Gap between dots on line", "dotSeparation");
    this.renderDimensionSetting(containerEl, "Line padding (px)", "Line left and right padding", "linePadding");
    this.renderDimensionSetting(containerEl, "Dot details padding (px)", "Details top, bottom, left, and right padding", "dotChildrenPadding");
    this.renderDimensionSetting(containerEl, "Dot details top separation (px)", "", "dotChildrenTopMargin");
    this.renderDimensionSetting(containerEl, "Dot details bottom separation (px)", "", "dotChildrenBottomMargin");

    // Theme
    new Setting(containerEl)
      .setName("Theme colors")
      .setHeading();

    this.renderColorTable(containerEl, [
      { key: "dotColor", name: "Dot color", desc: "Dots without details" },
      { key: "dotCollapsibleColor", name: "Dot collapsible color", desc: "Dots with details" },
      { key: "dotCollapsibleShadowColor", name: "Dot collapsible hover color", desc: "Only visible when collapsible option is on" },
      { key: "lineColor", name: "Line color", desc: "" },
      { key: "dotChildrenBackgroundColor", name: "Dot details background color", desc: "" }
    ]);

    // Behavior
    new Setting(containerEl)
      .setName("Behavior")
      .setHeading();

    this.renderToggleSetting(containerEl, "Dot collapsible", "Dots with details can be collapsed", "dotCollapsible");
  }

	//#endregion

	// Render dimension setting
  private renderDimensionSetting(el: HTMLElement, name: string, desc: string, key: NumberKey): void {
    new Setting(el)
      .setName(name)
      .setDesc(desc)
      .addText((t) =>
        t.setValue(String(this.getControlValue(key)))
          .onChange(async (value) => {
            const n = parseInt(value, 10);
            if (Number.isNaN(n)) return;
            await this.setControlValue(key, n);
          })
      );
  }

	// Render toggle setting
  private renderToggleSetting(el: HTMLElement, name: string, desc: string, key: BooleanKey): void {
    new Setting(el)
      .setName(name)
      .setDesc(desc)
      .addToggle((t) =>
        t.setValue(this.getControlValue(key) as boolean)
          .onChange((value) => this.setControlValue(key, value))
      );
  }

	// Render color table w/ color settings
  private renderColorTable(
    containerEl: HTMLElement,
    rows: { key: ColorKey; name: string; desc: string }[],
  ): void {
    const table = containerEl.createEl("table", {
      cls: `${this.plugin.manifest.id}-setting-table`
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

	// Render color setting
  private renderColorCell(td: HTMLElement, key: ColorKey, theme: "light" | "dark"): void {
    const encodedKey = this.encodeColorKey(key, theme); // This is only done so it can work with the get/setControlValue hooks
    const input = td.createEl("input", { type: "color" });
    input.value = this.getControlValue(encodedKey) as string;
    input.addEventListener("input", () => {
      void this.setControlValue(encodedKey, input.value);
    });
  }

	//#endregion

	//#region Declarative Settings

	//#region Obsidian Binding Hooks

  // Declarative settings
	getSettingDefinitions(): SettingDefinitionItem[] {
    const items: SettingDefinitionItem[] = [];

    // Obsidian version >= 1.13.0 styling
    this.containerEl.addClass(`${this.plugin.manifest.id}-declarative-settings-tab`);

    // Plugin and data schema version row w/ bug reporting copy
		const pluginVersion = `Version ${this.plugin.manifest.version}`;
		const dataJsonSchemaVersion = `Data schema version: ${DATA_JSON_SCHEMA_VERSION}`;
		items.push({
			name: " ",
			render: (setting) => {
				setting.setName(pluginVersion)
					.then((s: Setting) => {
						s.descEl.createSpan({ text: dataJsonSchemaVersion });
						s.descEl.createEl("br");
						s.descEl.createEl("a", { text: "Visit GitHub repository", href: "https://github.com/Jalad25/vertical-timeline-list" });
					})
					.addButton((b) => {
						b.setCta()
							.setButtonText("Copy details for bug report")
							.onClick(async () => {
								const report = await this.buildBugReport();
								await navigator.clipboard.writeText(this.formatBugReport(report));
								new Notice("Copied bug report details");
							});
					});
			}
		});

    // Dimensions
    items.push({
      type: "group",
      heading: "Spacing",
      items: [
        { name: "Dot separation (px)", desc: "Gap between dots on line", control: { type: "number", key: "dotSeparation" } },
        { name: "Line padding (px)", desc: "Line left and right padding", control: { type: "number", key: "linePadding" } },
        { name: "Dot details padding (px)", desc: "Details top, bottom, left, and right padding", control: { type: "number", key: "dotChildrenPadding" } },
        { name: "Dot details top separation (px)", control: { type: "number", key: "dotChildrenTopMargin" } },
        { name: "Dot details bottom separation (px)", control: { type: "number", key: "dotChildrenBottomMargin" } }
      ]
    });

    // Theme colors
    items.push({
      type: "group",
      heading: "Theme colors",
      items: [{
        name: " ",
        render: (setting) => {
          setting.settingEl.empty();
          this.renderColorTable(setting.settingEl, [
            { key: "dotColor", name: "Dot color", desc: "Dots without details" },
            { key: "dotCollapsibleColor", name: "Dot collapsible color", desc: "Dots with details" },
            { key: "dotCollapsibleShadowColor", name: "Dot collapsible hover color", desc: "Only visible when collapsible option is on" },
            { key: "lineColor", name: "Line color", desc: "" },
            { key: "dotChildrenBackgroundColor", name: "Dot details background color", desc: "" }
          ]);
        }
      }]
    });

    // Behavior
    items.push({
      type: "group",
      heading: "Behavior",
      items: [
        { name: "Dot collapsible", desc: "Dots with details can be collapsed", control: { type: "toggle", key: "dotCollapsible" } }
      ]
    });

    return items;
  }

  //#endregion

	//#endregion

	//#region Utilities

  private decodeKey(key: string): [keyof VerticalTimelineListCssSettings, Theme | null] {
    const colonIdx = key.indexOf(":");
    if (colonIdx < 0) return [key as keyof VerticalTimelineListCssSettings, null];
    const sub = key.slice(colonIdx + 1);
    if (sub !== "light" && sub !== "dark") return [key as keyof VerticalTimelineListCssSettings, null];
    return [key.slice(0, colonIdx) as keyof VerticalTimelineListCssSettings, sub];
  }

	// Colors are the only ones that need this encoding due to the color settings being saved as an object (with light and dark values)
  private encodeColorKey(key: ColorKey, theme: Theme): string {
    return `${key}:${theme}`;
  }

	// Collect data for a bug report
	private async buildBugReport(): Promise<BugReport> {
		// Tap into a properties not in the Obsidian public API to get list of themes, active theme, and enabled plugins
		const internals = this.app as App & {
			plugins?: { enabledPlugins?: Set<string> };
			customCss?: { theme?: string, themes?: Record<string, unknown> };
		};

		return {
			pluginVersion: this.plugin.manifest.version,
			obsidianVersion: apiVersion,
			colorScheme: activeDocument.querySelector(".theme-light") ? Theme.light : Theme.dark,
			dataSchemaVersion: DATA_JSON_SCHEMA_VERSION,
			activeTheme: internals.customCss?.theme ?? "",
			installedThemes: Object.keys(internals.customCss?.themes ?? {}).sort(),
			enabledPlugins: [...(internals.plugins?.enabledPlugins ?? [])].sort(),
			data: await this.plugin.loadData()
		};
	}

	// Format a bug report as plain text for the clipboard
	private formatBugReport(r: BugReport): string {
		const lines: string[] = [];
		lines.push(`Plugin version: ${r.pluginVersion}`);
		lines.push(`Obsidian version: ${r.obsidianVersion}`);
		lines.push(`Color scheme: ${r.colorScheme}`);
		lines.push(`Data schema version: ${r.dataSchemaVersion}`);
		lines.push("");
		lines.push(`Active theme: ${r.activeTheme || "(default)"}`);
		lines.push("Installed themes:");
		if (r.installedThemes.length === 0) lines.push("  (none)");
		else for (const t of r.installedThemes) lines.push(`  - ${t}`);
		lines.push("");
		lines.push("Enabled plugins:");
		if (r.enabledPlugins.length === 0) lines.push("  (none)");
		else for (const p of r.enabledPlugins) lines.push(`  - ${p}`);
		lines.push("");
		lines.push("data.json:");
		lines.push(JSON.stringify(r.data, null, 2));
		return lines.join("\n");
	}

	//#endregion

}

//#endregion

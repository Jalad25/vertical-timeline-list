import { Plugin } from "obsidian";
import { applyCssVariables } from "./CssApplier";
import { CURRENT_SCHEMA_VERSION, migrate } from "./SchemaMigrations";
import { VerticalTimelineListSettingTab } from "./VerticalTimelineListSettingTab";

//#region Types

export interface ColorPair {
  dark: string;
  light: string;
}

export interface VerticalTimelineListSettings {
  schemaVersion: number;

  // Dimensions
  dotSeparation: number;
  linePadding: number;
  dotChildrenPadding: number;
  dotChildrenTopMargin: number;
  dotChildrenBottomMargin: number;

  // Theme
  dotColor: ColorPair;
  dotCollapsibleColor: ColorPair;
  dotCollapsibleShadowColor: ColorPair;
  lineColor: ColorPair;
  dotChildrenBackgroundColor: ColorPair;

  // Behavior
  dotCollapsible: boolean;
}

//#endregion

//#region Constants

export const DEFAULT_SETTINGS: VerticalTimelineListSettings = {
  schemaVersion: CURRENT_SCHEMA_VERSION,

  dotSeparation: 10,
  linePadding: 12,
  dotChildrenPadding: 10,
  dotChildrenTopMargin: 10,
  dotChildrenBottomMargin: 10,

  dotColor: { dark: "#888888", light: "#888888" },
  dotCollapsibleColor: { dark: "#8A5CF5", light: "#8A5CF5" },
  dotCollapsibleShadowColor: { dark: "#8A5CF5", light: "#8A5CF5" },
  lineColor: { dark: "#ffffff", light: "#000000" },
  dotChildrenBackgroundColor: { dark: "#00000067", light: "#8f8f8f67" },

  dotCollapsible: false,
};

//#endregion

export default class VerticalTimelineListPlugin extends Plugin {
  settings!: VerticalTimelineListSettings;

  async onload() {
    await this.loadSettings();
    applyCssVariables(this.manifest.id, this.settings);

    this.registerEvent(
      this.app.workspace.on("css-change", () => {
        applyCssVariables(this.manifest.id, this.settings);
      })
    );

    this.registerMarkdownPostProcessor((el) => {
			// Find vertical timeline list
      el.querySelectorAll('li[data-task="t"]').forEach((parent) => {
        parent.addClass("vertical-timeline-list");

				// Find vertical timeline bullets that are collapsible
				parent.querySelectorAll(
					":scope > ul.has-list-bullet > li > span.list-collapse-indicator.collapse-indicator.collapse-icon"
				).forEach((indicator) => {
					const bullet = indicator.previousElementSibling;
					if (bullet?.matches("span.list-bullet")) {
						bullet.addClass("vertical-timeline-list-collapsible-bullet");
					}
				});

				// Remove collapse icons within timeline
				parent.querySelectorAll(
						":scope > ul.has-list-bullet span.list-collapse-indicator.collapse-indicator.collapse-icon > svg"
					).forEach((svg) => {
						svg.remove();
					});

				// Remove ability to collapse any children within timeline bullets
				parent.querySelectorAll(":scope > ul.has-list-bullet li ul.has-list-bullet span.list-collapse-indicator.collapse-indicator.collapse-icon").forEach((span) => {
					span.addClass("vertical-timeline-list-collapse-disabled");
        });
      });
    });

    this.addSettingTab(new VerticalTimelineListSettingTab(this.app, this));
  }

  async loadSettings() {
    const raw = await this.loadData();
    const { values, migrated } = migrate(raw);
    this.settings = Object.assign({}, DEFAULT_SETTINGS, values);
    if (migrated) await this.saveSettings();
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

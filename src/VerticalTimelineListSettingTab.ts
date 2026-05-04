import {
  App,
  PluginSettingTab,
  Setting,
  setIcon
} from "obsidian";
import VerticalTimelineListPlugin, { ColorPair, VerticalTimelineListSettings } from "./main";
import { applyCssVariables } from "./CssApplier";

//#region Images

import CollapsibleDot from "../assets/screenshots/CollapsibleDot.png";
import CollapsingDot from "../assets/screenshots/CollapsingDot.gif";
import Dot from "../assets/screenshots/Dot.png";
import DotDescription from "../assets/screenshots/DotDescription.png";
import Line from "../assets/screenshots/Line.png";
import LinePadding from "../assets/screenshots/LinePadding.png";
import DotSeparation from "../assets/screenshots/DotSeparation.png";
import DotDetailPadding from "../assets/screenshots/DotDetailPadding.png";
import DotDetailTopSeparation from "../assets/screenshots/DotDetailTopSeparation.png";
import DotDetailBottomSeparation from "../assets/screenshots/DotDetailBottomSeparation.png";

//#endregion

//#region Types

type NumberKey  = { [K in keyof VerticalTimelineListSettings]: VerticalTimelineListSettings[K] extends number ? K : never }[keyof VerticalTimelineListSettings];
type BooleanKey = { [K in keyof VerticalTimelineListSettings]: VerticalTimelineListSettings[K] extends boolean ? K : never }[keyof VerticalTimelineListSettings];
type ColorKey   = { [K in keyof VerticalTimelineListSettings]: VerticalTimelineListSettings[K] extends ColorPair ? K : never }[keyof VerticalTimelineListSettings];

//#endregion

//#region Settings Tab

export class VerticalTimelineListSettingTab extends PluginSettingTab {
  plugin: VerticalTimelineListPlugin;

  constructor(app: App, plugin: VerticalTimelineListPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createDiv({
      attr: { style: "text-align:right;" },
      text: `Version: ${this.plugin.manifest.version}`,
    });

    // Dimensions
    new Setting(containerEl)
      .setClass(`${this.plugin.manifest.id}-setting-section-header`)
      .setName("Spacing")
      .setDesc("All units in px")
      .setHeading();

    this.dimensionSetting(containerEl, "Dot separation", "Gap between dots on line", DotSeparation, "dotSeparation");
    this.dimensionSetting(containerEl, "Line padding", "Line left and right padding", LinePadding, "linePadding");
    this.dimensionSetting(containerEl, "Dot details padding", "Details top, bottom, left, and right padding", DotDetailPadding, "dotChildrenPadding");
    this.dimensionSetting(containerEl, "Dot details top separation", "", DotDetailTopSeparation, "dotChildrenTopMargin");
    this.dimensionSetting(containerEl, "Dot details bottom separation", "", DotDetailBottomSeparation, "dotChildrenBottomMargin");

    // Theme
    new Setting(containerEl)
      .setClass(`${this.plugin.manifest.id}-setting-section-header`)
      .setName("Theme colors")
      .setHeading();

    this.renderColorTable(containerEl, [
      { key: "dotColor", name: "Dot color", desc: "Dots without details", img: Dot },
      { key: "dotCollapsibleColor", name: "Dot collapsible color", desc: "Dots with details", img: CollapsibleDot },
      { key: "dotCollapsibleShadowColor", name: "Dot collapsible hover color", desc: "Only visible when collapsible option is on", img: CollapsibleDot },
      { key: "lineColor", name: "Line color", desc: "", img: Line },
      { key: "dotChildrenBackgroundColor", name: "Dot details background color", desc: "", img: DotDescription },
    ]);

    // Behavior
    new Setting(containerEl)
      .setClass(`${this.plugin.manifest.id}-setting-section-header`)
      .setName("Behavior")
      .setHeading();

    this.toggleSetting(containerEl, "Dot collapsible", "Dots with details can be collapsed", CollapsingDot, "dotCollapsible");
  }

  private dimensionSetting(el: HTMLElement, name: string, desc: string, img: string, key: NumberKey): void {
    const setting = new Setting(el)
      .setName(name)
      .setDesc(desc)
      .addText((t) =>
        t.setValue(String(this.plugin.settings[key]))
          .onChange(async (value) => {
            const n = parseInt(value, 10);
            if (Number.isNaN(n)) return;
            this.plugin.settings[key] = n;
            await this.plugin.saveSettings();
            applyCssVariables(this.plugin.manifest.id, this.plugin.settings);
          })
      );
    this.addTooltipImage(setting.nameEl, img);
  }

  private toggleSetting(el: HTMLElement, name: string, desc: string, img: string, key: BooleanKey): void {
    const setting = new Setting(el)
      .setName(name)
      .setDesc(desc)
      .addToggle((t) =>
        t.setValue(this.plugin.settings[key])
          .onChange(async (value) => {
            this.plugin.settings[key] = value;
            await this.plugin.saveSettings();
            applyCssVariables(this.plugin.manifest.id, this.plugin.settings);
          })
      );
    this.addTooltipImage(setting.nameEl, img);
  }

  private renderColorTable(
    containerEl: HTMLElement,
    rows: { key: ColorKey; name: string; desc: string; img: string }[],
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
      const nameEl = labelCell.createDiv({ text: row.name, cls: `${this.plugin.manifest.id}-setting-table-name` });
      this.addTooltipImage(nameEl, row.img);
      if (row.desc) {
        labelCell.createDiv({ text: row.desc, cls: `${this.plugin.manifest.id}-setting-table-desc` });
      }

      this.renderColorCell(tr.createEl("td", { cls: `${this.plugin.manifest.id}-setting-table-swatch` }), row.key, "light");
      this.renderColorCell(tr.createEl("td", { cls: `${this.plugin.manifest.id}-setting-table-swatch` }), row.key, "dark");
    }
  }

  private renderColorCell(td: HTMLElement, key: ColorKey, theme: "light" | "dark"): void {
    const input = td.createEl("input", { type: "color" });
    input.value = this.plugin.settings[key][theme];
    input.addEventListener("input", () => {
      this.plugin.settings[key][theme] = input.value;
      void this.plugin.saveSettings().then(() => {
        applyCssVariables(this.plugin.manifest.id, this.plugin.settings);
      });
    });
  }

  private addTooltipImage(anchorEl: HTMLElement, img: string): void {
    if (!img) return;
    const tooltip = anchorEl.createDiv({ cls: `${this.plugin.manifest.id}-setting-tooltip` });
    const icon = tooltip.createDiv({ cls: `${this.plugin.manifest.id}-setting-tooltip-icon` });
    setIcon(icon, "info");
    const image = tooltip.createEl("img", {
      cls: `${this.plugin.manifest.id}-setting-tooltip-image`,
      attr: { src: img },
    });

    const showAt = (e: MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const gap = 8;
      let left = rect.right + gap;
      const imgWidth = image.offsetWidth || 500;
      if (left + imgWidth > window.innerWidth) {
        left = Math.max(0, rect.left - imgWidth - gap);
      }
      image.style.left = `${left}px`;
      image.style.top = `${rect.top}px`;
      tooltip.classList.add("is-visible");
    };
    const hide = () => tooltip.classList.remove("is-visible");

    icon.addEventListener("mouseenter", showAt);
    icon.addEventListener("mouseleave", hide);
  }
}

//#endregion

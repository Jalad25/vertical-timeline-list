import { Plugin } from "obsidian";
import { applyCssVariables } from "./CssApplier";
import { migrate } from "./SchemaMigrations";
import { VerticalTimelineListSettingTab } from "./VerticalTimelineListSettingTab";
import { VerticalTimelineListConfiguration, DEFAULT_CONFIGURATION } from "./configuration";

export default class VerticalTimelineListPlugin extends Plugin {
  configuration!: VerticalTimelineListConfiguration;

  async onload() {
    await this.loadConfiguration();
    applyCssVariables(this.manifest.id, this.configuration);

    this.registerEvent(
      this.app.workspace.on("css-change", () => {
        applyCssVariables(this.manifest.id, this.configuration);
      })
    );

    this.registerMarkdownPostProcessor((el) => {
			// Do initial mutation of timeline elements
      mutateTimelineElements(el);

			// Create observer to trigger on newly added nodes
			// Re-run mutation on added nodes injected by other plugins
			// Fix specifically for Tasks plugin to work properly with this plugin
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((m) => {
          m.addedNodes.forEach((node) => {
            if (!node.instanceOf(HTMLElement)) return;
            if (node.matches('li[data-task="t"]') || node.querySelector('li[data-task="t"]')) {
              mutateTimelineElements(node);
            }
          });
        });
      });
      observer.observe(el, { childList: true, subtree: true });

			// Remove observer once finished
      const detachObserver = new MutationObserver(() => {
        if (!el.isConnected) {
          observer.disconnect();
          detachObserver.disconnect();
        }
      });
      detachObserver.observe(el.ownerDocument.body, { childList: true, subtree: true });
      this.register(() => {
        observer.disconnect();
        detachObserver.disconnect();
      });
    });

    this.addSettingTab(new VerticalTimelineListSettingTab(this.app, this));
  }

	//#region Configuration

  async loadConfiguration() {
    const raw: unknown = await this.loadData();

		// Migrate schema, if needed
    const { values, migrated } = migrate(raw);

    this.configuration = Object.assign({}, DEFAULT_CONFIGURATION, values);
    if (migrated) await this.saveConfiguration();
  }

  async saveConfiguration() {
    await this.saveData(this.configuration);
  }

	//#endregion
}

//#region Utilitis

function mutateTimelineElements(root: ParentNode): void {
  const timelineCandidates: Element[] = Array.from(
    root.querySelectorAll('li[data-task="t"]:not(.vertical-timeline-list)')
  );

	// If root is candidate, add to list
  if (root.instanceOf(Element)
      && root.matches('li[data-task="t"]:not(.vertical-timeline-list)')) timelineCandidates.unshift(root);

	// Add classes to candidates
  timelineCandidates.forEach((parent) => {
		// Add class to vertical timeline list parent
    parent.addClass("vertical-timeline-list");

		// Find vertical timeline bullets that are collapsible
    parent.querySelectorAll(":scope > ul.has-list-bullet > li > span.list-collapse-indicator.collapse-indicator.collapse-icon").forEach((indicator) => {
      const bullet = indicator.previousElementSibling;
      if (bullet?.matches("span.list-bullet")) {
        bullet.addClass("vertical-timeline-list-collapsible-bullet");
      }
    });

		// Remove collapse icons within timeline
    parent.querySelectorAll(":scope > ul.has-list-bullet span.list-collapse-indicator.collapse-indicator.collapse-icon > svg").forEach((svg) => {
      svg.remove();
    });

		// Remove ability to collapse any children within timeline bullets
    parent.querySelectorAll(":scope > ul.has-list-bullet li ul.has-list-bullet span.list-collapse-indicator.collapse-indicator.collapse-icon").forEach((span) => {
      span.addClass("vertical-timeline-list-collapse-disabled");
    });

		// Override dot child (details) CSS style, if indicated
    parent.querySelectorAll(":scope > ul.has-list-bullet li ul.has-list-bullet li").forEach((li) => {
			// Look for first code element
			const styleOverrides = li.querySelector("code");
			if (styleOverrides !== null) {

				if (styleOverrides.textContent !== null) {
					const regex = /^STYLE\[([^\]]{3,})\]$/i;
					const match = styleOverrides.textContent.trim().match(regex);

					if (!match) return;
					li.setAttribute("style", match[1]);
					styleOverrides.remove();
				}
			}
    });
  });
}

//#endregion

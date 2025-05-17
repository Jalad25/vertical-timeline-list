import { Plugin } from 'obsidian';
import { VerticalTimelineListPluginConfiguration } from 'src/configuration'
import { VerticalTimelineListPluginSettingsTab } from 'src/settings'

export default class VerticalTimelineListPlugin extends Plugin {
  configuration: VerticalTimelineListPluginConfiguration;
  PLUGIN_PREFIX = "timeline";

	async onload() {
		await this.loadSettings(new VerticalTimelineListPluginConfiguration(this.PLUGIN_PREFIX, "1.1.1"));
    
    await this.configuration.loadConfiguration();

    await this.colorSchemeChange(true);

		this.addSettingTab(new VerticalTimelineListPluginSettingsTab(this.app, this));
	}

  onunload() {
    this.colorSchemeChange(false);
  }

	async loadSettings(defaultConfiguration: VerticalTimelineListPluginConfiguration) {
    await defaultConfiguration.loadExistingConfiguration(await this.loadData());
    this.configuration = defaultConfiguration;
    this.saveSettings();
	}

	async saveSettings() {
		await this.saveData(this.configuration);
	}

  private async colorSchemeChange(toggle: boolean) {
    if (toggle) {
      this.registerEvent(
        this.app.workspace.on("css-change", async () => {
          await this.configuration.loadConfiguration();
        })
      );
    } else {
      this.app.workspace.off("css-change", async () => {
        await this.configuration.loadConfiguration();
      });
    }
  }
}
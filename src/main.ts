import { Plugin } from 'obsidian';
import { VerticalTimelineListPluginConfiguration } from 'src/configuration'
import { VerticalTimelineListPluginSettingsTab } from 'src/settings'

export default class VerticalTimelineListPlugin extends Plugin {
  configuration: VerticalTimelineListPluginConfiguration;
  PLUGIN_PREFIX = "timeline";


	async onload() {
		await this.loadSettings(new VerticalTimelineListPluginConfiguration(this.PLUGIN_PREFIX));
    
    await this.configuration.loadConfiguration();

    await this.colorSchemeChange(true);

		this.addSettingTab(new VerticalTimelineListPluginSettingsTab(this.app, this));
	}

  unload() {
    this.colorSchemeChange(false);
  }

	async loadSettings(defaultConfiguration: VerticalTimelineListPluginConfiguration) {
    this.configuration = Object.assign(defaultConfiguration, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.configuration);
	}

  async colorSchemeChange(toggle: boolean) {
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
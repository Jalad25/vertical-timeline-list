import { Plugin } from 'obsidian';

import { VerticalTimelineListPluginSettingsTab, VerticalTimelineListPluginSettings } from './settings'

export default class VerticalTimelineListPlugin extends Plugin {
	settings: VerticalTimelineListPluginSettings;

	async onload() {
		await this.loadSettings(new VerticalTimelineListPluginSettings());
    this.settings.loadSettings();

		this.addSettingTab(new VerticalTimelineListPluginSettingsTab(this.app, this));
	}

	async loadSettings(defaultSettings: VerticalTimelineListPluginSettings) {
    this.settings = Object.assign(defaultSettings, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
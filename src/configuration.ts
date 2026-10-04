//#region Settings

//#region Types/Objects/Interfaces

export const Theme = {
  dark:  "dark",
  light: "light",
} as const;
export type Theme = (typeof Theme)[keyof typeof Theme];

export interface ColorThemePair {
  dark: string;
  light: string;
}

export interface VerticalTimelineListCssSettings {
	// Dimensions
	dotSeparation: number;
	linePadding: number;
	dotChildrenPadding: number;
	dotChildrenTopMargin: number;
	dotChildrenBottomMargin: number;

	// Theme
	dotColor: ColorThemePair;
	dotCollapsibleColor: ColorThemePair;
	dotCollapsibleShadowColor: ColorThemePair;
	lineColor: ColorThemePair;
	dotChildrenBackgroundColor: ColorThemePair;

	// Behavior
	dotCollapsible: boolean;
}

//#endregion

//#region Constants

export const DEFAULT_SETTINGS: VerticalTimelineListCssSettings = {
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

	dotCollapsible: false
};

//#endregion

//#endregion

//#region Configuration

//#region Types/Objects/Interfaces

export type VerticalTimelineListConfiguration = { schemaVersion: number } & VerticalTimelineListCssSettings;

//#endregion

//#region Constants

export const DATA_JSON_SCHEMA_VERSION = 1; // For data.json schema

export const DEFAULT_CONFIGURATION: VerticalTimelineListConfiguration = {
	schemaVersion: DATA_JSON_SCHEMA_VERSION,
	...DEFAULT_SETTINGS
};

//#endregion

//#endregion

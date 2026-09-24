import { VerticalTimelineListSettings } from "./main";

//#region Constants

export const CURRENT_SCHEMA_VERSION = 1;

const MIGRATIONS: Migration[] = [
  { from: 0, to: 1, apply: migrate_0_to_1 }
];

//#endregion

//#region Types/Objects/Interfaces

type Migration = {
  from: number;
  to: number;
  apply: (raw: Record<string, unknown>) => Partial<VerticalTimelineListSettings> & { schemaVersion: number };
};

export type MigrationResult = {
  values: Partial<VerticalTimelineListSettings>;
  migrated: boolean;
};

//#endregion

//#region Migration

export function migrate(raw: unknown): MigrationResult {
  if (!isRecord(raw)) {
    return { values: { schemaVersion: CURRENT_SCHEMA_VERSION }, migrated: true };
  }

  let current: Record<string, unknown> = raw;
  let version: number = typeof current.schemaVersion === "number" ? current.schemaVersion : 0;

  let migrated = false;
  while (version < CURRENT_SCHEMA_VERSION) {
    const step = MIGRATIONS.find((m) => m.from === version);
    if (!step) break;
    current = step.apply(current);
    version = step.to;
    migrated = true;
  }

  return {
    values: current,
    migrated
  };
}

//#region Migration Step Functions

/* This is a per-version migration steps. Append new functions below for each schema
   change and add it to MIGRATIONS. Never edit existing steps. */

function migrate_0_to_1(raw: Record<string, unknown>): Partial<VerticalTimelineListSettings> & { schemaVersion: 1 } {
  const out: Partial<VerticalTimelineListSettings> & { schemaVersion: 1 } = {
    schemaVersion: 1,
  };

  const dimMap: Record<string, keyof VerticalTimelineListSettings> = {
    "dot-separation": "dotSeparation",
    "line-padding": "linePadding",
    "dotChildren-padding": "dotChildrenPadding",
    "dotChildren-top-margin": "dotChildrenTopMargin",
    "dotChildren-bottom-margin": "dotChildrenBottomMargin"
  };

  const dimensions = raw.timelineCSSDimensions;
  if (isRecord(dimensions)) {
    for (const piece of Object.values(dimensions)) {
      if (!Array.isArray(piece)) continue;
      for (const entry of piece) {
        if (!isRecord(entry)) continue;
        const id = typeof entry.id === "string" ? entry.id : undefined;
        const key = id ? dimMap[id] : undefined;
        if (key && typeof entry.value === "string") {
          const n = parseInt(entry.value, 10);
          if (!Number.isNaN(n)) (out as Record<string, unknown>)[key] = n;
        }
      }
    }
  }

  // v0 Theme enum: 0 = dark, 1 = light
  const colorMap: Record<string, keyof VerticalTimelineListSettings> = {
    "dot-color": "dotColor",
    "dot-collapsible-color": "dotCollapsibleColor",
    "dot-collapsible-shadow-color": "dotCollapsibleShadowColor",
    "line-color": "lineColor",
    "dotChildren-background-color": "dotChildrenBackgroundColor"
  };

  const colors = raw.timelineThemesCSSColors;
  if (isRecord(colors)) {
    for (const piece of Object.values(colors)) {
      if (!Array.isArray(piece)) continue;
      for (const entry of piece) {
        if (!isRecord(entry)) continue;
        const id = typeof entry.id === "string" ? entry.id : undefined;
        const key = id ? colorMap[id] : undefined;
        const dark = isRecord(entry[0]) && typeof entry[0].value === "string" ? entry[0].value : undefined;
        const light = isRecord(entry[1]) && typeof entry[1].value === "string" ? entry[1].value : undefined;
        if (key && dark && light) {
          (out as Record<string, unknown>)[key] = { dark, light };
        }
      }
    }
  }

  const toggleMap: Record<string, keyof VerticalTimelineListSettings> = {
    "dot-collapsible": "dotCollapsible",
  };
  const toggles = raw.timelineCSSToggles;
  if (isRecord(toggles)) {
    for (const piece of Object.values(toggles)) {
      if (!Array.isArray(piece)) continue;
      for (const entry of piece) {
        if (!isRecord(entry)) continue;
        const id = typeof entry.id === "string" ? entry.id : undefined;
        const key = id ? toggleMap[id] : undefined;
        if (key && typeof entry.enabled === "boolean") {
          (out as Record<string, unknown>)[key] = entry.enabled;
        }
      }
    }
  }

  return out;
}

//#endregion

//#endregion

//#region Utilities

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

//#endregion

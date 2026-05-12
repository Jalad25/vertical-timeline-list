/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment -- This module reads untyped JSON of unknown shape from prior plugin versions. Strict typing here would only obscure the runtime guards that actually protect against malformed input. */

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
  apply: (raw: any) => Partial<VerticalTimelineListSettings> & { schemaVersion: number };
};

export type MigrationResult = {
  values: Partial<VerticalTimelineListSettings>;
  migrated: boolean;
};

//#endregion

//#region Migration

export function migrate(raw: unknown): MigrationResult {
  if (!raw || typeof raw !== "object") {
    return { values: { schemaVersion: CURRENT_SCHEMA_VERSION }, migrated: true };
  }

  let current: any = raw;
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
    values: current as Partial<VerticalTimelineListSettings>,
    migrated
  };
}

//#region Migration Step Functions

/* This is a per-version migration steps. Append new functions below for each schema
   change and add it to MIGRATIONS. Never edit existing steps. */

function migrate_0_to_1(raw: any): Partial<VerticalTimelineListSettings> & { schemaVersion: 1 } {
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

  for (const piece of Object.values(raw.timelineCSSDimensions ?? {})) {
    if (!Array.isArray(piece)) continue;
    for (const entry of piece) {
      const key = dimMap[entry?.id];
      if (key && typeof entry.value === "string") {
        const n = parseInt(entry.value, 10);
        if (!Number.isNaN(n)) (out as any)[key] = n;
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

  for (const piece of Object.values(raw.timelineThemesCSSColors ?? {})) {
    if (!Array.isArray(piece)) continue;
    for (const entry of piece) {
      const key = colorMap[entry?.id];
      if (key && entry?.[0]?.value && entry?.[1]?.value) {
        (out as any)[key] = { dark: entry[0].value, light: entry[1].value };
      }
    }
  }

  const toggleMap: Record<string, keyof VerticalTimelineListSettings> = {
    "dot-collapsible": "dotCollapsible",
  };
  for (const piece of Object.values(raw.timelineCSSToggles ?? {})) {
    if (!Array.isArray(piece)) continue;
    for (const entry of piece) {
      const key = toggleMap[entry?.id];
      if (key && typeof entry.enabled === "boolean") {
        (out as any)[key] = entry.enabled;
      }
    }
  }

  return out;
}

//#endregion

//#endregion

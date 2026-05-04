# Development

This document outlines how to set up a local development environment and the internals of the plugin for contributors. For end-user documentation, see [README.md](./README.md). For the contribution process, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## Prerequisites

- **[Node.js](https://nodejs.org/)**: v22 or later recommended
- **[npm](https://www.npmjs.com/)**: bundled with Node.js
- **[Git](https://git-scm.com/)**: latest version
- **[Obsidian](https://obsidian.md/)**: 1.10.6 or later, plus a local vault for testing. Older versions will not load the plugin.

## Getting Started

### 1. Clone the Repository

Clone the repository directly into your vault's plugin folder:

```bash
git clone <repository> <vault>/.obsidian/plugins/vertical-timeline-list
cd <vault>/.obsidian/plugins/vertical-timeline-list
```

Replace `<vault>` with the path to your Obsidian vault and `<repository>` with the link to your fork of the repository.

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Build

```bash
npm run dev
```

This starts esbuild in watch mode. It will rebuild `main.js` automatically whenever source files change.

### 4. Enable the Plugin in Obsidian

1. Open Obsidian.
2. Go to **Settings → Community plugins**.
3. Enable **Vertical Timeline List**.
4. After making changes, reload Obsidian to pick up the rebuilt `main.js`. Either:
   - Open the developer console with `Ctrl+Shift+I` / `Cmd+Option+I` and press `F5` (or `Ctrl/Cmd+R`) to reload the window, or
   - Disable and re-enable the plugin in **Settings → Community plugins**.

> **Tip:** The [Hot Reload](https://github.com/pjeby/hot-reload) community plugin can reload the plugin automatically whenever `main.js` changes, removing the need to reload manually.

## Linting

```
npm run lint
```

ESLint 10 is configured via [`eslint.config.mjs`](eslint.config.mjs) (flat config). The setup extends `eslint-plugin-obsidianmd`'s recommended rules, which include Obsidian-specific guidance plus the typescript-eslint type-aware ruleset. Run lint before submitting a pull request.

## Production Build

```bash
npm run build
```

This performs a TypeScript type-check followed by an optimized esbuild bundle. The output is `main.js` in the project root.

The files required for a release are:

- `main.js`
- `manifest.json`
- `styles.css`

## Project Structure

```
vertical-timeline-list/
├── src/
│   ├── main.ts                           # Plugin entry point
│   ├── CssApplier.ts                     # CSS variable application
│   ├── SchemaMigrations.ts               # data.json migrations
│   └── VerticalTimelineListSettingTab.ts # Settings tab UI
├── styles.css                            # Plugin styles
├── types.d.ts                            # Image import declarations
├── manifest.json                         # Obsidian plugin manifest
├── versions.json                         # Plugin/Obsidian version map
├── package.json                          # npm manifest and scripts
├── tsconfig.json                         # TypeScript config
├── esbuild.config.mjs                    # esbuild config
└── eslint.config.mjs                     # ESLint config
```

## Settings Schema Migrations

Plugin settings are versioned through [`SchemaMigration.ts`](src/SchemaMigration.ts). The `schemaVersion` field on `VerticalTimelineListSettings` records the version of the data on disk, and `CURRENT_SCHEMA_VERSION` records the version the running code expects.

On every plugin load, `loadSettings()` runs the user's saved data through `migrate(...)`, which steps the data forward one version at a time using the entries in the `MIGRATIONS` array. If anything was migrated, the upgraded settings are written back to disk so the user only pays the migration cost once.

### Adding a new migration

When a settings change would break existing user data (renamed field, restructured value, removed field with a non-default replacement, etc.):

1. **Bump `CURRENT_SCHEMA_VERSION`** in [`SchemaMigration.ts`](src/SchemaMigration.ts) by one.
2. **Add a step function** named `migrate_N_to_N+1(raw)` under the *Migration Step Functions* region. It receives the previous-version shape as `any` and returns `Partial<VerticalTimelineListSettings> & { schemaVersion: N+1 }`.
3. **Register it** by adding `{ from: N, to: N+1, apply: migrate_N_to_N+1 }` to the `MIGRATIONS` array.
4. **Update `VerticalTimelineListSettings` and `DEFAULT_SETTINGS`** in [`main.ts`](src/main.ts) to reflect the new shape.

> [!IMPORTANT]
> Never edit a migration step after it has shipped. Users who already ran the old version of the step would silently desync from those who ran the new version. If a step needs correcting, write a *new* step that fixes the bad data forward.

## Testing

Currently, the project relies on manual testing within an Obsidian vault. When making changes, please verify:

- The plugin loads without errors (check the developer console with `Ctrl+Shift+I` / `Cmd+Option+I`).
- Settings persist across reloads.
- Editing a setting (dimension, color, or toggle) updates the timeline immediately without requiring a reload.
- Switching Obsidian's theme between light and dark applies the corresponding color set without a reload.
- A task list with `- [t]` as the parent renders as a vertical timeline in **Reading View**, and entries with nested children show details (and collapse/expand correctly when the **Dot collapsible** setting is on).
- Loading a `data.json` from a previous schema version triggers migration on first start, after which the file is rewritten in the current shape with `schemaVersion` stamped.
- The plugin renders correctly in **both light and dark mode**. All bugs, features, and UI changes should be verified against both themes before submission.

## Submitting Changes

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow, including how to file bugs and feature requests using the issue templates under [`.github/ISSUE_TEMPLATE/`](.github/ISSUE_TEMPLATE/).

## Releasing

> [!IMPORTANT]
> Releasing is restricted to project maintainers.

The release process is automated through two GitHub Actions workflows:

1. **Trigger the version bump workflow.** Go to **Actions → Bump version → Run workflow** and enter the new version (e.g. `1.1.0`), following [Semantic Versioning](https://semver.org/). The workflow updates `manifest.json`, `package.json`, and `versions.json`, commits the changes, and pushes a matching git tag.
2. **The release workflow runs automatically.** Pushing the tag triggers [`release.yml`](.github/workflows/release.yml), which validates that the tag matches `manifest.json`, builds the production bundle, and creates a GitHub release with `main.js`, `manifest.json`, and `styles.css` attached.

No local steps are required.

### Manual fallback

If the workflows are unavailable, the release can be performed manually:

1. Update the version in `manifest.json` and `package.json` to the new version number, following [Semantic Versioning](https://semver.org/).
2. Update `versions.json` to map the new plugin version to the minimum required Obsidian version.
3. Run `npm run build` to produce the production bundle.
4. Commit the version bump and tag the release: `git tag -a <version> -m "<version>"`.
5. Push the tag: `git push origin <version>`. This will still trigger the release workflow if it is operational; if not, continue to step 6.
6. Create a GitHub release attaching `main.js`, `manifest.json`, and `styles.css`.

## Troubleshooting Common Issues

### Plugin does not appear in Obsidian

- Verify the plugin folder is at `<vault>/.obsidian/plugins/vertical-timeline-list/`.
- Make sure `main.js`, `manifest.json`, and `styles.css` are present in that folder.
- Toggle **Restricted mode** off in **Settings → Community plugins**.

### Changes are not reflected after rebuild

- Open the developer console (`Ctrl+Shift+I` / `Cmd+Option+I`) and press `F5` (or `Ctrl/Cmd+R`) to reload the window.
- Disable and re-enable the plugin in **Settings → Community plugins**.
- Restart Obsidian.

## Useful Resources

- [Obsidian Plugin Developer Docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [Obsidian API reference](https://github.com/obsidianmd/obsidian-api)
- [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin)
- [eslint-plugin-obsidianmd](https://github.com/obsidianmd/eslint-plugin)

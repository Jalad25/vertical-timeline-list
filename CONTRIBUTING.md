# Contributing

Thank you for your interest in contributing! This document outlines the process for contributing to the project. For end-user documentation, see [README.md](./README.md). For architecture and internals, see [DEVELOPMENT.md](./DEVELOPMENT.md).

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Be kind, constructive, and professional in all interactions.

## Reporting Bugs

Bugs are tracked as GitHub issues using the [bug report template](https://github.com/Jalad25/vertical-timeline-list/issues/new?template=bug_report.yml), which prompts for the reproduction steps, version info, and other details needed to triage the issue.

Before opening a new bug report:

- Search [existing issues](https://github.com/Jalad25/vertical-timeline-list/issues) to see if it has already been reported.
- Make sure you are running the latest version of the plugin and the minimum required version of Obsidian.
- Try to reproduce the bug in a clean vault with other plugins disabled or removed.
- Try to reproduce the bug in **both light and dark mode**, since some issues are theme-specific.

## Suggesting Enhancements

Feature requests are tracked as GitHub issues using the [feature request template](https://github.com/Jalad25/vertical-timeline-list/issues/new?template=feature_request.yml). The template focuses on the *problem* you're trying to solve before the proposed solution.

If your idea is still in an early stage and you'd like to discuss it before filing a formal request, open an [Ideas discussion](https://github.com/Jalad25/vertical-timeline-list/discussions) instead.

## Questions and Discussion

For usage questions, configuration help, or sharing how you use the plugin, please open a [discussion](https://github.com/Jalad25/vertical-timeline-list/discussions) rather than an issue. Discussion categories include Q&A, Ideas, and Show & Tell, each with its own template.

## Contributing Code

### Before you start...

- **Open an issue or discussion** for non-trivial changes so we can agree on the approach. Small fixes (typos, doc improvements, obvious bugs) can skip this.
- **Scope each pull request to one issue, bug, or feature**. Bundled changes are harder to review.
- **Consider whether your changes need new dependencies**. If a change requires a new dependency, mention why in the issue first.

### Once you are ready to code...

1. **Fork** the repository and create your branch from `master`.
2. **Follow the development setup** in [DEVELOPMENT.md](DEVELOPMENT.md).
3. **Make your changes** in a clear, focused commit history.
4. **Lint your code** by running `npm run lint`.
5. **Build the project** with `npm run build` to ensure there are no TypeScript errors.
6. **Test your changes** in a local Obsidian vault.
7. **Update documentation** (README or DEVELOPMENT.md) if your changes affect user-facing behavior or development workflow.

### Creating a Pull Request

When creating a pull request you'll be met with a default pull request template. It includes a list of template names that can be appended to the pull request URL to create a PR using one of the specialized templates. If you are unsure of which template to use, the default is fine. Fill out the chosen template and click "Create pull request" when you are ready.

#### Pull Request Templates

For more specific changes, you can use one of the specialized templates:

| Type of change | Template URL parameter |
|---|---|
| New feature | [`?template=feature.md`](https://github.com/Jalad25/vertical-timeline-list/compare/master...master?template=feature.md&quick_pull=1) |
| Bug fix | [`?template=bugfix.md`](https://github.com/Jalad25/vertical-timeline-list/compare/master...master?template=bugfix.md&quick_pull=1) |
| Documentation | [`?template=docs.md`](https://github.com/Jalad25/vertical-timeline-list/compare/master...master?template=docs.md&quick_pull=1) |
| Refactor | [`?template=refactor.md`](https://github.com/Jalad25/vertical-timeline-list/compare/master...master?template=refactor.md&quick_pull=1) |

## License

By contributing to this project you agree that your contributions will be licensed under the [GNU Affero General Public License v3.0](LICENSE).

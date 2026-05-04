<!-- Template for a refactor with no user-facing behavior change. Append ?template=refactor.md to the PR URL to use this template. -->

## Summary

<!-- A short description of what is being refactored. -->

## Related issue

<!-- Optional. Use "Closes #123" if this PR addresses a tracked refactor task. -->

## Motivation

<!-- Why is this refactor worth doing? E.g. reducing duplication, untangling a hard-to-test module, preparing for an upcoming feature. -->

## What changed

<!-- A bullet list of the structural changes: files moved, functions extracted, types renamed, etc. -->

-

## Behavior preservation

<!-- How are you confident no user-facing behavior changed? List the scenarios you manually verified, or explain why the change is mechanically safe (e.g. pure rename, type-only change). -->

## Risk assessment

<!-- Which parts of the plugin are touched? Where could a regression hide? Any code paths that are hard to exercise manually? -->

## Checklist

- [ ] I have read the [contributing guidelines](../../CONTRIBUTING.md).
- [ ] This PR contains no user-facing behavior changes.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes with no TypeScript errors.
- [ ] I have tested the affected areas in a local vault to confirm no regression.

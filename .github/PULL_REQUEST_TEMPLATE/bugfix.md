<!-- Template for a bug fix. Append ?template=bugfix.md to the PR URL to use this template. -->

## Summary

<!-- A short description of the bug and how this PR fixes it. -->

## Related issue

<!-- Use "Fixes #123" to auto-close the bug report on merge. -->

Fixes #

## Root cause

<!-- A short explanation of *why* the bug happened. This helps reviewers verify the fix actually addresses the cause and not just the symptom. -->

## The fix

<!-- A short explanation of what this PR changes to resolve the root cause. -->

## How to verify

<!-- Steps a reviewer can follow in a local vault to confirm the fix. Include the failing repro from the original issue. -->

1.
2.
3.

## Regression risk

<!-- Are there other code paths or features that could be affected by this change? What did you test to confirm no regression? -->

## Screenshots / recordings

<!-- For visible bugs, include before/after screenshots or a recording. Delete this section if not applicable. -->

## Checklist

- [ ] I have read the [contributing guidelines](../../CONTRIBUTING.md).
- [ ] This PR is linked to a bug report issue.
- [ ] I have reproduced the bug before this change and confirmed it no longer occurs after.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes with no TypeScript errors.
- [ ] I have tested with existing timelines to confirm no regression.
- [ ] I have verified the fix in both light and dark mode (if the bug is visual).

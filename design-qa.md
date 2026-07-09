# Design QA

- Source visual truth: `C:\Users\nikla\.codex\generated_images\019f2f0b-ea13-7e22-a959-94eaaae87bbf\exec-b6c47638-ebd5-45b8-8d29-1041aca235cb.png`
- Implementation screenshot: `C:\Users\nikla\Documents\Codex\2026-07-04\hi-ich-w-rde-gerne-an\tmp\qa\main-menu-390x844.png`
- Full-view comparison: `C:\Users\nikla\Documents\Codex\2026-07-04\hi-ich-w-rde-gerne-an\tmp\qa\design-comparison.png`
- Focused comparison: `C:\Users\nikla\Documents\Codex\2026-07-04\hi-ich-w-rde-gerne-an\tmp\qa\design-comparison-top.png`
- Viewport: `390x844`
- State: Main Menu, dark theme, fresh collection state, 20,000 RAP after the Walking smoke test.

## Full-View Comparison Evidence

The generated source was normalized from `852x1846` to `390x844` before comparison. The implementation preserves the source hierarchy: sticky wallet header, Adventure row, four-column Collectibles grid, and three-column Log Activity grid. The requested follow-up intentionally replaces the source Handbook tile with the global topbar book action. Save Status, Export, Import, and recent history are absent.

The implementation is slightly denser than the generated source so all primary dashboard content remains visible within the first mobile viewport. The final dashboard ends at 800px in an 844px viewport and has no horizontal overflow.

## Focused Comparison Evidence

The focused topbar/Adventure/Collectibles comparison confirms matching section order, compact icon-first cards, restrained indigo Adventure treatment, warm gold icons, dark olive surfaces, small radii, progress tracks, and direct category counts. The source uses a more decorative serif face; the implementation intentionally retains the established application sans-serif system for consistency with every existing subpage.

## Required Fidelity Surfaces

- Fonts and typography: hierarchy, weights, wrapping, and labels are consistent and readable. No dashboard label clips at `390x844` or `360x800`. The existing sans-serif family is an accepted product-system deviation from the mockup serif.
- Spacing and layout rhythm: section spacing, grid tracks, card heights, icon slots, and topbar actions are stable. Adventure, Collectibles, and Log Activity now share one visual rhythm without enclosing panel nesting.
- Colors and visual tokens: the near-black green base, muted gold, parchment text, lime progress, and indigo Activity accents match the selected direction and existing product tokens.
- Image quality and asset fidelity: the dashboard uses the existing Lucide icon system. No visible source asset is replaced by CSS art, emoji, text glyphs, or a placeholder.
- Copy and content: all interface text is English. Counts, RAP rewards, activity labels, and future states match the current data model. Handbook and save-control placement follow the user's explicit revision to the mockup.

## Comparison History

### Iteration 1

- P2: dashboard cards and labels were materially smaller than the selected mockup.
  - Fix: increased section rhythm, tile heights, icon slots, and label sizes while retaining first-viewport fit.
  - Post-fix evidence: `design-comparison.png` and `design-comparison-top.png`.
- P2: long Handbook pages produced a desktop horizontal scrollbar because the mobile shell used `100vw`, which included scrollbar width.
  - Fix: changed the shell to `width: min(100%, 430px)`.
  - Post-fix evidence: browser measurements report document width equal to viewport width at both tested mobile sizes.

### Final Pass

No actionable P0, P1, or P2 differences remain. The serif-to-sans choice and omission of non-semantic progress bars are accepted P3/product-system deviations.

## Primary Interactions Tested

- Walking grants 20,000 RAP.
- Main Menu and Activities open their correct contextual guides.
- Fisher's Trawler opens a specific contextual guide from its detail view.
- The topbar book opens the complete Handbook index from contextual help.
- Search for `Bad Luck` returns the Bad Luck Protection article.
- Related article navigation works.
- Back restores the exact originating Activity detail view.
- Browser console warnings/errors checked: none.

## Implementation Checklist

- [x] Unified dashboard sections
- [x] Global contextual Handbook action
- [x] Searchable and categorized Handbook registry
- [x] Origin-aware Handbook return navigation
- [x] Mobile overflow and text-fit checks
- [x] Runtime console check

final result: passed

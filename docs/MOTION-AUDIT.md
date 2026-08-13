# ONEIRIC Motion Audit

Phase: 4 — Motion + Experience System

Date: 2026-08-12

Scope inspected:

- Root project documentation: `DESIGN-BRIEF.txt`, `DESIGN-SYSTEM.txt`
- Requested root Markdown docs: `DESIGN-BRIEF.md`, `DESIGN-SYSTEM.md` were missing at intake and were added as root placeholders pointing to the inspected `.txt` sources.
- Pages: `src/app/page.tsx`, `src/app/calendar/page.tsx`, `src/app/dreams/[id]/page.tsx`, `src/app/new/page.tsx`
- Components: `src/components/app-shell.tsx`, `src/components/atmosphere.tsx`, `src/components/home-experience.tsx`, `src/components/dream-calendar.tsx`, `src/components/dream-detail.tsx`, `src/components/dream-pearl.tsx`, `src/components/new-dream-form.tsx`, `src/components/view-transition-link.tsx`, shadcn-style UI primitives
- Data and tokens: `src/lib/dreams.ts`, `src/app/globals.css`, `tailwind.config.ts`, `package.json`

## 1. Existing motion

- Atmosphere uses continuous Motion animations on three blurred gradient fields and three translucent floating forms.
- Fine iridescent hairlines use CSS keyframes.
- Page sections use entry fades with small vertical movement.
- Navigation active states use `layoutId` to slide a luminous presence surface between items.
- Dream pearls use Motion `layoutId`, but the layout continuity is incomplete because route transitions remount page trees without a shared layout group that persists across routes.
- Browser View Transitions are used in `ViewTransitionLink`; this gives some cross-route continuity where supported.
- New Dream uses `AnimatePresence` for progressive disclosure and subtle confirmation.

## 2. Existing transitions

- Most durations and easings are hardcoded directly in components.
- The system currently mixes Motion transitions, CSS transitions, Tailwind duration utilities, and View Transition API behavior without one semantic source of truth.
- Calendar-to-detail is closer to a generic page transition than a deliberate Pearl → Memory transition.
- Return from detail to calendar is functional but does not yet feel intentionally reversed as Memory → Pearl.

## 3. Existing visual layers

Current implementation roughly maps to the design hierarchy:

- Z0 Background: fixed pearl radial base in `Atmosphere`.
- Z1 Atmosphere: blurred pastel gradient fields.
- Z2 Ambient elements: translucent floating forms and fine shimmer lines.
- Z3 Calendar: calendar surface and temporal field.
- Z4 Interactive surfaces: nav, buttons, form, preview surfaces.
- Z5 Focused dream: dream detail opal surface.
- Z6 Navigation: fixed top and mobile nav.
- Z7 Temporary feedback: New Dream “Kept” message.

Issue: the z-index values are currently arbitrary Tailwind values such as `z-50`, `z-10`, negative z layers, and implicit stacking contexts. The conceptual hierarchy exists, but it is not tokenized or named.

## 4. Existing interaction states

- Buttons: default, hover, active, disabled, focus-visible exist.
- Inputs: default and focus-visible exist; error/loading/success are not needed in this prototype.
- Calendar dates: dream/no-dream states exist; hover/focus is mainly on nested pearl links, not the date surface.
- Dream pearls: default and selected exist; hover/focus depend on parent `group` styling rather than the component owning its states.
- Navigation: default/active/hover/focus exist.
- Save/New Dream: quiet confirmation exists, but it does not yet move the user toward the calendar or reveal a new pearl.

## 5. Current strengths

- The visual direction is already coherent: light, pearl, opal, frosted surfaces, editorial type, and low-density composition.
- The calendar avoids a conventional Google Calendar look by using a soft temporal field and pearl markers.
- The New Dream form already uses progressive disclosure and avoids administrative language.
- The detail page prioritizes title, date, and narrative, with restrained metadata.
- Reduced-motion CSS exists globally and `Atmosphere` checks `useReducedMotion`.
- No backend, auth, database, Supabase, AI, export, analytics, dark mode, or unrelated product expansion exists.

## 6. Current inconsistencies

- Motion values are not semantic; durations and easings are repeated in components.
- The pearl component is visually important but not yet an interaction primitive with explicit `default`, `hover`, `focus`, `selected`, and `multiple` states.
- Browser View Transitions are available, but the named view transition is assigned only to the pearl, not to the memory surface. Continuity is therefore partial.
- Atmosphere movement is elegant but slightly more visible than the brief’s “barely noticed” target, especially because multiple large blurred elements move continuously.
- Calendar day surfaces animate via generic transition utilities even when no interaction occurs.
- `DreamCalendar` uses inline transforms for multi-dream offsets. This is acceptable for geometry but should not become a pattern for motion values.
- Copy contains a few explicit prototype reminders; useful for honesty, but the confirmation could be more experiential.

## 7. Technical risks

- Continuous animation of large blurred surfaces can be expensive on lower-end mobile devices.
- `backdrop-filter` and large `blur-3xl` areas are aesthetically effective but can trigger costly compositing.
- The global reduced-motion rule forces extremely short animation durations, but Motion components also need semantic reduced-motion behavior to avoid unnecessary large transforms.
- View Transition API support varies by browser. The experience needs to remain coherent when unsupported.
- The project lacks a `typecheck` script, though `next build` currently runs TypeScript validation.
- `npm install` previously reported audit vulnerabilities; they are dependency-level and were not fixed with force because that could introduce breaking changes.

## 8. UX risks

- If every surface floats or fades in, the product begins to feel decorated rather than spatial.
- If the pearl glow becomes too strong, it risks becoming a game object or generic “magic orb.”
- If calendar date surfaces are too card-like, the temporal landscape collapses into a productivity grid.
- If return navigation feels unrelated to origin, the user loses the “where I came from” memory loop.
- On mobile, hover-based affordances do not exist; touch targets and labels must carry the experience.

## 9. Redundant effects

- Multiple independent entry animations can be consolidated into semantic reveal variants.
- Some hover transitions on larger surfaces duplicate material response already provided by shadows and opacity.
- Fine shimmer lines can remain, but should be quieter and tokenized; if they compete with text, remove them.
- The “How to read it” explanatory card is helpful for prototype clarity but should remain visually subordinate.

## 10. Recommended changes

1. Add a semantic motion API in `src/lib/motion/tokens.ts` and `src/lib/motion/variants.ts`.
2. Add reusable motion primitives only where they reduce repetition: `Reveal`, `PageTransition`, and a small route-transition helper.
3. Tokenize CSS motion durations, easings, view-transition timing, and z-index layers in `globals.css`.
4. Make `DreamPearl` an explicit interaction primitive with state props for default, hover, focus, selected, and multiple.
5. Reduce atmosphere intensity: slower, lower-opacity movement; hide some ambient complexity on mobile/reduced motion.
6. Strengthen Pearl → Memory continuity by naming both pearl and dream memory surface view transitions and sequencing content reveal with semantic variants.
7. Strengthen Memory → Pearl return by making the back action target the calendar with the same transition mechanism and preserving the pearl as the origin marker.
8. Improve New Dream confirmation so the saved mock dream appears as a pearl preview and offers a natural return to calendar without a modal.
9. Add a `typecheck` script using `tsc --noEmit`.
10. Run lint, typecheck, and build after implementation.

## Post-implementation review

Changes applied in Phase 4:

- Motion durations, easings, springs, and variants were centralized in `src/lib/motion`.
- CSS motion and z-layer tokens were added to `src/app/globals.css`.
- Atmosphere motion was slowed, reduced in opacity, and simplified on smaller viewports.
- `DreamPearl` now owns explicit interactive, selected, and multiple-dream states.
- Calendar selection now marks the chosen pearl as focused before route transition and visually quiets the surrounding temporal field.
- Dream detail now uses semantic dream reveal timing and preserves a visible pearl anchor.
- New Dream now treats preservation as a prototype memory loop: the pearl forms, then the user can return to the calendar where the mock pearl is revealed.
- `typecheck` was added as an explicit script.

Remaining caveat:

- The root `DESIGN-BRIEF.md` and `DESIGN-SYSTEM.md` files exist, but their full canonical content remains in the original `.txt` files. The `.md` files are structural anchors for now. A future documentation cleanup should migrate the full text into Markdown to remove that ambiguity.

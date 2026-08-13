# ONEIRIC Motion System

Phase: 4 — Motion + Experience System

Motion in ONEIRIC exists to make memory feel spatial. It is not decoration and it is not a layer of excitement added after design. Motion must clarify how light, space, material, and depth relate to the user’s act of remembering.

## Core principles

Every animation must serve at least one of these principles:

1. Continuity — preserve where the user came from and where they are going.
2. Depth — make the interface feel layered without becoming a 3D toy.
3. Focus — guide attention toward the active memory or action.
4. Transformation — show a temporal point becoming a readable memory.
5. Feedback — confirm interaction calmly and accessibly.

If an animation does not serve one of these principles, remove it.

## Motion character

ONEIRIC motion should feel:

- organic
- quiet
- physical
- atmospheric
- intentional

Avoid:

- excessive bounce
- exaggerated springs
- fast zooms
- constant floating
- animation on every element
- generic SaaS transitions
- decorative motion without meaning

## Semantic duration tokens

Use semantic tokens rather than arbitrary durations:

| Token | Value | Purpose |
| --- | ---: | --- |
| `motionInstant` | 0.10s | Essential state changes, reduced-motion fallback |
| `motionFast` | 0.18s | Small feedback such as hover/focus |
| `motionStandard` | 0.34s | Interface state transitions |
| `motionExpressive` | 0.56s | Page-level reveals and material changes |
| `motionDream` | 0.82s | Pearl → Memory and Memory → Pearl transitions |
| `motionAmbientSlow` | 24s | Atmospheric drift |
| `motionAmbientSlower` | 34s | Background field drift |

CSS equivalents are exposed as custom properties:

- `--motion-instant`
- `--motion-fast`
- `--motion-standard`
- `--motion-expressive`
- `--motion-dream`
- `--motion-ambient-slow`
- `--motion-ambient-slower`

## Easing tokens

Use named easings:

- `easeSoftOut`: soft arrival
- `easeSoftIn`: quiet exit
- `easeDream`: spatial Pearl → Memory movement
- `easeMaterial`: tactile material response

Avoid mechanical default easing for major experience motion.

## Spring behavior

Springs are permitted only for physical microinteractions. They must be restrained:

- low bounce
- moderate stiffness
- no playful elastic behavior

Use spring behavior for pearl hover/press only when it communicates tactility.

## Opacity transitions

Opacity may be used for:

- atmospheric entry
- content reveal
- secondary elements receding
- temporary feedback

Opacity should not be the only state indicator for accessibility-critical information.

## Transform behavior

Preferred animated properties:

- `transform`
- `opacity`

Allowed carefully:

- `filter: blur()` only on small or already-composited transitional elements
- `box-shadow` only for short hover/focus feedback

Avoid animating:

- layout dimensions
- large filter areas
- background-position on large complex surfaces
- expensive continuous repainting

## Depth hierarchy

Semantic z layers:

| Layer | Token | Role |
| --- | --- | --- |
| Z0 | `--z-background` | Pearl base environment |
| Z1 | `--z-atmosphere` | Pastel atmospheric gradients |
| Z2 | `--z-ambient` | Floating translucent shapes |
| Z3 | `--z-calendar` | Temporal landscape |
| Z4 | `--z-surface` | Interactive surfaces |
| Z5 | `--z-focus` | Focused dream |
| Z6 | `--z-navigation` | Navigation and controls |
| Z7 | `--z-feedback` | Temporary feedback |

Use the token that describes the layer’s purpose.

## Signature transition: Pearl → Memory

Sequence:

1. Pearl receives focus.
2. Pearl light expands subtly.
3. Calendar environment recedes.
4. Non-selected elements lose priority.
5. Pearl becomes the transition origin.
6. Dream surface emerges as the deeper layer.
7. Title appears.
8. Date follows.
9. Narrative becomes readable.
10. User arrives inside the memory.

Implementation guidance:

- Prefer browser View Transitions for cross-route continuity where supported.
- Use Motion `layoutId` where the component remains in a compatible tree.
- Do not force fragile shared layout if route architecture makes it unreliable.
- Reduced-motion mode should preserve the sequence as hierarchy changes, not as large movement.

### Final implementation decision

ONEIRIC uses a hybrid route strategy:

- Native View Transitions preserve the named pearl between calendar and detail routes.
- Motion for React owns local pearl states, page reveals, receding calendar priority, navigation presence, and progressive disclosure.
- `layoutId` is not used for cross-route pearl continuity because the App Router can remount those trees and the same dream can appear in more than one preview on a page.
- When View Transitions are unsupported, the same links continue through normal router navigation with the same hierarchy and accessible labels.

## Return transition: Memory → Pearl

Returning to the calendar should feel like moving back from the memory into time.

Guidance:

- Use the same transition link mechanism as entry.
- Keep the dream pearl visible on both sides of the transition.
- The calendar should regain priority rather than snap in as an unrelated page.
- Avoid modal close metaphors.

## Atmosphere

Atmosphere is continuous only when it is nearly subconscious.

Rules:

- slow durations
- low opacity
- transform-only drift
- fewer moving layers on mobile
- disabled or reduced under `prefers-reduced-motion`

No particles unless they clearly improve the sense of memory. Current Phase 4 does not require particles.

## Calendar

Calendar motion should be calmer than dream motion.

- Empty dates: almost silent.
- Dream dates: luminous pearl.
- Hover/focus: slight expansion and readable label.
- Selected/focused dream: light bloom and priority increase.
- Multiple dreams: slightly increased density, not a noisy cluster.

Do not animate every date.

## New Dream

The New Dream experience is writing into memory:

1. Dream fragment field appears first.
2. Date and title reveal only after the fragment has substance.
3. Preservation confirmation appears as a quiet pearl, not a modal.
4. The user is invited to return to the calendar where the dream would live.

## Reduced motion

When `prefers-reduced-motion: reduce` is active:

- remove ambient drift
- remove parallax
- remove large transforms
- reduce page transitions
- keep focus states, selected states, readable labels, and confirmation feedback

Reduced motion must not reduce meaning.

Semantic reduced-motion behavior uses the `motionInstant` token. It removes atmospheric drift and large transforms while preserving selected, focused, entered, and confirmed states.

## Performance

The motion budget prioritizes:

1. transform
2. opacity
3. short material response
4. limited blur on non-critical atmosphere

Avoid:

- continuous React state updates for animation
- WebGL / Three.js / GSAP
- heavy particles
- animating many large blurred surfaces

The interface should feel alive because relationships are coherent, not because effects are numerous.

## Semantic motion API

The implementation exposes intention-based primitives and variants:

- `PageTransition` / `pageEnter`: page arrival.
- `Reveal` / `softReveal`: quiet content emergence.
- `dreamReveal`: entering the deeper memory layer.
- `pearlMotion`: rest, hover, focus, selected, and press states.
- `calendarRecede`: surrounding time losing priority around a chosen memory.
- `transitions` and `reducedTransition`: semantic timing and fallback behavior.

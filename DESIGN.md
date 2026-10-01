---
name: "TRACE"
description: "Shared Korean teaching workspace with green navigation, mint selection, and semantic working surfaces."
colors:
  primary: "#2b6f60"
  primary-hover: "#235d50"
  mint: "#54b3a6"
  mint-soft: "#cfefea"
  rose-soft: "#f0dddd"
  yellow-soft: "#f8edcc"
  lavender-soft: "#e4e1f6"
  rose: "#d9807a"
  yellow: "#d4b763"
  lavender: "#837abd"
  chart-charcoal: "#484b47"
  background: "#f2f3ee"
  surface: "#fff"
  foreground: "#3b3d3b"
  supporting-text: "#606d64"
  placeholder-text: "#667065"
  heading-text: "#244e45"
  context-surface: "#eef6f2"
  input-surface: "#f6f7f4"
  ai-surface: "#f0eef8"
  attention-surface: "#fbf4de"
  execution-surface: "#273b35"
  navigation-selected: "#edfff5"
  sidebar-foreground: "#edfff5"
  border: "#e6e8e5"
  field-border: "#e1e5df"
  panel-border: "#e7e9e5"
typography:
  headline:
    fontFamily: "Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic, sans-serif"
    fontSize: "32px"
    fontWeight: 750
    lineHeight: 1.25
    letterSpacing: "-.03em"
  title:
    fontFamily: "Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic, sans-serif"
    fontSize: "20px"
    fontWeight: 750
    lineHeight: 1.4
    letterSpacing: "-.025em"
  body:
    fontFamily: "Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic, sans-serif"
    fontSize: "15px"
    lineHeight: 1.6
  control:
    fontFamily: "Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic, sans-serif"
    fontSize: "14px"
    lineHeight: 1.45
  label:
    fontFamily: "Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic, sans-serif"
    fontSize: "14px"
    fontWeight: 600
  supporting:
    fontFamily: "Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic, sans-serif"
    fontSize: "12px"
  metric:
    fontFamily: "Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic, sans-serif"
    fontSize: "26px"
    fontWeight: 750
    lineHeight: 1.4
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "14px"
    lineHeight: 1.8
rounded:
  control: "10px"
  button: "11px"
  navigation: "12px"
  section-symbol: "12px"
  panel: "18px"
  panel-compact: "18px"
spacing:
  field-gap: "8px"
  action-gap: "10px"
  group-gap: "12px"
  field-margin: "18px"
  section-gap: "22px"
  panel-padding: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.button}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "#525d50"
    rounded: "{rounded.button}"
    padding: "12px 20px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "#3b423c"
    rounded: "{rounded.control}"
    padding: "11px 13px"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "24px"
  navigation-active:
    backgroundColor: "{colors.navigation-selected}"
    textColor: "{colors.primary}"
    rounded: "{rounded.navigation}"
    padding: "8px 10px"
  goal-chip:
    backgroundColor: "{colors.mint-soft}"
    textColor: "{colors.primary}"
    rounded: "{rounded.control}"
  section-symbol:
    backgroundColor: "{colors.mint-soft}"
    textColor: "{colors.primary}"
    rounded: "{rounded.section-symbol}"
    size: "38px"
  review-tab-selected:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    padding: "12px 18px"
    height: "48px"
---

# Design System: TRACE

## Overview

**Creative North Star: "Reference-led TRACE workspace"**

TRACE carries the supplied dashboard and sidebar references into a Korean teaching workspace: a deep green navigation rail, warm gray page, white rounded panels, and pale mint selected destinations. Larger headings, readable controls, and section icons establish a clear working hierarchy without decorative imagery.

The shared presentation in src/workspace.css builds on src/index.css and src/app.css. Network practice and fusion projects share the same visual system and role-specific screen structure; their scenario data does not introduce separate navigation or card families. Surface-specific composition remains in the design brief.

**Key Characteristics:**
- Deep green navigation with a pale mint active destination and green text.
- Warm gray canvas, flat white working panels, and semantic context, interpretation, and attention surfaces.
- Clear Korean type hierarchy, labeled section icons, and visible keyboard focus.

## Colors

### Primary
Deep green carries the sidebar and primary actions. Mint supports selected controls and completion; soft mint supplies chip and section-icon backgrounds. The active sidebar destination uses the navigation-selected surface and primary text, with a soft mint icon tile. Inactive icons sit directly on the green sidebar.

### Secondary
Rose, yellow, lavender, mint, and chart charcoal distinguish evaluation segments and text-labeled legends. Their soft variants remain available for numbered assignment sections and badges. Semantic surfaces have specific jobs: context-surface supports task context and linked guidance evidence, input-surface supplies a neutral teacher-entry area, ai-surface distinguishes AI interpretation, and attention-surface draws attention to incomplete or reviewable work. These roles coexist with categorical chart colors. In the teacher guidance chart, L1 is mint, L2 lavender, L3 yellow, and L4 rose; each level retains its text label.

### Neutral
The warm gray canvas supports white panels and charcoal content. Heading text has a deeper green cast; supporting-text is the shared muted reading color, while placeholder-text is retained for field hints. Thin panel and field borders separate controls without shadows. Dark execution-surface and pale text separate raw evidence output from explanatory prose.

**The Selection Rule.** Use deep green for primary actions and pale mint with green text for the active sidebar destination. Criterion and evidence selection retain white surfaces with green outlines or borders; detail tabs use a green underline. Filled option controls retain their established local states.

**The Surface Meaning Rule.** Keep task context, neutral teacher input, AI interpretation, attention, and raw execution output visually distinct; do not use their fills as arbitrary decoration.

**The Category Color Rule.** Evaluation and observation bars use the shared mint, lavender, yellow, rose, and charcoal sequence to distinguish categories. Keep project colors stable when filters change, preserve labels and values beside color, and retain each chart’s numeric scale. Color does not turn support usage or evidence coverage into an ability score.

## Typography

The Korean sans stack in the frontmatter is shared across content and controls. Page headings, section headings, body reading, controls, and supporting annotations use separate roles. Evaluation points use the metric role; overview counts use a larger contextual treatment (30px). Section labels and evaluation metrics use tabular figures where applied. Evidence raw output uses the code role (14px, 1.8 line height); the student recent-result preview retains its contextual 13px treatment.

Page headings reduce to 28px through 900px and 26px through 600px. Section headings reduce to 18px through 600px. Subsection headings use 16px/700; evidence detail titles use 18px, and the student identity title uses 24px. Supporting notes use 1.7 line height. Important evidence titles, explanations, source output, and review controls use 14px. Detail tab labels reduce to 13px through 600px; timestamps, provenance, and small counts retain 12px. These metadata sizes do not define the body reading size. The TRACE wordmark uses 32px/800 with .01em tracking.

**The Reading Hierarchy Rule.** Keep page and section titles visibly above body content; reserve the smallest text for counts, provenance, timestamps, and supporting notes.

## Layout

The fixed sidebar is 272px wide by default, 290px from 1600px, and 240px through 1250px. Through 1050px it becomes a 272px off-canvas drawer with a dimmed backdrop; the main content loses its left offset. Desktop navigation can also collapse completely, exposing a reopen control. The main region has a 1740px maximum width and 32px top padding. Its horizontal padding is 44px by default, 64px from 1600px, 27px through 1250px, 30px in drawer layouts, and 18px through 760px. The body minimum width is 360px.

Shared working panels use the panel-padding token, increasing to 28px from 1600px, decreasing to 22px through 900px and 18px through 600px. Section-heading groups have a 20px bottom gap; icon and title are separated by 12px. Table headings are quiet gray; row labels carry weight, and related data aligns in stable columns. Narrow evaluation tables scroll horizontally inside their container.

Evaluation begins with a compact identity and progress strip and strengths and gaps, followed by a paired criterion/evidence workbench. Its grid is minmax(280px,.78fr) / minmax(0,1.6fr), separated by 20px. Criterion judgments remain sticky at a 20px top offset beside the selected criterion context and detail area. Through 1100px the workbench stacks, sticky positioning ends, and criteria form two columns; through 650px criteria become one column. Three detail controls expose 과정증거, 가이던스 이력, or 개념 이해와 수행. Inside this workbench, compact evidence choices form a two-column grid above the full record instead of creating another side-by-side split. The identity strip stacks through 1250px. Overall teacher feedback follows the workbench in document flow, with controls stacking through 600px. Hidden detail panels do not reserve space.

Assignment design retains its two-column 1.15fr/1fr grid and stacks through 760px; it is a surface-specific composition. Dashboard metrics form a compact shared strip, with three columns through 900px and two through 600px. The student landing places the current task and latest execution result in a 1fr/1.15fr grid with a 32px gap, reduced to 20px through 1100px and stacked through 650px. Team members, documents, next actions, and teacher guidance follow in top-aligned supporting pairs, which stack through 900px. Both scenarios use these same responsive relationships.

**The Reading Order Rule.** Put the current task and judgment controls before supporting detail, and keep final actions in document flow rather than a sticky footer.

## Elevation & Depth

Ordinary working panels use white fill and a thin border. Semantic fills provide internal grouping. The toast shadow is `0 8px 25px #0002`; modal dialogs use `0 20px 80px #0002`. The mobile drawer backdrop is `#18382c70`; native modal dialogs use `#18382c80`. Other established overlay variants retain their contextual backdrops.

**The Overlay Depth Rule.** Keep ordinary panels flat; reserve shadows for dialogs and transient notifications.

## Shapes

Controls and chips use softly rounded control corners; actions use the button radius. Navigation and section-icon tiles use the navigation and section-symbol radii. Working panels keep the panel radius at every breakpoint. Native modal dialogs retain larger corners (24px); the shared panel radius is not a dialog token. The sidebar has a 30px lower-right corner on desktop and 22px right corners in drawer mode.

Shared section icons occupy square tiles, shrinking to 32px with 10px corners through 600px. Icons themselves use a consistent 20px outline with 1.8 stroke width. Numbered assignment-section boxes remain 38px squares with 12px corners, reducing to 34px through 760px. Circular workflow steps, avatars, progress rings, and evaluation dots retain their indicator roles.

## Components

- **Buttons:** primary green and secondary white variants use 14px/600 labels in the main workspace, 46px minimum height, and 12px 20px padding. Hover darkens the primary or tints the secondary. Background transitions take .16s. Disabled controls use .48 opacity and a not-allowed cursor. Compact contextual actions preserve their own sizes.
- **Fields:** white fill, thin field border, control type, 1.45 line height, and 44px minimum height for inputs/selects. Hover changes the border to #a8beb2; focus changes it to mint. Border/background transitions take .16s. The global keyboard outline is 3px green with 3px offset; the sidebar uses soft mint.
- **Panels and section headings:** flat white containers pair a title with a labeled contextual icon and optional action or count. Soft mint is the default icon tile; lavender marks interpretation/support and yellow marks attention where used. Icons supplement text rather than replacing it.
- **Navigation:** rows use 52px minimum height and 15px labels. Inactive 32px icon tiles are transparent. The active row uses a pale mint surface and green text; its icon tile uses soft mint. The nonselected hover state is a subtle white tint. Labels remain visible in the drawer and the profile anchors its bottom.
- **Evaluation detail controls:** three native toggle buttons form a labeled group with aria-pressed state. The selected control has a 3px green underline and bold green text; hover uses context-surface. Controls have 48px minimum height, outline icons, and counts where available. In the workbench they use 14px labels and 12px 10px padding, reducing to 13px and 10px 6px through 600px; count badges hide through 600px. Selecting a criterion opens its connected evidence and outlines its white row in green. Evidence selection and stage filtering keep the criterion context aligned with the visible record; when a record has no matching criterion, the context explicitly says so. Evidence links reset the stage filter, open the evidence view, and focus the record heading.
- **Evidence layers:** raw execution output uses the dark monospace surface, student explanation stays on the working surface, AI interpretation uses the lavender semantic surface, and teacher confirmation and overall feedback entry use the neutral input surface with a border or local container boundary. Criterion bars use one absolute point scale from zero to the largest criterion allocation: both the current score and allocated track width use that same denominator, and the cap denotes allocated points. Category fills follow the shared five-color sequence. Labels and numeric values remain visible alongside color; missing estimates remain pending instead of becoming zero. Performed records, plans, and self-explanations carry distinct kind labels. Stage counts use performed records; plans and self-explanations have a separate filter. The selected criterion’s disclosure names its linked evidence, remaining conditions, and the simulated estimation method.
- **Observation and distribution charts:** observation rows are selectable, text-labeled bars with a green selection outline. Their disclosure shows the matching condition, included student/project population, numerator, denominator, missing records, and links to source evidence. Coverage is the share of student/project pairs with matching records, not an ability score; missing records are not proof of nonperformance. Monitoring distribution labels and counts sit in a wrapping legend outside the colored bar so small segments do not squeeze text.
- **Goal and option chips:** soft mint indicates selected editable content. Labels wrap, removal remains a separate action, and user-added options identify duplicates. Option toggles use 44px minimum height and 10px corners; goal chips preserve their compact contextual type.
- **Assignment workflow:** the three steps use numbered current and checked completed states. Mode selection uses a warm gray track with deep green and white selection. Content reveals over .18s ease-out from .65 opacity and a 3px downward offset. Per-output template controls support upload, replacement, download, and removal.
- **Guidance content:** selecting a guidance event first shows a vertical four-step sequence: the obstacle, help provided, subsequent action summary, and recorded evidence. The final evidence step uses context-surface and links to the source record. Support-level and distribution charts sit in a closed-by-default native details disclosure beneath this sequence. Actual student requests remain explicitly distinguished from AI summaries. L1–L4 describe support, not ability scores, and a linked plan does not imply a verified outcome. Concepts are explained within the current problem and support flow. Prior-course knowledge-connection cards and course-origin labels are not part of the shared visual system.
- **Student current work:** task title and continuation action sit beside the latest locally stored simulated request/result and text-labeled verification checks. The empty state explains where results will appear. Team activity shows each member’s current task and latest shared record; recent documents show author and version. Next-action links open the relevant work area. The simulation retains target, rules, checks, output, and explanation across navigation and reloads within each scenario; displayed results remain explicitly simulated.

The drawer translates over .2s. Under `prefers-reduced-motion: reduce`, animations and transitions are disabled and scrolling uses auto behavior. No decorative looping motion is established. Touch controls retain their implemented responsive target sizes rather than shrinking solely to fit more content.

## Do's and Don'ts

### Do:
- Do preserve the supplied green and mint identity and the shared structure across both scenarios.
- Do distinguish raw evidence, AI interpretation, and teacher judgment with labeled semantic surfaces.
- Do keep keyboard focus visible and honor reduced-motion preferences.
- Do retain diverse category colors, text labels, and numeric meaning in evaluation and observation charts.
- Do expose count definitions, missing evidence, and source links beside observation percentages.

### Don't:
- Don't restore the superseded charcoal active navigation treatment.
- Don't use semantic surfaces as interchangeable decoration or add ambient panel shadows.
- Don't reduce body content to supporting-note sizes to fit a crowded panel.
- Don't restore prior-course knowledge-connection cards or course-origin labels in guidance.

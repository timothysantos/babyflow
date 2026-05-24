# BabyFlow UX Rethink Broad Pass

Date: 2026-05-24

## Goal

BabyFlow should stop feeling like an exposed architecture demo. The app should feel like a calm caregiving tool:

- fast enough for a tired caregiver
- clear enough for a nanny or partner
- structured enough to support Babywise-style feed-wake-sleep review
- restrained like the `monies_map` app
- deeper reasoning available only when the user asks for review

This is a broad UX pass, not a feature slice.

## Reference Findings

### Baby tracker apps

Current baby tracker references point toward a simple pattern:

- fast one-tap logging
- feeding timers, including side-specific timers
- manual entry for retrospective logging
- shared caregiver sync
- summaries and review away from the main logging surface

Examples:

- Huckleberry’s App Store listing emphasizes simple one-touch tracking, breastfeeding timers for both sides, sleep summaries, reminders, and caregiver sync.
  Source: [Huckleberry App Store](https://apps.apple.com/us/app/huckleberry-baby-tracker/id1169136078)

- Huckleberry’s product site positions the app as a tracker that grows with the child.
  Source: [Huckleberry app](https://explore.huckleberrycare.com/app/)

- Comparison guides consistently describe Huckleberry as strong on sleep prediction and daily tracking, and Nara Baby as cleaner/minimalist.
  Source: [SleepSpot comparison](https://sleepspot.app/blog/best-baby-sleep-tracker-apps-compared-2026)
  Source: [Mothers Always Right app list](https://www.mothersalwaysright.com/15-baby-tracker-apps-you-need-smart-parenting/)

- Parent discussions repeatedly value quick logging, timers, and being able to add start/end times manually.
  Source: [Reddit baby tracker comparison](https://www.reddit.com/r/beyondthebump/comments/1b81ail)
  Source: [Reddit baby tracking apps](https://www.reddit.com/r/NewParents/comments/1i7tsxp)

Design implication:

BabyFlow should not expose every derived system on Today. Today should optimize for "what do I do now?" and "what just happened?"

### Babywise references

Babywise-adjacent material is not primarily about app complexity. It is about a rhythm:

- feed
- wake
- sleep
- flexible routine review
- not losing the relationship between a feed, the awake period, and the next sleep

The official Childwise/Babywise presence identifies Babywise with the Feed-Wake-Sleep newborn strategy.
Source: [Childwise.Life](https://www.childwise.life/)

Babywise commentary and schedule examples commonly describe 2.5-4 hour feed intervals depending on age, and an eat/feed-wake-sleep routine.
Source: [Baby Sleep Site Babywise overview](https://www.babysleepsite.com/sleep-training/warning-babywise-may-not-be-right-for-your-baby/)
Source: [Babywise sample schedules](https://www.babywisemom.com/reader-sample-schedules-0-12-months/)

Design implication:

BabyFlow should visually center the current cycle and next likely caregiving decision, not a long stack of technical panels.

## What `monies_map` Does Better

The `monies_map` repo feels more polished because it has stronger interaction boundaries:

- buttons are classified by intent
- primary, secondary, subtle, danger, and dismiss actions have explicit semantics
- mutation feedback is local
- route-level loading does not blank the whole working surface
- route orchestration is documented
- page flows are separated into stable route panels
- visual density is restrained

Relevant local docs:

- `/Users/tim/22m/ai-projects/monies_map/docs/interaction-guidelines.md`
- `/Users/tim/22m/ai-projects/monies_map/docs/app-shell-flow.md`
- `/Users/tim/22m/ai-projects/monies_map/design.md`

BabyFlow should adopt these principles, not necessarily copy the visual palette.

## Current BabyFlow UX Problems

### 1. Today still feels like multiple systems stacked together

Even after moving Review out, Today still carries:

- current cycle summary
- live timeline
- correction history
- row details
- event stamps
- interventions
- state transitions
- feed session details
- quick dock

Problem:

The caregiver has to understand the product architecture to know where to act.

### 2. Too many labels explain the system

Labels like `Live timeline stream`, `State transitions`, `Feed session details`, and `Correction history` are technically accurate but not caregiver-natural.

Better pattern:

- "Now"
- "Today"
- "Feed"
- "Tried"
- "Notes"
- "Review"
- "History"

### 3. Actions are too evenly weighted

Many controls visually compete:

- view switcher
- profile / guide / review links
- row details button
- timeline item actions
- feed session actions
- intervention actions
- correction actions

The app needs an action hierarchy:

- one primary next action
- a few common quick actions
- everything else behind detail or review

### 4. Review and correction are still too close to logging

Correction history and deeper reasoning should not dominate the primary logging path.

Today should answer:

- what state are we in?
- what should I log next?
- when did the last feed/sleep/diaper happen?
- is a feed currently running?

Review should answer:

- what happened over 24h / 3d / 7d?
- which cycles need checking?
- what patterns are emerging?
- what corrections changed the record?

### 5. Feed UX is better but still not primary enough

Feed is one of the highest-frequency flows. It needs a dedicated active state:

- active feed timer
- left/right/bottle segment controls
- import duration
- close feed

This should appear as the main current task when a feed is active, not merely as one panel among many.

## Proposed Product Shape

### Today

Purpose:

Fast operational caregiving.

Contents:

1. Baby + current cycle status
2. Active task card
3. Last / next timing summary
4. Quick dock
5. Minimal timeline preview

Today should not show:

- state machine internals
- cycle grouping internals
- correction history by default
- long review panels
- technical panel labels

### Feed Active State

When a feed is active, Today should transform around it:

- large elapsed timer
- left / right / bottle / note controls
- close feed
- import duration
- optional "baby got drowsy" or "burp" controls

This should be the clearest thing on screen.

### Review

Purpose:

Understand patterns and clean up ambiguity.

Contents:

1. time range switcher
2. cycles needing checking
3. feed/wake/sleep summaries
4. caregiver attempts
5. corrections/history
6. state interpretation

Review can expose more complex language, but still should use caregiver-facing labels.

### Journal

Purpose:

Paper-compatible validation.

Journal should remain a view, but not the primary mobile default.

### Guide

Purpose:

Explain the app. It should not compensate for a confusing default UI.

If the user needs the guide to understand basic logging, Today is still too complex.

## Derived Tasks

### Phase 1: UX IA Reset

- Make Today a short operational screen.
- Move correction history out of default Today.
- Move state transitions out of default Today.
- Move event-log/raw stamps out of default Today.
- Show only a compact timeline preview unless the user expands.
- Keep Review as the home for deeper reasoning.

### Phase 2: Feed-First Active Task

- If feed active, replace the current cycle card with an active feed card.
- Show elapsed timer prominently.
- Show left/right/bottle/note as the only primary controls inside the card.
- Keep import duration visible but secondary.
- Keep close feed as primary once feed is active.

### Phase 3: Action Hierarchy

- Define BabyFlow button intent classes inspired by `monies_map`.
- Primary: next likely caregiving action.
- Secondary: alternative logging actions.
- Subtle: view, history, guide, profile.
- Danger: delete/correction destructive actions.
- Dismiss: close read-only sheets.
- Cancel: abandon draft edits.

### Phase 4: Language Simplification

Replace visible technical labels:

| Current | Proposed |
| --- | --- |
| Live timeline stream | Today log |
| Feed session details | Feed |
| Intervention attempts | Tried |
| State transitions | Baby state |
| Correction history | History |
| Timeline stamps | Stamps |
| Needs checking | Check this |
| Current cycle summary | Now |

### Phase 5: Visual Alignment With `monies_map`

- reduce nested cards
- reduce oversized pill buttons
- use restrained borders and 8-12px radii where possible
- make full-width sections feel intentional, not stretched
- use fewer gradients
- reduce letter spacing
- keep desktop as a proper centered work surface
- keep mobile full-width but not visually boxed in

### Phase 6: Runtime UX Tests

Add tests that prove:

- Today renders only the operational essentials by default.
- Active feed makes feed controls the dominant surface.
- Review contains the deeper interpretation surfaces.
- No user-facing technical terms leak into Today.
- Mobile quick logging can be completed without scrolling.
- Manual feed import works without leaving Today.

## Recommended Next Slice

Do not add another behavioral engine yet.

Next slice should be:

`UX Reset Slice A - Today Operational Redesign`

Definition of done:

- Today default view is short.
- Feed active state is primary.
- Raw details are behind one expansion.
- Review owns deeper interpretation.
- User-facing labels are caregiver-natural.
- Mobile logging can be completed without scrolling.
- Tests prove the default surface is no longer a long architecture stack.


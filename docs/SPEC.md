# Build spec — "A Present for Princess Fatima"

A brief for rebuilding this experience from scratch, in any stack, with new ideas added.
Everything under **Invariants** must survive. Everything under **Open** is yours to change.

Read [FLOW.md](FLOW.md) first for the screens and screenshots. This file says what is load-bearing.

---

## The idea

A single-page gift for one person. It opens itself one phase at a time, each phase a small toy she
plays with, each toy unlocking the next. No menu, no navigation, no scrolling to a next section.
She never chooses where to go. The page decides, and she earns it.

Tone is warm and handmade, not corporate. Lowercase copy, gold and rose on deep purple, script
faces for headings. Bilingual, English and Arabic together, both first-class.

---

## Invariants

### 1. Phase order

```
present → wish → reasons → crown → memories
```

Five live phases, in that order. Advance only. No back button, no skip, no progress bar,
no restart. Reload is the only way to replay.

### 2. What advances each phase

| Phase | Unlocks when |
|---|---|
| present | the gift is clicked, and only after it has stopped fleeing |
| wish | every candle is out |
| reasons | every card is face up |
| crown | the crown is dropped on the head |
| memories | nothing, this is the end |

The pattern underneath: **the phase advances itself when the toy is finished.** Never a "next"
button. Any new phase must obey this.

### 3. The fleeing gift

The opening toy is a chase you cannot win by skill. The gift dodges every hover, tap and click for
**5 seconds**, then walks back to the center and becomes clickable. The timer is wall clock, not a
dodge count, so doing nothing still unlocks it. Whoever plays it should feel teased, then given.

### 4. The timings

These make the pacing. Keep them within about 20% or the piece feels rushed or dead.

| Moment | Delay |
|---|---|
| gift becomes catchable | 5000ms after load |
| gift click to wish appearing | 750ms |
| last candle out to reasons | 3000ms |
| last card flipped to crown | 1500ms |
| crown snaps to memories | 2900ms |
| any phase fade out to next phase in | 600ms |

Every handoff pauses on the completed state before moving. The reward is looked at, not skipped past.

### 5. The phase contract

One phase is one section, hidden by default, owned by one module. A phase reveals the next by
un-hiding it. A phase knows about nothing except its own successor. This is what makes a phase
insertable or removable in one line, and it must stay that way.

### 6. Content is data

Reason cards, photos and captions, candles are **lists**, not markup written out by hand. Adding a
reason means adding a list entry. Any new phase built on repeated items follows the same rule.
This is the whole reason the piece is extensible.

Current counts, all free to change: 5 candles, 7 reason cards, 8 photos.

### 7. Feedback on every completion

Every finished toy fires something physical before it hands off. Confetti when the gift opens and
when the wish is granted, sparkles when the crown fits. A phase that ends quietly is a bug.

### 8. Touch and keyboard

Every toy works with a finger and with a keyboard. Drag targets use pointer events, not mouse
events. Interactive cards are focusable and answer Enter and Space. Nothing requires a hover.

### 9. Bilingual by default

English and Arabic sit together, Arabic with proper right-to-left direction. Arabic is not a
translation afterthought, it carries its own messages.

---

## Open

Change any of this freely.

- **Stack.** Plain HTML with ES modules today. React, Svelte, anything. Nothing in the invariants needs a framework.
- **Look.** Palette, fonts, layout, illustration style, animation style.
- **The toys themselves.** The cake, the flip cards and the crown drag are examples of the pattern, not the pattern. Swap any of them for a different small game, as long as it finishes itself.
- **More phases.** Insert anywhere in the order. The contract above is what makes this cheap.
- **Sound and music.** There is none today. It would fit.
- **Persistence.** No state is saved, replay always starts clean. Remembering progress is a fair addition.
- **Delivery.** Static files over HTTP today, because sections are fetched at runtime. Any hosting works.

---

## Ideas worth adding

Not required. Listed because they extend the piece without fighting it.

- A **letter phase** with a runaway "yes" button that taunts you until you click "no", which unlocks it. Already built in this repo and disabled, see [FLOW.md](FLOW.md).
- A **video phase** that plays a clip and advances when it ends. Also already built and disabled.
- A **name reveal** or a personal question as the opening beat, before the gift.
- **Audio**: a soft loop, a chime per candle, a fanfare on the crown.
- **Her own voice or handwriting** somewhere, as an image or a recording.
- A **shareable final card** she can save from the memories screen.
- **More Arabic**, one Arabic-first phase rather than Arabic as a second column.

---

## Known issues to fix in the rebuild

- The memories phase checks for exactly 6 photo cards while 8 ship, so its init bails out on every load. Do not hardcode a count.
- The crown snap sits high and overlaps the heading. Position it from the drop zone, and leave the offset tunable instead of a magic number.
- The 5 second gift wait is long on a replay. Consider shortening it after the first play.

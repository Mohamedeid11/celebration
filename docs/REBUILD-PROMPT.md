# Build prompt — Marwa's birthday page

Paste everything below the line into a fresh session, together with `docs/FLOW.md`,
`docs/SPEC.md` and the `docs/screens/` folder.

---

## What you are building

A single-page birthday gift for one person, named **Marwa**. It opens itself one phase at a
time. Each phase is a small toy she plays with, and finishing a toy unlocks the next one. There is
no menu, no navigation and no scrolling to a next section. She never chooses where to go. The page
decides, and she earns it.

Two documents describe the piece that already exists and that you are rebuilding:

- `docs/FLOW.md` — every screen, what advances it, and screenshots of each state.
- `docs/SPEC.md` — the nine invariants that must survive, and what is free to change.

Read both before writing code. Follow every invariant in `SPEC.md` unless this prompt overrides it.
Where the two disagree, **this prompt wins**.

---

## The single biggest change: it is a birthday, not a graduation

The existing version celebrates an academic success. That framing is gone. Every heading, card,
caption, letter and label is now about a **birthday**. Nothing may congratulate her on passing,
graduating, succeeding or working hard for a result.

Concretely:

- No "congratulations on your success", no graduation wording in either language, no graduation imagery.
- The reason cards currently say things like "you work hard for every dream you carry". Replace
  every one of them with birthday and love phrasing.
- The crown phase currently reads as a reward for achievement. It is now simply that she is the
  one being celebrated today.
- If any string anywhere still implies an accomplishment, rewrite it.

## The second change: the name

The existing version is written for **Fatima**. She does not appear in this project at all.

- Every occurrence of her name, in English or Arabic, including the nickname form, is deleted
  rather than renamed in place. Re-read each line and rewrite it for Marwa so it does not read
  like a search and replace.
- The page title, the folder naming, code comments, console log prefixes and image captions all
  change. Do not leave the old name in a comment or a log tag.
- Her name is **Marwa**, in Arabic **مروة**.

---

## Voice and language

**Arabic leads, English supports.** Every screen carries both. Arabic is the primary line, set
first and larger, with correct `dir="rtl"` and a font that renders Arabic well. English sits
underneath as the second line, smaller and quieter. Arabic is not a translation afterthought and
must read naturally to a native speaker, not like machine output.

**Tone.** She is the love of my life. Write warm, sincere, personal, a little poetic. Direct
address, "you", not "she".

**Hard constraint on the copy.** Never mention marriage, a wife, a spouse, a wedding, an
engagement or any equivalent, in either language. Not once, anywhere, including alt text and
captions. Write the love without naming a relationship status.

Keep the existing lowercase, handmade feel in English. Gold and rose on deep purple, script faces
for headings, ambient floating sparkles.

---

## The flow

```
present + gift  ──click──▶  make a wish  ──candles out──▶  reasons  ──all flipped──▶  crown  ──fitted──▶  memory motion
                                                                                                              (end)
```

Five phases. The static polaroid gallery that used to end the piece is **removed** and replaced by
the new memory motion phase described below, which is now the final screen.

Keep the phase contract from `SPEC.md`: one phase is one section, hidden by default, owned by one
module, and it reveals its successor itself when its toy is finished. Never a "next" button.

Keep the timings from `SPEC.md`. They are what makes the pacing work.

### Phase 1 — present and the fleeing gift

Unchanged in behaviour. The gift dodges every hover, tap and click for 5 seconds, then returns to
the centre and becomes clickable. Copy becomes birthday copy: Arabic first asking if she is ready
for her present, English underneath.

### Phase 2 — make a wish

Unchanged in behaviour. Five candles, hold to blow and the microphone option, confetti when the
last one goes out.

**No age and no number anywhere.** The candle count stays fixed at five and is decorative. Do not
put a numeral on the cake or in the heading.

### Phase 3 — reasons

Same flip card toy. **All card text is replaced.** Every card is now a birthday or love message,
Arabic first and English second on the revealed face. Nothing about achievement, study, work or
success. Write seven or more, and keep them as a data list so more can be added without touching
markup.

### Phase 4 — crown

Same drag to fit toy, with two fixes described in their own section below.

### Phase 5 — memory motion, new and final

Described in its own section below. Replaces the polaroid gallery entirely.

### Dormant phases

The old version also shipped a letter phase and a video phase that were loaded but never shown.

- **Letter phase**: rebuild it and enable it if you want a reading beat, but only with birthday
  copy. Its runaway "yes" button and its taunting speech bubbles are a good toy and worth keeping.
  If you enable it, place it between the gift and the wish.
- **Video phase**: leave it out. The only clip that exists is a graduation congratulation and does
  not belong here. Build the phase only if a birthday clip is supplied later.

---

## The memory motion phase, in detail

This is the emotional ending and the most important new work.

**What it does.** Photos of her float across the screen in slow, continuous motion. They do not sit
in a grid. Each photo travels its own path, and the paths differ from each other: some trace a
circle, some trace a rounded square, some drift on a long diagonal or a figure eight. Motion is
**slow**, unhurried and looping, closer to floating than to sliding. Photos gently overlap, scale a
little as they move, and carry a soft shadow so they read as physical prints drifting in space.

**The messages.** Between and behind the drifting photos, short messages fade in and out, one at a
time, on a slow cadence. They say how good life is with her in it. Arabic first, English second,
same as everywhere else. Each message holds long enough to be read without hurrying, fades out,
and the next one arrives. The message list loops, so the screen never goes dead.

Write at least ten messages. Keep them as a data list. Examples of the register, not the final copy:

- الحياة أحلى وأنتِ فيها — life is sweeter because you are in it
- كل يوم معكِ هدية — every day with you is a gift
- وجودك في حياتي أجمل ما حدث لي — you being in my life is the best thing that ever happened to me

Never mention marriage or a wife in any of them.

**Rules for this phase.**

- Photos and messages are two data lists. Adding a photo or a line is adding an entry, never new markup.
- It is the final screen and it never ends. It loops quietly for as long as she leaves it open.
- Respect `prefers-reduced-motion`: when it is set, drop the drifting paths to a slow cross fade
  between photos and keep the messages.
- It must work on a phone. Fewer photos in flight at once on a small screen, and nothing may
  overflow the viewport horizontally.
- Use CSS animations or transforms rather than a per frame JavaScript loop where you can, so it
  stays smooth on a phone and does not drain the battery.

---

## The crown phase, and the two fixes

### a) The snap is broken

Today the crown does not land on her head. It settles above the photo and overlaps the heading.

The cause is in two places. The drop zone is positioned at the very top edge of the photo frame,
`top: 0` with a height of 11%, so it does not sit on the cap. Then the snap maths offsets the crown
by a hardcoded `0.72` of the crown's own height, chosen to compensate for that placement.

Fix it properly rather than nudging the number:

1. Place the drop zone over **where the head actually is** in the new photo.
2. Keep the crown's resting offset in one named constant or CSS variable, clearly commented, so it
   can be tuned without hunting through the maths.
3. Check it visually at desktop and phone widths. The crown band must rest on the cap, and it must
   not overlap the heading above it.

Keep the three ways the snap can fire: a drag that lands near the zone, a plain click, and Enter or
Space while the crown is focused. All three must place it identically.

### b) The photo is being replaced

The new source photo is `images/person.jpeg`, which I will provide. Prepare it the same way the old
one was prepared, then wire it in:

1. **Remove the background** so only she remains, on transparency.
2. **Crop to head and shoulders**, with the top of her head close to the top edge of the frame.
3. **Export as PNG with an alpha channel**, replacing `images/person-nobg.png`.
4. The old CSS hardcodes the frame as `aspect-ratio: 651 / 722`, matching the old export. **Update
   it to the new image's real dimensions**, or the photo will be letterboxed or stretched.
5. Re-place the drop zone on the new head position, per fix (a).

If you cannot remove the background with the tools available, say so and tell me exactly what you
need, rather than shipping the photo with its background still on.

---

## Assets

I am providing all media. Do not generate placeholder images or invent stock photos.

- `images/person.jpeg` — the source photo for the crown phase.
- The memory photos for the final phase. Tell me how many you want and I will supply them.
- Any audio, if you propose adding it. There is none today.

If an asset is missing, stop and ask me for it. Do not substitute.

---

## Technical baseline

Keep the current stack: plain HTML, CSS and ES modules, no build step and no dependencies. It must
be served over HTTP because sections are fetched at runtime, so opening the file directly from disk
must show a clear error rather than a blank page.

Every toy works with a finger and with a keyboard. Drag targets use pointer events, not mouse
events. Interactive cards are focusable and respond to Enter and Space. Nothing requires a hover.
Every completed toy fires something physical, confetti or sparkles, before it hands off.

Do not hardcode collection counts. The old code required exactly six photo cards while eight
shipped, so that phase silently bailed out on every load. Derive counts from the data.

---

## Definition of done

Serve it, open it in a browser and walk the whole flow yourself before telling me it works:

- The gift flees, then becomes catchable, then opens.
- The candles all blow out and the wish is granted.
- Every reason card flips and the phase advances on the last one.
- The crown lands **on her head**, not above it, at desktop and phone widths.
- The memory motion phase runs, the photos follow different paths, and the messages cycle.
- The browser console is clean. No errors and no warnings.
- Search the whole project for the old name in both languages, and for success, graduation,
  congratulation and marriage wording in both languages. Every hit is gone.

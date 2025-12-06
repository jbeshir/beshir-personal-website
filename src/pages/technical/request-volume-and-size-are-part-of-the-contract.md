---
layout: ../../layouts/technical.astro
title: "Request volume and size are part of the contract"
description: "A rant about architecture pitches treating request volume as something to optimise later"
date: "2025-12-06"
categories:
  - "architecture"
  - "api"
---

Something I've come to appreciate a bunch reviewing architecture proposals is that the volume and per-item size of data expected to move through an API is an implicit part of the API contract, and a lot of proposals I see don't capture it very explicitly or consistently.

(I'm sure Big Tech architectural proposals don't have this problem because at huge scale it becomes more obvious, but I am not at Big Tech)

Instead of treating it as part of the contract, it is rounded off to "scalability". You'd like as much of that as possible, but for iteration speed you'll just take whatever's convenient now. Optimisation can come later.

I think this underrates the value of being explicit about how you expect your API to be used. If you know items are low volume per user/client you can add features or use approaches that would be expensive to scale, exploiting that you know you don't need to. If you know they're going to be huge volume then you can avoid overinvesting in designs that won't work down the line (and maybe go with something really simple for now).

Large vs small items heavily changes what kinds of database or messaging architecture works efficiently, at all user counts. Don't leave what's driving these choices implicit!

Event sourcing sounds fun- what's the expected volume of events? Is that volume something your primary database will particularly like querying over on the fly? Are indexes enough to fix this or do you need to be keeping them in a different kind of database entirely? How does the proposal look after you introduce the extra complexity to fix this, and what does all this do to costs?

A lot of fun articles about architectural strategies online brush all this stuff under the rug in favour of describing a conceptually cool architecture (which runs slower in production than a naively written service would on a single $10 VPS) and assuming you will figure out how to fix the performance and cost issues later.

It seems like an obvious thing to come to mind when you start deliberately looking at building a checklist to check for spikes/architecture proposals, but where that kind of formality doesn't exist I see it missed all the time.
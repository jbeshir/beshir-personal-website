---
layout: ../../layouts/technical.astro
title: "Inoculation against architecture fads"
description: "Keeping your head when everyone is telling you that you need to be in on the next big thing"
date: "2025-12-11"
categories:
  - "architecture"
---

Sometimes I think I'm lucky to have started programming around what felt like the peak of OOP hype in the 2000s.

Everything had to use inheritance! You should model everything as an object and all these object types form a tree. This tree is your DSL and all code should belong to a noun. The more abstract base types in the tree the more people are able to write code that is decoupled and works on generalities. And the more code works on generalities, the more code can be reused and extended, and the less likely you are to actually need to change your system in response to changing requirements. And avoiding change is key!

More hyped rules- Everything should have a single responsibility! The singler the better! You should have tiny classes- no, tinier- which have as little code in as possible. Split your clients into layers each of which does one part of request-sending or response-parsing processes.

Don't repeat yourself! If two things are doing the same job, then factor the code out. Two clients both passing the same couple of headers to their respective APIs? Needs to live in a single place. You can use a separate helper type if you must but if you're modelling things *well* you'd use a trait, or multiple inheritance, get it captured in your type model.

There were always plenty of nuanced versions of these ideas if you looked. Often the originals were nuanced. "favour 'object composition' over 'class inheritance'" said the Gang of Four. But the hype mostly discarded nuance. And if all the people talking about these great principles aren't including the nuance, then maybe you won't go look for it.

The result was a lot of very clever new developers, hearing the wisdom of the time, applying themselves to figuring out how to make the most complicated and unmaintainable messes. To maximise how modeled, how decoupled, how single responsibility, how perfectly clean of repetition their code was, but not how well it did the job or could be iterated. There was a glut of examples of incredible overengineering to serve as great object lessons in what not to do. Most of which could have been avoided by understanding the ideas behind the hype in more detail.

Eventually, the discourse sobered up around these things and rediscovered their nuances. Everyone has their own favourites to highlight, but some of mine:
- Coupling is expensive, but [cohesive coupling within a component is much cheaper than coupling between components](https://frontendatscale.com/issues/27/), and 'decoupling' logic into smaller components can add more coupling between components.
- Making everything very complex in an attempt to avoid change makes change more expensive. You will probably not successfully avoid change. Build simple and [embrace change](https://thetshaped.dev/p/embrace-software-entropy-imperfect-code-flexibility-maintainability) instead.
- Prefer explicit over implicit dependencies.
- [Incidental duplication](https://anthonysciamanna.com/2018/07/28/the-dry-principle-and-incidental-duplication.html), and that [it is better to have some duplication than a bad abstraction](https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction).
- [A little copying is better than a little dependency](https://go-proverbs.github.io/)
- Actually the discourse has remembered that line about object composition being good now.

But there was a more general lesson I took from that era, and that was inoculation against hype in software architecture. Before you start applying any architectural principle or strategy, instead of trying to maximise how clean your results are from this new perspective, pay attention to the original goal of making things faster to iterate at the level of quality you need. Check whether you actually predict the things you are doing will achieve that goal, given the theory of change of the principle. You can outperform a lot of people just by going "hold on, this isn't actually going to help me ship", applying a principle no further once it no longer makes sense, and avoiding wild overengineering.

From there you can go from noticing that you don't expect a principle or a strategy to help you right now, to figuring out why. Are you applying it wrong? Was the version you heard simplified incorrectly? Was the principle a great heuristic for someone developing software of a wildly different type and context than yours? Are you applying what would be a perfectly good approach for managing interactions between your whole infra and an external client, to interactions between each pair of your microservices? Was it just never a good idea at all? And in the meantime, you don't make any messes.

Having lived through those hype cycles has meant that this is the frame I approach a lot of current hyped up things with. Microservices? Feature flagging? Event sourcing? HATEOAS? AI? For all those things I ask, concretely, whether my plan for using it is helping me iterate the product faster at the required level of quality. If not, first notice that, and stop. And then start asking what I misunderstood, what critical nuance disappeared on the path to me, whether I'm in a wildly different context to the person who came up with the idea. Testing novel architectural approaches is something that quick experiments or R&D days are great for.

And I try not to be afraid to just sit out the hype cycle for a bit until either I figure out how to do it right, or all the posts about how the idea is overrated start.
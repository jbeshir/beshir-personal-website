---
layout: ../../layouts/blog.astro
title: "Takes on local AI pipelines - Introducing Demesne"
description: "Announcing my take on heterogeneous local containerised agent orchestration"
date: "2026-07-12"
domain: "technology"
categories:
  - "ai"
  - "containers"
  - "golang"
---

Like seemingly everyone else in software, I’ve been working pretty frantically over the last few months to work out how software engineering looks post-AI, and to make sure that whatever it is that engineering looks like in 2027, I’m in.

And like seemingly half of everyone else, this means I’ve built my own personal AI tooling with a particular set of takes on how it should work that I’m convinced is great.

So now I’m going to talk about that. This post is about [demesne](https://github.com/jbeshir/demesne), what it solves, the takes it makes, and reflecting on how things seem to work today. You’ve been warned.

# Problems

I am informed that when you build something it is advised to have some kind of “problem” it is solving.

I think this is incorrect, but in any case working with AI agents is not short on problems.

## Tackling bigger tasks

I sort of think of the size and scope of roles for an AI agent as on a track something like:

1. **Chat Bot**: You just talk to ChatGPT or Claude in a conversation, not connected to anything else. You can kind of get it to help with code sometimes by asking it specific questions about libraries, or pasting in snippets to ask about, or asking it to write them. But it can’t do very much. This is how most people first interacted with AI. I’ll be honest, using this as a primary interface while coding is very 2024.
2. **Repository Editor**: Now you’re running Claude Code, or Codex, or Cursor, or something else, on the repository you’re working on. It can see and edit meaningful amounts of code, and has the rest of the repository as context when it does. It can do initial drafts of a change, given detailed specifications about what that feature should look like. But you have to give it that spec. If it’s to integrate with any code outside the current project, you need to tell it exactly how to do so. This is a huge step up, but you have to spend a lot of time passing information to the agent.
3. **Connected Agent**: As repository editor, but the agent also has connections. It doesn’t need you to give it detailed API specs, because it can go look them up. It can see other repositories to integrate against. In a workplace it can see your issue tracker; at home it can see your notes app. Beyond literal network connections, other work at this level includes giving the agent a test harness, and skills that embed standing rules. In the ideal version of this, instead of a detailed spec, you can give it a one sentence instruction and the environment gives it everything else it needs to write that initial draft.
4. **Agent Orchestrator**: Building things too big to fit into a single agent’s context window or attention span, by splitting them over many agents, and building them better by reviewing them from multiple lenses separately. In this setup you say you want a feature and you get a planning step, phased implementation, quality gates, “subjective” review and fix cycles, etc. You give instructions to check metrics, spot latency hotspots, write benchmarks, and propose optimisations, and you get a multiphase process with separate agents investigating different areas. You’re getting things done fast! Are they good things or bad things? Unimportant.

The second of these comes for free as soon as I install Claude Code. The third is pretty easy, just add MCP servers and skills (and try not to go too crazy on the skills).

But I found getting the fourth going well requires some real work. Dynamic workflows in Claude Code and similar are getting there, but you quickly run into the next problem...

## Infinite approval requests

YOLOing with `--dangerously-skip-permissions` is, don’t get me wrong, very funny. But it would be embarrassing if an agent sent my Discord session token to a spammer, or worse, tried to post there themselves.

Auto mode is only a bit better- if you can prompt inject the agent into sending all my credentials to the Internet, then can I expect that you won’t also be able to trick auto mode? The agents are pretty good at ‘helpfully’ working around the limitations in tools they’re allowed to run.

So really I want to grant permissions to do definitely safe things (usually read only things, or writes to safe drafting locations), and approve unsafe things each time.

Unfortunately this means that the agents work for a couple of minutes then stop for approval, then do it again, and again, by default. With full attention I can juggle 2-3 agents at most. Any unsandboxed subagents just make the problem worse, and my dream of sipping my drink and reading fanfic while the agents do my project for me is rudely interrupted.

## Code quality is a bit... bad

Agent code quality has come a long way since September 2025, and once I was at the Connected Agent stage I had a lot of tools for telling it what I liked and what I didn’t.

But it still isn’t great. And it can tell it isn’t great, if I ask it to look. It’s not great at reviewing while writing, but if I run a bunch of extra steps to prompt it to think about making the code good in various ways, it can see the problems and say how to fix them. Mostly. Often enough I can nudge it less frequently and still get good results.

So I want to be the worst kind of bureaucrat and force a long code review process with a range of rubrics before I even look at it.

# Demesne

[Demesne](https://github.com/jbeshir/demesne) is my personal attempt to answer these problems. Maybe some of it will be interesting.

The basic architecture I settled on was:

- You connect it to a normal Claude Code/Codex/whatever agent as a local MCP server. Anything that can see your local filesystem and speaks stdio MCP should work.
- The main entrypoint is the `sandbox_agent` tool, which takes a prompt and read-only host mount paths, and runs a full dangerously-skip-permissions configured Claude Code/Codex in a local Docker container with egress controls, a mutable workspace, and an (initially) empty output directory where it can’t do much harm.
- The container can use a whitelist of host MCP tools via a proxy, allowing it to have read-only access to useful information.
- Demesne exposes itself to the containerised agent as one of these tools; it provides a version of the `sandbox_agent` tool that launches subagents in the same workspace, with the ability to launch subagents of their own.
- All pipeline structure is provided by skills on the host agent. The host agent writes a prompt for the top-level containerised agent instructing it in how to behave as an orchestrator and what subagents to launch under what circumstances with what instructions.

Under the hood it uses OpenSandbox on top of Docker (or Podman. I actually use rootless Podman) to host the containers.

There’s also a bunch of other tools (launching non-agent containers with Go/TypeScript/Python envs for tests and analysis, open web research with no mounted in data, host-only tools for polling status, etc) but that’s the key shape of it. Full documentation on architecture, features, and tools is in the [GitHub repository](https://github.com/jbeshir/demesne).

Structurally pretty simple! This approach involves a whole bunch of takes:

**Let agents be agents**: Nothing programmatically enforces workflow structure. If something goes wrong, the agent can change plan mid-pipeline. Any subagent can decide it wants to launch more subagents. I make the bet that already, and more over time, letting the agents use their intelligence rather than binding them tightly will result in on average better behaviour. This is a lot easier to make when the sandboxes are running locally and off agent subscriptions, and the worst resource exhaustion can do is eat all my RAM and use up my five hour quota, instead of running on someone else’s cloud somewhere.[^1]

**Agents are not characters**: There’s a lot of work out there from [Gas Town](https://github.com/gastownhall/gastown) to [CrewAI](https://github.com/crewaiinc/crewai) in which agents are given specific personas, with handcrafted prompts and identities, and you talk to them by title. One could in principle add this to demesne, maybe add a persona parameter to the sandbox_agent tool and load in the right prompt for that persona, and maybe I will eventually. But for now agents are given a task, not a roleplaying background, that task is written just for them by their parent agent, and as a result demesne is not limited to pipelines which decompose into a predefined set of characters. We can keep the improv to Claude Desktop for now.

**Agents are heterogeneous**: Any host agent can launch any provider’s agent. Any provider’s agent can launch any other provider as a subagent. The container interface is plenty clunky at times, but it does mean no compatibility concerns mixing providers.

**Providers should be commodities**: Or it’s good for me for them to be, anyway. In practice I mostly run Claude in my containers. Codex agents are supported but not often used, aside from when providing model diversity for code review. But I was prepared, ready, and about to switch over to Codex after Anthropic announced their (later cancelled) billing changes making headless Claude expensive. Architecturally new providers slot right in. Providers are incentivised to give you orchestration primitives that only they implement, get you locked in, and move to charge you through the nose. Can’t really blame them, building new features is about the nicest possible way to moat-build. But owning my own orchestration, I can swap to whoever is best for the price this month. I don’t use self-hosted models or Chinese models yet, but I can when I want without falling down to the bottom level of agents again. Your sandboxes are your demesne[^2], under your control.

**Close the loop**: This one is not controversial, but takes a bunch of extra work elided in the simple story. There’s a lot of mess around egress and proxies to make various package managers go. There’s an in-container tool for launching non-agent script-running sandboxes for various programming language ecosystems. It has a Playwright container and any pipeline doing web work uses it for visual tests. The more deterministic and subjective testing the pipeline can do before the host lands the result, the better that result. The main cost is that I need to spend more time chatting on Discord while it reviews all the screenshots.

**The appropriate amount of paranoia is less than maximum and more than YOLO**: A lot of prior work out there solves the approvals problem by just letting agents do whatever they want. Maybe in 2027 that’ll be a good idea, but I don’t want to do it today. The risk of the agent pushing all my local tokens and credentials to someone on the Internet needs at least some mitigation when we’re deploying to my real servers, GitHub, and Cloudflare. On the other hand, if I was maximally paranoid, I’d take the sandbox_research tool away from sandboxed agents, but then I need to know what I want.

[^1]: Technically it’s pretty easy to make the bet either way but the consequences are more, shall we say, potentially blogworthy, if you let agents spawn whatever they like in a pay as you go environment.

[^2]: See there was a rationale behind the name.

# Does It Work?

Seems to so far! After using the earlier versions of it to build itself, I’ve been using it for my subsequent projects.

Letting agents be agents mostly seems to work great, in particular. The blast radius is limited if anything goes wrong, but in practice agents behave very well, rarely launch agents not in the original plan, and do so for a good reason when they do. When silly things happen it’s always the consequences of my own actions, and no pipeline yet has succeeded in insulating me from those.

I’ve set up a widgets repository which autodeploys new subdirectories to their own domain on Cloudflare (maybe more on this later?) and a build-widgets skill, and it routinely gets something reasonable and tested on the first pass, and does well with requests to add features. In-pipeline Playwright and iteration seems to solve all the easily visible problems, though I have had to adjust the review skills to fix the z-index issues that otherwise serve as a calling card of AI frontend development.

I’ve built a browser extension with it, having it set up a testing harness for easier validation, and it got a nice little utility for my friends, and it did it in the background during a busy week while I was busy doing other things; practicing Japanese, housework, getting too into bad music.

I don’t think I’ve fully cracked “work for an arbitrary length of time unsupervised without slopping up the codebase” or “make an idea and build a thing unsupervised and have it be actually a good idea”, and I’m not sure anyone else has yet, so I’m still needed for now.

But it gets a little better each week as I write more skills, add more whitelisted MCP tools, and add the odd new capabilities to try pipelines on different sorts of tasks.

# Is It Useful For Anyone Else?

You can use it directly yourself if you want to, [here](https://github.com/jbeshir/demesne). You should probably run it from a git clone rather than just the binary; I expect it’ll take some work to get everything set up for it, and you’ll want to ask it to add your favourite languages to its own egress support, and make tweaks to add script sandboxes for your favourite languages, and adjust all the example skills to your taste. I clearly labeled them as examples because I didn’t want to put in the work needed to make them good.

Demesne is also an open source project! Right now I’m the only user, but if anyone else likes the ideas enough to want to build on it, then I am enthusiastic about humans doing my work for me too and PRs are welcome.

But I expect that for most, the way it’s most useful is as a story you can compare your own to. What takes do you share, which do you not, are there any ideas you can borrow for your own work puzzling out how to have your own special blorbo toolkit that is, clearly, the best thing ever.

---
layout: ../../layouts/technical.astro
title: "Transformer Lens: Building a transformer from scratch for interpretability"
description: "A first experience with PyTorch and building a transformer for interpretability"
date: "2023-10-08"
categories:
  - "python"
  - "pytorch"
  - "transformer_lens"
  - "ml"
---

One of the most interesting areas I learned about during [BlueDot Impact's AI safety course](https://course.aisafetyfundamentals.com/alignment) was mechanistic interpretability.

Previously I'd modelled neural networks as black boxes, in which we could observe the network's loss but the algorithm implemented by the network couldn't be practically decomposed into simpler parts. Turns out this isn't entirely true. We have a range of techniques, such as [probes](https://arxiv.org/abs/1610.01644) and [feature visualisation](https://distill.pub/2017/feature-visualization/) to examine what the weights are doing, and a growing field of models such as [superposition](https://transformer-circuits.pub/2022/toy_model/index.html) and [circuits](https://distill.pub/2020/circuits/zoom-in/) for what we find. There are [many open questions](https://www.alignmentforum.org/posts/LbrPTJ4fmABEdEnLf/200-concrete-open-problems-in-mechanistic-interpretability) in interpretability that can be explored on toy models by anyone interested, without needing the kind of compute associated with training the truly large LLMs.

Before tackling any of these, though, I needed a level of comfort with the internals of a transformer and PyTorch. There's a [good tutorial for building one from scratch](https://arena-ch1-transformers.streamlit.app/[1.1]_Transformer_from_Scratch) that aims to prepare you for interpretability research using the Transformer Lens library. I built a simple convolutional neural network in Tensorflow two years ago, how hard could it be?

My overall takeaway is that it was very useful. I would recommend you be comfy with Python dependency management first, and do a preliminary PyTorch tutorial if you don't have existing experience with it, but the barriers to entry here are low for any software engineer, and any you run into can be solved by a little time with a search engine.

### General Python Things

I've not worked in Python very much in the past, so one area I ran into unexpected difficulty was with getting my project and dependencies setup.

Most of these issues could be avoided by cloning the [recommended](https://arena-ch1-transformers.streamlit.app/#option-1-vscode) environment for the tutorial [from GitHub](https://github.com/callummcdougall/ARENA_2.0), and doing your work inside it.

I wanted to avoid doing this, and instead start from an empty project and pull in the libraries I needed as I needed them, to properly understand environment setup and be positioned to create new environments. This made my life a little more difficult, experimenting with [Conda](https://docs.conda.io/en/latest/) and [Poetry](https://python-poetry.org/) to arrive at a working setup using Poetry to manage most dependencies and Conda for the outer environment.

I think in future I'd dig into good project and dependency management advice separately ahead of trying to jump right in with a (mostly) new language and framework.

### Part 1: Inputs & Outputs of a Transformer

During this section we mostly experiment with splitting input text into a series of tokens, each representing one or more characters from the input.

There's a lot of interesting things you'll find here if you're unfamiliar with how transformers typically tokenise inputs, e.g. with case and whitespace sensitivity, and each token representing a varying number of characters.

The tutorial has you pull in an existing tokenizer rather than build your own, so I want to be sure I fully understand what it's doing. I found it helpful for validating that I'd got the dependencies working right; this is also where I needed to pull in the tokeniser as a "not from scratch" component to reuse.

### Part 2: Clean Transformer Implementation

This is the meat of the tutorial and where I spent most of my time. Implement a set of layer classes, each with a `forward` method that implements the layer. The diagrams in this section are key. The attention layer and MLP layer diagrams are particularly helpful for their definitions of the input and output tensors for each block.

I ran into some barriers here with lacking experience with PyTorch in particular and some of the involved math in general. The PyTorch documentation was excellent for explaining things like their [Einstein summation convention-based notation](https://pytorch.org/docs/stable/generated/torch.einsum.html#torch.einsum), and I spent a while getting an intuition for that before coming back to the tutorial.

The tests, running layers and printing output, found most of the mistakes in my implementation, which I was able to correct by spending a little while with the PyTorch docs. I prefer to develop with "true" unit tests, setup for automated execution by a testing framework,  but the tutorial favoured manual tests, and I didn't get around to digging into an idiomatic approach for setting up these.

# Part 3: Training A Transformer

Training was relatively straightforward- I looked at an [example of a simple PyTorch training loop](https://pytorch.org/tutorials/beginner/introyt/trainingyt.html) from the PyTorch docs, and coupled with the information in the tutorial ran into no real issues implementing the training steps.

After a couple of rounds of debugging to e.g. notice I'd forgotten to zero my gradients, I was able to see the loss happily reducing over time as it ran on my GPU.

I then did a pass over the implementation to tidy it up so I could import it more easily later. I’m not sure if I’m being picky about this because I’m more familiar with idioms in other language ecosystems.
### Results

The final results are in a [GitHub repo](https://github.com/jbeshir/transformer-from-scratch). I don't expect this to be particularly idiomatic Python code, as I've still not spent much time with the language.

It was an interesting experience, and while bumpy, actually pretty accessible for getting to a place where I can [start working with the transformer lens library](https://arena-ch1-transformers.streamlit.app/[1.2]_Intro_to_Mech_Interp), and modelling how it's behaving on the inside.
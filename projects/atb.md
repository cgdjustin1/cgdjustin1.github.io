---
layout: project
title: "ATB — Systematic Strategy Research"
description: "What running a six-person research team taught me: sizing is a dial, and the acceptance test comes before the experiment."
tag: atb
permalink: /projects/atb/
links:
  - label: "GitHub"
    url: "https://github.com/cgdjustin1"
---

I started ATB in my second year at Warwick — first alone, then as a six-person research team I recruited and still lead.

<div class="stat-row">
  <div><span class="n">2023</span><span class="l">Running since</span></div>
  <div><span class="n">6</span><span class="l">Researchers</span></div>
  <div><span class="n">10</span><span class="l">Strategies live</span></div>
</div>

The premise was simple and slightly naive: I wanted stable passive income, and systematic trading is the most direct form of it if you can find something that actually works.

Three years in, I hold a more precise version of that belief. **The strategy matters less than the machinery you use to decide whether a strategy is real.**

## The machinery

I built the backtesting framework and, more importantly, the overfitting-validation layer around it. That layer is the part I'd defend:

- **Walk-forward optimization** — parameters chosen on data the test never sees.
- **Combinatorial purged cross-validation** — because naive CV on time series leaks, and leaks flatter you.
- **Monte Carlo simulation** — to separate skill from the particular ordering of history.

Strategies are composed in YAML from six factor types: entry, exit, risk, sizing, stops, and timing. Factors get developed and tested independently, then recombined without touching code.

That was the difference between testing a handful of ideas a month and testing a hundred.

## Sizing is a dial, not an achievement

Position sizing is set to a **target drawdown**, not to a return goal. Give the same strategy book a bigger risk budget and its headline return climbs, but its drawdown climbs right along with it. Run one book at a conservative tier and at a levered tier, and the two look like entirely different strategies.

The number you quote says more about your risk appetite than about the research. Which is the point — **compare books on Sharpe and Calmar, never on headline return.**

## What I actually learned

Most of the value wasn't in the strategies. It was in learning to kill my own ideas quickly, on criteria written down before the experiment ran.

The discipline we settled on: **pre-register the acceptance criteria, archive every variant that fails, and never let a promising-looking result skip the gate because it looks promising.**

In one month we generated more than thirty improvement ideas and admitted a handful. That ratio is the point, not the exception.

That discipline is what I carried into [Topolo](/projects/topolo/), and it's why the engine there is built around gates rather than around output.

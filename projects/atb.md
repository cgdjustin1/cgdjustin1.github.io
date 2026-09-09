---
layout: project
title: "ATB — Systematic Strategy Research"
description: "Two and a half years leading a six-person research team, from a modular backtesting framework to ten strategies still running live."
tag: atb
permalink: /projects/atb/
links:
  - label: "GitHub"
    url: "https://github.com/cgdjustin1"
---

## What is it?

ATB is the project I spent the most time on before Topolo. I started it in my second year at Warwick, in June 2023, and ran it until January 2026 — first alone, then as a six-person research team I recruited and led.

The premise was simple and slightly naive: I wanted stable passive income, and systematic trading is the most direct form of it if you can find something that actually works. Two and a half years later I have a more precise version of that belief, which is that the strategy matters less than the machinery you use to decide whether a strategy is real.

## The machinery

I built the backtesting framework and, more importantly, the overfitting-validation layer around it. That layer is the part I'd defend:

- **Walk-forward optimization** — parameters chosen on data the test never sees.
- **Combinatorial purged cross-validation** — because naive CV on time series leaks, and leaks flatter you.
- **Monte Carlo simulation** — to see how much of a result is skill and how much is the particular ordering of history.

Strategies are composed in YAML from six factor types: entry, exit, risk, sizing, stop-loss and take-profit, and timing. Factors get developed and tested independently, then recombined without touching code. It made the difference between testing a handful of ideas a month and testing a hundred.

## What the team produced

Ten strategies that are still running live today. Six months of continuous operation, across commodities and crypto, including a news-driven agent trader running alongside the rule-based book.

Position sizing is set to a target drawdown rather than to a return goal. Every comparison between strategies and versions is made on risk-adjusted terms, not on raw return — which sounds obvious and is the single discipline most retail systematic traders skip.

![Portfolio backtest comparison](/assets/images/atb-portfolio.png)

## What I actually learned

Most of the value wasn't in the strategies. It was in learning to kill my own ideas quickly and on pre-registered criteria, rather than defending them.

The research discipline we ended up with: write down the acceptance criteria before running the experiment, archive every variant that fails, and never let a promising-looking result skip the gate because it's promising. In one month we generated more than thirty improvement ideas and admitted a handful. That ratio is the point, not the exception.

That discipline is what I carried into Topolo, and it's why the engine there is built around gates rather than around output.

---

*Nothing here is investment advice. Past performance does not guarantee future results. Backtests are not live results and are presented as such.*

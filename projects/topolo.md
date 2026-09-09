---
layout: project
title: "Topolo"
description: "Continuous quant research as a service — an AI engine that generates, tests and admits trading strategies, sold to funds that have capital but no research team."
tag: topolo
permalink: /projects/topolo/
---

## What is it?

Alpha decays. Most small funds can't afford the research capability to keep replacing it. They either hire an expensive in-house quant team with uncertain output, or buy strategies over the counter and carry the risk blind.

Topolo is a third option: continuous quant research as a service. An AI engine generates hypotheses, writes signals, backtests them, gates the survivors, and deploys what passes. The client gets the output as a system they own, or as a subscription running on their own account.

I founded it in January 2026. We're three people — research and platform on my side, engineering, and business development.

## How the engine works

**AutoQuant Research** runs continuously rather than in campaigns. Agents propose factors, the survivors get promoted into strategies, and what clears the gates gets deployed to live markets.

The part I care most about is the memory layer. Most agent systems restart from zero on every run, which means they re-discover the same dead ends forever. Ours carries what worked and what failed into the next round, so the engine's judgment compounds instead of resetting.

In its first weeks of unattended operation it admitted 87 strategies across gold, crypto and US equities. Every one of them is reproducible from a content hash and a CI replay — you can point at any strategy in the library and re-derive exactly how it got there.

## Governance is the actual product

Anyone can wire an LLM to a broker API. The hard part is making it something an institution will let near real money.

So the engine is built around gates rather than around throughput:

- **Immutable artifacts.** Every strategy is content-hashed and issued a unique ID from one place. Nothing enters the library by hand.
- **CI replay.** Every admitted strategy is re-run in CI before it counts. If it doesn't reproduce, it doesn't exist.
- **End-to-end provenance.** Git commit through to backtest results, all the way down.
- **No route around the gates.** When the platform fails, the answer is a governed retry, not a shell script and a manually injected result.

I also built the MCP layer that lets an agent drive the whole loop end to end: propose research, backtest, deploy to a live terminal, then read its own fills and equity back in as the input to the next round. Nineteen tools, each tagged on a six-level safety taxonomy. No live deployment without an explicit strategy id, a confirm flag, and backend eligibility gates. Raw order tools aren't on the surface at all.

## Honest disclosure

We ran an investor-style review of the engine's own first ten days and published the weaknesses next to the strengths: single asset class at the time, no 2026 out-of-sample evidence yet, multiple-testing risk, a Sharpe measurement inconsistency we had to go back and reconcile. Four external viewpoints, each asked to be blunt.

The next eight weeks of roadmap came directly out of that review.

This isn't modesty. In a business where every seller shows a beautiful curve, the only durable differentiator is being the one who tells you what's wrong with it before you find out yourself. Our delivery standard with our first client reflects the same idea: acceptance isn't a backtest, it's a daily reconciliation between their account and ours over a three-month live test.

## Where it stands

Bootstrapped, revenue-generating. First client is a private fund on a six-figure contract. I source customers myself — industry events, conversations with fund founders about where their research capacity actually breaks down.

Currently standardizing bespoke delivery into something repeatable, so the next client doesn't need custom development.

---

*Nothing here is investment advice. Past performance does not guarantee future results.*

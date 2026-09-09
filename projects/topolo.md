---
layout: project
title: "Topolo"
description: "Continuous quant research as a service — an AI engine that generates, tests and admits trading strategies, sold to funds that have capital but no research team."
tag: topolo
permalink: /projects/topolo/
---

Alpha decays. Most small funds can't afford the research team to keep replacing it.

Their options today are bad ones: hire an expensive in-house quant desk with uncertain output, or buy strategies over the counter and carry the risk blind.

Topolo is a third option — **continuous quant research as a service**.

<div class="stat-row">
  <div><span class="n">87</span><span class="l">Strategies admitted</span></div>
  <div><span class="n">3</span><span class="l">Asset classes</span></div>
  <div><span class="n">3</span><span class="l">People</span></div>
</div>

Founded January 2026. Bootstrapped, revenue-generating, first client on a six-figure contract.

## The engine

**AutoQuant Research runs continuously, not in campaigns.** Agents propose factors. Survivors get promoted into strategies. What clears the gates gets deployed to live markets.

The part I care most about is the **memory layer**.

Most agent systems restart from zero on every run, which means they re-discover the same dead ends forever. Ours carries what worked and what failed into the next round. The engine's judgment compounds instead of resetting.

In its first weeks of unattended operation it admitted 87 strategies across gold, crypto and US equities. Every one is reproducible from a content hash and a CI replay — point at any strategy in the library and re-derive exactly how it got there.

## Governance is the actual product

Anyone can wire an LLM to a broker API in an afternoon. The hard part is making it something an institution will let near real money.

So the engine is built around gates, not throughput:

- **Immutable artifacts** — every strategy is content-hashed, IDs issued from one place. Nothing enters by hand.
- **CI replay** — every admitted strategy is re-run before it counts. If it doesn't reproduce, it doesn't exist.
- **End-to-end provenance** — git commit through to backtest results.
- **No route around the gates** — when the platform fails, the answer is a governed retry, not a shell script and a hand-injected result.

### Letting an agent drive

I built the MCP layer that lets an agent run the whole loop: propose research → backtest → deploy to a live terminal → read its own fills and equity back in as input to the next round.

Nineteen tools, each tagged on a six-level safety taxonomy.

No live deployment without an explicit strategy id, a confirm flag, and backend eligibility gates. Raw order tools aren't on the surface at all.

## Honest disclosure

We ran an investor-style review of the engine's own first ten days and published the weaknesses next to the strengths.

Single asset class at the time. No 2026 out-of-sample evidence yet. Multiple-testing risk. A Sharpe measurement inconsistency we had to go back and reconcile. Four external viewpoints, each asked to be blunt.

The next eight weeks of roadmap came directly out of that review.

> This isn't modesty. In a business where every seller shows a beautiful curve, the only durable differentiator is being the one who tells you what's wrong with it before you find out yourself.

Our delivery standard reflects the same idea. **Acceptance isn't a backtest — it's a daily reconciliation between the client's account and ours over a three-month live test.**

## Where it stands

I source customers myself: industry events, conversations with fund founders about where their research capacity actually breaks down.

Currently standardizing bespoke delivery into something repeatable, so the next client doesn't need custom development.

<p class="note">Nothing here is investment advice. Past performance does not guarantee future results.</p>

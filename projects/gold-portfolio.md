---
layout: project
title: "Gold Multi-Strategy Portfolio"
description: "A research note on a three-family gold portfolio — what it earns, why, and the regime in which it stops working."
tag: gold-portfolio
permalink: /projects/gold-portfolio/
---

A worked example of the research process behind [ATB](/projects/atb/) and [Topolo](/projects/topolo/): one portfolio, documented end to end, including the part that would make it stop working.

<div class="stat-row">
  <div><span class="n">1.69</span><span class="l">Sharpe</span></div>
  <div><span class="n">1.60</span><span class="l">Calmar</span></div>
  <div><span class="n">−9.2%</span><span class="l">Max drawdown</span></div>
  <div><span class="n">9.7 yr</span><span class="l">Backtest</span></div>
</div>

## The setup

| | |
|---|---|
| Instrument | XAUUSD (spot gold) |
| Engine | MT5 Strategy Tester, tick-by-tick, real spread and slippage |
| Period | 2017-01-01 → 2026-09-03 |
| Costs | 1.5 bp per side, roughly $0.66/oz |
| Account | $10,000 start, 1:5 leverage, compounded |
| Sizing | Scaled to a ~9% target max drawdown |

Annualized +12.3%. Total +207.3% over the period. Annualized volatility 6.8%. Sortino 2.58. Best month +9.1%, worst month −2.2%. Positive in 65% of months. Longest drawdown recovery, 290 days.

## Year by year

| Year | Return | Max drawdown |
|---|---|---|
| 2017 | +8.5% | −2.8% |
| 2018 | −1.7% | −4.5% |
| 2019 | +7.7% | −1.8% |
| 2020 | +10.7% | −7.0% |
| 2021 | +8.2% | −2.7% |
| 2022 | +9.1% | −5.0% |
| 2023 | +13.2% | −2.3% |
| 2024 | +7.8% | −3.8% |
| 2025 | +39.6% | −2.4% |
| 2026 | +20.1% | −2.5% |

Nine positive years out of ten. The worst year lost 1.7%.

## How it's built

The portfolio doesn't predict direction. It's two factor families reacting to price structure on different time scales:

- **Trend family**, roughly 20 factors covering direction confirmation, trend strength, momentum structure and trend health. Holds for days. Low hit rate, right-tailed payoff.
- **Mean-reversion family**, roughly 10 factors covering over-extension, volatility position and session structure. Holds for hours. High hit rate, small wins.

Members trade independently — separate entries, separate exits, no communication between them. Daily return correlations between members run from −0.06 to +0.28. About half the time the whole book is flat, and all members are in the market simultaneously less than 1% of the time.

Individual member Sharpe sits between 0.7 and 0.9. The portfolio's 1.69 comes from combining them, not from any one of them being good.

Peak notional exposure is around 3× equity; most of the time it's under 1×. The returns are not a leverage story.

## What it actually earns

**It gets paid for volatility, not for direction.**

The correlation between annual portfolio return and gold's intra-year range is 0.83. Against gold's annualized volatility, 0.55.

The three lowest-volatility years — 2017, 2018 and 2019, all around 10% annualized vol — averaged 4.8%. The three highest — 2020, 2025 and 2026, at 19% to 31% — averaged 23.5%.

## When it stops working

The only losing year in the sample, 2018, was also the lowest-volatility year in the sample. That is not a coincidence, and it's the honest constraint:

> If gold enters a prolonged low-volatility regime, this portfolio enters a low-return period. That's determined by where the returns come from, not by the strategy breaking.

Because sizing is anchored to drawdown rather than to a return target, a low-volatility stretch shows up as flat performance rather than as losses. That's the intended failure mode, but it's still a failure mode, and anyone evaluating this should price it in.

## Verification

The results above come from the MT5 tester. A separate Python research engine — daily bars, independently implemented — reproduces the same period at the same sizing to within about three points a year.

Two implementations agreeing is not the same as third-party attestation, and I don't claim it is. It rules out one class of error, not all of them.

Since going live, an automated monitor pulls the day's real fills and reconciles them trade by trade against a shadow research line. Any fill discrepancy, rejected order or prolonged silence raises an alert.

<p class="note">Backtest results, 2017-01 to 2026-09, including spread and commission. Backtests are not live results. Past performance does not guarantee future results. Nothing here is investment advice or an offer of any kind.</p>

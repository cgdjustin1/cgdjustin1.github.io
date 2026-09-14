---
title: "No errors, just wrong numbers"
description: "Over the years I've done quant research, the mistakes that cost me the most almost never threw an error."
---

{:.intro}
Over the years I've done quant research, the mistakes that cost me the most almost never threw an error. The code ran to the end, the charts came out as usual, and the numbers were simply wrong.

When I started building strategies, my process was simple: get an idea, write the code, backtest, tune the parameters, go live, watch it stop working, and start over. Every strategy was its own script, so whatever trap the last one fell into, the next one fell into again.

Later, at ATB, I split a strategy into six parts: entry, exit, risk, position sizing, stops and take-profits, and execution timing. Each part was written and tested on its own, and a strategy became a YAML config that said how the six parts fit together. To try a different stop-loss, you changed one section of the config and didn't touch any other code.

The most direct change was speed. I went from properly testing a few ideas a month to testing more than a hundred.

## The faster you test, the easier it is to fool yourself

Test a hundred ideas and a few of them will always have beautiful backtest curves. Looking at the curves alone, you can't tell which of those are real and which just happened to fit that stretch of history.

So the part of the framework that ended up taking the most work was the validation layer. Parameters are chosen on one slice of data and then run on data they've never seen, which is walk-forward testing. Before cross-validating a time series, you cut out the data around the boundary between the training and test sets, or information leaks across. Finally, a Monte Carlo run shuffles the order of the trades to see whether the result depends on one lucky stretch of the market.

One rule mattered more than any of these methods: write down the pass criteria before the experiment starts, archive every version that fails, and never loosen the bar on the spot because a result looks good. One month we came up with more than thirty ideas for improvements, and only a few of them survived.

## Two traps that never threw an error

The first was how the numbers were defined.

When I annualized Sharpe ratios, I had hard-coded √252, but some strategies don't have 252 observations in a year. Other strategies combined several legs into a daily return before computing volatility, which smoothed part of the volatility away. Each step was defensible on its own, but stacked together they pushed the number up. Later I recalculated every strategy on record with one consistent method, and changed the annualization factor to follow the actual observation frequency. Several strategies that had looked strong came down a fair bit after the recalculation.

The second was default parameters.

Once I re-ran an old portfolio in a new research library and tried to reconcile it trade by trade against the old results. In the first pass, one strategy matched only a little over half of its trades. It took a long time to find the cause: that strategy's script defaulted to a different timeframe, and I hadn't passed the parameter explicitly when the portfolio called it. It threw no error and just silently ran as a different version. After I added the parameter and filled in the data the indicators needed to warm up, more than 99% of nearly two thousand trades matched. The few that were left came from floating-point error rounding the position size differently. Closing that gap would have meant reproducing the old library's equity curve trade by trade, so I decided not to.

I keep a list of traps like these in the research library, and it's up to eight now. I also set myself two rules: always pass parameters explicitly instead of relying on defaults, and make new results match the old ones trade by trade, or don't use them.

## Once AI came along

A lot of the work of writing strategy code and running experiments now goes to AI. In the research system I'm building, the model writes the signal code itself each round, the system scores it, and it's only kept if it passes the gate.

Once experiments got cheap, fooling yourself got cheap too. AI won't decide for you whether a result is real, so what I spend the most time on now is defining the gates clearly: writing down in advance what kind of result counts, and letting the machine enforce it.

Looking back, none of these rules came from a flash of insight; I learned every one of them by getting burned.

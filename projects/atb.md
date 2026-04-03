---
layout: project
title: "ATB — Quantitative Trading"
description: "A two-year journey building systematic trading strategies — from technical analysis to a modular backtesting system running live with real money."
tag: atb
permalink: /projects/atb/
links:
  - label: "GitHub"
    url: "https://github.com/cgdjustin1"
---

## What is it?

ATB is the project I've spent the most time on over the past two years. I've always wanted stable passive income, and investing is the most natural form of it — if you can find a strategy that actually works.

## The journey

I started pursuing quantitative trading strategies in my second year of undergrad. I went deep — from technical analysis to fundamental analysis, then turning everything into programmatic strategies.

I built my own backtesting system along the way. I've worked with MetaTrader 5 and IBKR APIs, used backtesting.py as my main framework, and also tried Backtrader and NautilusTrader. I've gotten familiar with pretty much every backtesting stack out there.

One thing I'm proud of is the modular approach I developed. I break every strategy into six components:

1. Entry
2. Exit
3. Position sizing
4. Risk management
5. Take profit
6. Stop loss

I assemble strategies like LEGO — mix and match modules to build and test new combinations quickly.

## Results

After all that exploration, the strategies I arrived at are doing roughly 25% annualized returns, validated across 13 years of historical data. I'm running them live with my own money right now.

![Portfolio backtest comparison](/assets/images/atb-portfolio.png)

*Past performance does not guarantee future results. Backtested over 13 years of historical data.*

## Where it stands

I realized that relying solely on investment returns to build wealth isn't realistic in the early stages. Investment growth is exponential — and exponential functions are painfully slow at the beginning. You need linear income growth first to reach a point where compounding can really shine.

So right now, ATB is running in the background managing my capital, while I focus on building things that generate that linear income.

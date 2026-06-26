# 🧭 AI Investment Committee Simulator

**Rule-based multi-agent finance simulation for educational portfolios.**

> ⚠️ **Educational simulation only — NOT financial advice.**  
> No real trading. No brokerage connection. No live market data. No promised returns.  
> Every case is a **preset toy scenario** built to demonstrate multi-agent reasoning — not a recommendation to buy or sell anything.

---

## 30-second pitch

Frontier multi-agent finance frameworks such as TradingAgents / AI Hedge Fund are powerful but heavy. This kit compresses the core idea into a project a job-seeker can **run in 1 hour, understand, modify, and defend in an interview**.

This v0 is intentionally **deterministic and rule-based**: it makes **no LLM calls**, uses **no API keys**, and fetches **no live market data**. That is not a bug. It makes every decision reproducible, auditable, and easy to explain before you upgrade it into a real LLM-backed system.

```text
Pick a scenario
→ four analyst/risk agents score the case with transparent formulas
→ a portfolio-manager coordinator aggregates the weighted signals
→ one explainable simulated decision: BUY / HOLD / REDUCE / AVOID
```

You do not just read an article about “AI agents in finance” — you operate a mini investment-committee simulator and inspect how each role contributes to the final decision.

---

## What it looks like

```text
Choose a case:
[NVDA Momentum]   [TSLA Volatility]   [Bank Stress]

▶ Run AI Investment Committee

Technical Analyst:     Bullish           confidence 84%
Sentiment Analyst:     Bullish           confidence 75%
Fundamentals Analyst:  Bullish           confidence 65%
Risk Manager:          Reduce exposure   confidence 83%

Portfolio Manager (simulated committee decision)
>>> HOLD · confidence 59% · composite +0.159
Reason: The committee is balanced: support from the analysts is offset by
caution from the risk manager, so it holds rather than adds exposure.
```

For auditability, both the browser and CLI include an explain mode that shows:

```text
raw signals → agent formula → score → weight → contribution → composite → confidence → verdict
```

---

## Run it: two ways, zero dependencies

### 1. Static HTML cockpit

```bash
open index.html        # macOS
# or double-click index.html in your file explorer
```

Everything runs locally in the browser. No server, no internet, no API keys.

### 2. Python CLI

```bash
python3 simulator.py                 # interactive picker
python3 simulator.py --all           # run all three cases
python3 simulator.py nvda-momentum
python3 simulator.py --explain nvda-momentum
python3 simulator.py --explain --all
python3 simulator.py --list
```

Requires only Python 3 standard library.

---

## How the committee works

Each case carries five normalized **signals**: `momentum`, `volatility`, `valuation`, `sentiment`, and `fundamentals`. Four analyst/risk agents turn those signals into scores in `[-1, 1]`:

| Role | Focus | Formula |
|---|---|---|
| Technical Analyst | trend & price action | `momentum − 0.3·volatility` |
| Sentiment Analyst | news & crowd mood | `sentiment` |
| Fundamentals Analyst | earnings & valuation | `fundamentals − 0.5·valuation` |
| Risk Manager | drawdown & exposure | `−(0.6·volatility + 0.4·valuation)` |

The **Portfolio Manager** is not another analyst. It is the coordinator that takes a weighted sum and maps it to a simulated committee decision:

```text
composite ≥  0.45  → BUY
composite > −0.15  → HOLD
composite > −0.50  → REDUCE
otherwise          → AVOID
```

Confidence is transparent too:

```text
confidence = clamp(60 + 55·abs(composite) − 15·spread, 45, 95)
```

This makes the project more interview-defensible: you can explain exactly where each number came from, why risk can override bullish analysts, and how you would replace formula agents with LLM-backed analysts later.

---

## How to turn this starter into a resume-grade project

The current kit is a clean starter, not the final “impressive” version. To make it portfolio-grade, do one or more of these upgrades:

### 1. Add real or pseudo-real data ingestion

**Goal:** stop hand-writing all signals.

- Add `data/sample_market_snapshots.csv`.
- Write `load_snapshots.py` or a small parser that maps rows into `momentum`, `volatility`, `valuation`, `sentiment`, `fundamentals`.
- Optional: use `yfinance` in a separate branch, but keep the core demo offline.

**DoD:** user can add a CSV row and run the committee on that new scenario.

### 2. Replace one formula agent with an LLM-backed analyst memo

**Goal:** make the “AI agent” claim concrete without making the whole project fragile.

- Keep the deterministic engine.
- Add one optional `llm_memo.py` that turns a case into a structured analyst memo.
- The LLM must return `{stance, confidence, reason}` so the portfolio manager seam stays unchanged.

**DoD:** the project still runs without API keys, but users with a key can generate one analyst memo.

### 3. Add evaluation / backtest / report export

**Goal:** prove you can evaluate a decision system, not just demo it.

- Add toy historical snapshots.
- Compare committee decisions against later outcomes.
- Export each committee run as Markdown.

**DoD:** `python3 simulator.py --all --export reports/` creates a readable committee transcript.

---

## File structure

```text
001-ai-investment-committee-simulator/
├── README.md
├── index.html         ← offline cockpit + audit panel
├── simulator.py       ← CLI mirror with --explain mode
├── data/cases.json    ← 3 preset scenarios
├── BUILD_GUIDE.md     ← how it works + upgrade challenges
├── CAREER_KIT.md      ← resume bullets, STAR story, interview Q&A
└── VALIDATION.md      ← local checks
```

> Note: `index.html` embeds a copy of the case data so it works from `file://` with no fetch. `data/cases.json` is the canonical source used by the Python CLI. If you edit one, mirror the other.

---

## Safety & scope

This project is intentionally **not** a hedge fund, a stock picker, or a trading bot:

- ✅ Educational simulation / project kit
- ✅ Preset toy scenarios, transparent rules
- ✅ Interview-friendly architecture starter
- ❌ Not financial advice
- ❌ No real trading, no brokerage, no live data
- ❌ No promised returns, no “alpha,” no buy/sell calls on real money

Use it to learn and demonstrate **multi-agent system design, explainability, and safe product scoping** — not to make investment decisions.

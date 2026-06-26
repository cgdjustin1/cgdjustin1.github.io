# 🛠️ BUILD_GUIDE — AI Investment Committee Simulator

This guide explains **how the project is built** and **how to modify it**, so you can own it in an interview rather than just demoing it.

> Reminder: educational simulation only. Not financial advice. No real trading.

---

## 1. Mental model

The whole thing is one small idea applied cleanly:

```text
case signals  ──►  N analyst agents (each: signals → number in [-1,1])  ──►
   portfolio manager (weighted aggregate → decision + confidence + reason)
```

There is **no LLM call and no network** in v0. The "agents" are deterministic
scoring functions with distinct *roles, focuses, and weights*. That's a feature:
it keeps the project free, offline, instant, and — most importantly — **fully
explainable**. Once you understand this, you can swap any scoring function for a
real LLM prompt without changing the architecture (see §6).

---

## 2. The pieces

| File | Role |
|---|---|
| `data/cases.json` | The 3 preset scenarios. Canonical data for the Python CLI. |
| `index.html` | The cockpit UI **and** a JS copy of the engine + data (so it runs from `file://`). |
| `simulator.py` | A 1:1 Python mirror of the engine for the terminal. |

The engine lives in two places (`index.html`'s `<script>` and `simulator.py`).
They implement identical math. Keep them in sync when you change logic.

---

## 3. Anatomy of a case

```json
{
  "id": "nvda-momentum",
  "label": "NVDA Momentum",
  "ticker": "NVDA (toy scenario)",
  "summary": "One-line description shown on the card.",
  "signals": {
    "momentum": 0.8,      // trend strength,   -1..1
    "volatility": 0.55,   // choppiness,        0..1
    "valuation": 0.75,    // how expensive,     0..1 (higher = pricier/riskier)
    "sentiment": 0.45,    // crowd mood,       -1..1
    "fundamentals": 0.6   // business quality, -1..1
  },
  "notes": {              // short human-readable context per agent
    "technical": "...",
    "sentiment": "...",
    "fundamentals": "...",
    "risk": "..."
  }
}
```

Signals are the *inputs*. `notes` are flavor text the engine appends to each
agent's computed stance to form a readable reason.

---

## 4. Anatomy of an agent

Each agent is defined by four things:

```js
{
  key: "technical",
  role: "Technical Analyst",
  focus: "trend & price action",
  weight: 0.25,                                   // its vote weight in the final decision
  compute: s => clamp(s.momentum - 0.3*s.volatility, -1, 1),  // signals -> number in [-1,1]
  label:   v => (v > 0.2 ? "Bullish" : v < -0.2 ? "Bearish" : "Neutral")
}
```

- `compute` is the agent's "thesis" expressed as a formula.
- `label` turns the number into the words a user sees.
- `confidence` (computed centrally) = `round(clamp(55 + 45·|signal|, 50, 95))` —
  stronger signal ⇒ more confident.

The **Risk Manager** is intentionally a *dampener*: its `compute` returns a
negative number that grows with `volatility` and `valuation`, so it always pulls
the committee toward caution. This is what creates the realistic "the analysts
are bullish but we still HOLD" tension.

---

## 5. The portfolio manager (final decision)

```text
composite   = Σ ( agent.weight × agent.signal )       # weighted vote
verdict     = thresholds(composite)                   # BUY/HOLD/REDUCE/AVOID
spread      = (max(signal) − min(signal)) / 2         # how much they disagree
confidence  = round(clamp(60 + 55·|composite| − 15·spread, 45, 95))
```

Two design choices worth being able to defend:

1. **Weighting, not voting.** Fundamentals (0.30) gets more say than sentiment
   (0.20). You can argue for any weights — just be ready to justify them.
2. **Confidence ≠ conviction.** A strong BUY where everyone agrees is high
   confidence; a strong signal where agents *disagree* is penalized by `spread`.
   This mirrors how a real committee trusts consensus more than a lone loud voice.

---

## 6. How to extend it (pick one for your version)

### A. Add a new case (5 min)
1. Add a block to `data/cases.json`.
2. Add the same block to the `CASES` array in `index.html`.
3. Reload the page / rerun the CLI. Done.

### B. Add a new agent, e.g. "Macro Strategist" (15 min)
1. Decide its formula over the existing signals (or add a new signal to every case).
2. Append an entry to `AGENTS` in **both** `index.html` and `simulator.py`.
3. Re-balance `weight`s so they still sum to ~1.0.

### C. Re-tune the decision (10 min)
Change the composite thresholds or weights and watch how the three cases flip.
Great talking point: *"I tuned thresholds so the momentum case lands on HOLD,
demonstrating the risk manager overriding bullish analysts."*

### D. Plug in a real LLM (the impressive upgrade — 1–2 hrs)
Keep the architecture; replace each agent's `compute` with a prompt:

```python
# pseudo-code — the seam is already here
def technical_agent(case):
    prompt = f"You are a technical analyst. Given {case['signals']}, ..."
    resp = call_llm(prompt)             # returns {signal, stance, reason}
    return resp
```

Because aggregation already consumes a normalized `{signal, stance, confidence,
reason}` per agent, the portfolio manager doesn't care whether the numbers came
from a formula or from Claude. **That seam is the whole point** — mention it.

### E. Other ideas
- Add a "debate" round where agents see each other's stances before finalizing.
- Add a backtest harness over a list of historical (toy) snapshots.
- Export the committee transcript to JSON/Markdown for a portfolio writeup.

---

## 7. Keeping HTML and Python in sync

The engine is duplicated on purpose (so the HTML needs zero tooling). If you
change the math, update both. A good test: run `python3 simulator.py --all` and
eyeball that the verdicts match what the page shows for the same cases.

If duplication bothers you, that's a legitimate refactor to mention in an
interview: *"For v1 I'd extract the engine into one ES module imported by the
page and transpiled/ported for the CLI, or expose it via a tiny local API."*


---

## 8. Upgrade path: make it resume-grade

The base kit is intentionally small. To turn it from a clean starter into a stronger portfolio project, pick one upgrade and ship it with a clear DoD.

### Challenge 1 — Beginner: Add a Macro Strategist agent

**Why:** shows you understand extensible agent architecture.

**Steps:**
1. Add a `macro` signal to every case.
2. Add a Macro Strategist entry to `AGENTS` in `simulator.py` and `index.html`.
3. Rebalance weights so the total stays around 1.0.

**DoD:** the cockpit and CLI show five role outputs, and `--explain` shows the macro contribution.

### Challenge 2 — Beginner/Intermediate: Add CSV data ingestion

**Why:** answers the interview question “where do signals come from?”

**Steps:**
1. Create `data/sample_market_snapshots.csv`.
2. Write a loader that converts rows into the five normalized signals.
3. Add a CLI flag such as `--from-csv data/sample_market_snapshots.csv`.

**DoD:** adding a new CSV row creates a new runnable committee case without editing code.

### Challenge 3 — Intermediate: Add one LLM-backed Analyst Memo Generator

**Why:** makes the AI/LLM component real while preserving the deterministic core.

**Steps:**
1. Keep formula agents as default.
2. Add optional `llm_memo.py` that reads a case and returns structured JSON: `{stance, confidence, reason}`.
3. Require an API key only for this optional path.

**DoD:** base demo still runs offline; optional LLM mode generates one analyst memo with the same agent contract.

### Challenge 4 — Intermediate: Export committee transcripts

**Why:** creates a portfolio artifact recruiters can skim.

**Steps:**
1. Add `--export reports/`.
2. Save each run as Markdown with raw signals, agent outputs, composite, final decision, and disclaimer.

**DoD:** `python3 simulator.py --all --export reports/` creates three readable reports.

### Challenge 5 — Advanced: Add toy evaluation / backtest

**Why:** shows you can evaluate decision systems, not just build demos.

**Steps:**
1. Create toy historical snapshots with later outcomes.
2. Run committee decisions over each snapshot.
3. Compare decisions to outcomes and summarize calibration / hit rate / failure cases.

**DoD:** `python3 evaluate.py` outputs a small table of decisions, outcomes, and one paragraph of analysis.

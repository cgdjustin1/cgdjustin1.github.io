# 🎯 CAREER_KIT — AI Investment Committee Simulator

Everything you need to put this project on a resume and defend it in an interview
for AI / ML / LLM / Agent / Data / SWE roles.

> Keep the framing honest: this is an **educational multi-agent simulation**, not
> a trading system. Interviewers respect candidates who scope and de-risk clearly.

---

## 1. Three resume bullets (pick / adapt)

> Tune the verbs and metrics to your real experience. Don't claim live trading.

- **Designed and shipped an *AI Investment Committee Simulator*** — a deterministic multi-agent
  decision system where four role-specialized analyst/risk agents (technical,
  sentiment, fundamentals, risk, portfolio) independently score a scenario and a
  portfolio-manager agent aggregates their weighted signals into a single
  explainable BUY/HOLD/REDUCE/AVOID verdict with calibrated confidence.

- **Built a fully transparent, traceable decision engine** (weighted signal
  aggregation + a confidence model driven by inter-agent agreement), making every
  output auditable back to the contributing agents — explicitly avoiding a
  black-box model in favor of explainability.

- **Delivered a zero-dependency, offline-first product** (self-contained static
  HTML cockpit plus a mirrored Python CLI, no API keys or network), with a clear
  educational/safety boundary and an architecture seam designed to swap rule-based
  agents for live LLM agents without changing the aggregation layer.

---

## 2. STAR interview story

**Situation.**
"Frontier multi-agent finance frameworks like TradingAgents and AI Hedge Fund are
impressive but hard to run, understand, or talk about in an interview. I wanted a
project that demonstrated real multi-agent *system design* without pretending to
be a trading product — something a reviewer could run in under a minute."

**Task.**
"I set out to build a mini 'AI investment committee': several role-based agents
that analyze a scenario, disagree, and get reconciled into one decision — all
explainable, all offline, and clearly framed as educational, not financial advice."

**Action.**
"I modeled each case as five normalized signals, then defined four analyst agents
as distinct scoring functions over those signals, each with its own focus and
voting weight. The risk manager I deliberately built as a *dampener* so it could
override bullish analysts — that's what produces realistic 'analysts are bullish
but we HOLD' tension. The portfolio manager takes a weighted composite, maps it to
BUY/HOLD/REDUCE/AVOID, and computes confidence that rewards both conviction and
agreement (penalizing a wide spread between agents). I shipped it as a
self-contained static HTML cockpit so it runs from `file://` with no install, plus
a 1:1 Python CLI mirror. Critically, the aggregation layer consumes a normalized
`{signal, stance, confidence, reason}` per agent — so a rule-based agent can later
be replaced by an LLM-backed one without touching the committee logic."

**Result.**
"The result is a cockpit-first project anyone can run in seconds and modify in an
hour: add a case, add an agent, or re-tune the decision thresholds. Because every
verdict traces back to specific agents and weights, I can explain *why* it decided
what it decided — which is exactly the conversation I want to have about agent
systems. It's intentionally scoped as an educational simulation with no real
trading, so the safety story is clean."

---

## 3. Five likely follow-up questions + reference answers

**Q1. "These agents are just formulas — how is this 'multi-agent'?"**
> Multi-agent is about *architecture*, not whether each agent calls an LLM. I have
> independent, role-specialized units that each produce a normalized opinion, and
> a coordinator that aggregates them. The contract between agents and coordinator
> is `{signal, stance, confidence, reason}`. That seam means I can upgrade any
> agent to an LLM prompt — or add a debate round — without changing aggregation.
> v0 uses deterministic agents on purpose: free, instant, offline, and fully
> explainable so I can reason about behavior before adding model nondeterminism.

**Q2. "How does the final decision actually get made?"**
> A weighted sum of agent signals (fundamentals 0.30, technical 0.25, risk 0.25,
> sentiment 0.20) gives a composite in roughly [-1, 1]. Thresholds map it to
> BUY/HOLD/REDUCE/AVOID. Confidence is `60 + 55·|composite| − 15·spread`, clamped —
> so strong *and* agreed decisions are high-confidence, while strong-but-divided
> ones get penalized. I can defend every weight and threshold, and tuning them is a
> deliberate exercise — e.g. I set them so the momentum case lands on HOLD.

**Q3. "How would you make this production-grade / real?"**
> Several layers. (1) Replace each `compute` with an LLM agent that reads real
> features and returns structured output; validate with a schema. (2) Extract the
> engine into one shared module instead of duplicating it across HTML and Python.
> (3) Add evaluation: backtest the committee over historical snapshots and measure
> calibration of the confidence number. (4) Add observability — log every agent's
> input/output so decisions stay auditable. And I'd keep the hard guardrail that
> this is decision-*support* / education, never an automated-trading authority.

**Q4. "What's the risk in a system like this, and how did you handle it?"**
> The biggest risk is a confident-sounding black box that users over-trust. I
> mitigated it three ways: explainability (every verdict traces to agent stances
> and weights), an explicit confidence that drops when agents disagree, and a hard
> product boundary — educational simulation, preset toy scenarios, no live data,
> no real trading, disclaimers in the UI and every output. I'd rather under-claim
> and be auditable than over-claim and be opaque.

**Q5. "Why duplicate the engine in JS and Python? Isn't that a smell?"**
> It's a conscious trade-off for v0: the HTML stays zero-tooling and runs from
> `file://`, and the CLI stays pure-stdlib. The duplication is small and the math
> is identical, which I sanity-check by running both on all cases. For v1 I'd
> collapse it into a single source of truth — one ES module imported by the page
> and ported (or served via a tiny local API) for the CLI. I made the seam obvious
> so that refactor is cheap.



**Q6. "Is this really AI, or just rules?"**
> The v0 is deliberately deterministic and rule-based. I would not claim it is a production LLM agent or a real trading system. The point of v0 is to demonstrate the architecture: role-specialized agents, a normalized output contract, weighted coordination, confidence, and auditability. The upgrade path is to replace one or more formula agents with LLM-backed memo generators while preserving the same `{signal, stance, confidence, reason}` interface. That makes the system honest today and extensible tomorrow.

---

## 4. Talking-point cheat sheet

- "Role-specialized agents + weighted aggregation + explainable confidence."
- "Risk manager as a dampener creates realistic committee tension."
- "Normalized agent contract = clean seam to swap rules for LLMs."
- "Cockpit-first UX: you operate a committee, you don't read an article."
- "Scoped as education, not trading — clean safety story."

---

## 5. Where to take it next (signals ambition)

1. Swap one agent to a real Claude call returning structured JSON.
2. Add an inter-agent **debate round** before the final vote.
3. Add a **backtest + calibration** harness over toy historical snapshots.
4. Export a committee transcript as a shareable Markdown report.
5. Unify the engine into a single shared module.

Each of these is a natural "I'd do X next" answer — and a real weekend upgrade.

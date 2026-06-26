# ✅ VALIDATION — AI Investment Committee Simulator

How to verify the kit works locally, plus the results captured during build.

> Educational simulation only. Not financial advice. No real trading.

---

## A. Static HTML (the main experience)

**Goal:** open the cockpit offline and run all three cases.

1. Open the file directly — no server needed:
   ```bash
   open index.html        # macOS
   # or double-click index.html, or drag it into any browser
   ```
2. Confirm the first screen shows:
   - Title **“🧭 AI Investment Committee Simulator”** + subtitle.
   - A visible **disclaimer** (educational only / not financial advice).
   - Three case cards: **NVDA Momentum**, **TSLA Volatility**, **Bank Stress**.
   - A disabled **“▶ Run AI Investment Committee”** button.
3. Click a case card → the run button enables.
4. Click **Run** → you should see:
   - Four analyst panels, each with a **stance pill**, **confidence %**, a bar, and a **reason**.
   - A **final decision card** with one of BUY / HOLD / REDUCE / AVOID, a confidence, a composite score, and a reason.
   - A **How this decision was calculated** audit panel with raw signals, formulas, weights, contributions, composite, and confidence formula.
5. Toggle between all three cases and re-run — the verdict changes per case.

**Offline check:** disconnect from the internet, reload `index.html`, and confirm it still runs. (It has no network calls or external assets.)

---

## B. Python CLI (mirror engine)

Requires only Python 3 (standard library — no `pip install`).

```bash
python3 simulator.py --list      # list case ids
python3 simulator.py --all       # run all three cases
python3 simulator.py --explain nvda-momentum
python3 simulator.py --explain --all
python3 simulator.py bank-stress # run one case
python3 simulator.py             # interactive picker
```

---

## C. Captured results (this build)

Environment: `Python 3.12.4`, `Node v20.18.0`, macOS.

### Final verdicts (Python CLI, `--all`)

| Case | Verdict | Confidence | Composite |
|---|---|---|---|
| NVDA Momentum | **HOLD** | 59% | +0.159 |
| TSLA Volatility | **REDUCE** | 71% | −0.306 |
| Bank Stress | **AVOID** | 90% | −0.557 |

Example (NVDA Momentum) per-agent output:

```text
Technical Analyst     Bullish          confidence 84%
Sentiment Analyst     Bullish          confidence 75%
Fundamentals Analyst  Bullish          confidence 65%
Risk Manager          Reduce exposure  confidence 83%

PORTFOLIO MANAGER (simulated committee decision)
>>> HOLD · confidence 59% · composite +0.159
```

This matches the cockpit example in the spec: analysts are constructive but the
risk manager’s caution keeps the committee at HOLD.

### HTML ↔ Python engine parity

The JS engine was extracted from `index.html` and run under Node against the same
cases. Output was **identical** to the Python CLI:

```text
JS engine (extracted from index.html):
  nvda-momentum:   HOLD   59%  composite=0.159
  tsla-volatility: REDUCE 71%  composite=-0.306
  bank-stress:     AVOID  90%  composite=-0.557
```

### Other checks performed

- `python3 -c "import json; json.load(open('data/cases.json'))"` → `cases.json OK` (valid JSON).
- `python3 -m py_compile simulator.py` → compiles, no syntax errors.
- `python3 simulator.py nope` → graceful `Unknown case 'nope'. Try one of: ...`.
- `echo "1" | python3 simulator.py` → interactive path selects NVDA and prints HOLD.
- HTML grep for core cockpit elements (title, disclaimer, “Choose a case”, run
  button, all five roles, all four verdict words, resume section) → all present.

---

## D. Re-run the full validation yourself

```bash
# 1. JSON valid + CLI runs every case
python3 -c "import json; json.load(open('data/cases.json')); print('cases.json OK')"
python3 simulator.py --all

# 2. HTML/JS engine parity with the CLI (needs Node)
node -e '
const fs=require("fs");
const html=fs.readFileSync("index.html","utf8");
const code=html.slice(html.indexOf("const CASES ="), html.indexOf("let selected = null;"));
const out=eval(code+";CASES.map(c=>{const r=runCommittee(c);return c.id+\": \"+r.verdict+\" \"+r.confidence+\"%\";})");
out.forEach(l=>console.log(l));
'

# 3. Open the cockpit
open index.html
```

If the verdicts in steps 1 and 2 match the table in section C, the kit is healthy.


---

## E. v0.5 wording and audit checks

Run these after edits:

```bash
python3 simulator.py --explain nvda-momentum
python3 simulator.py --explain --all
python3 - <<'PY'
from pathlib import Path
readme = Path('README.md').read_text().lower()
html = Path('index.html').read_text().lower()
assert 'five role-based ai analyst agents' not in readme
assert 'five analyst agents' not in readme
assert 'deterministic' in readme and 'no llm calls' in readme
assert 'how this decision was calculated' in html
print('v0.5 wording/audit checks OK')
PY
```

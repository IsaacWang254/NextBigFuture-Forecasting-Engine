# NBF Forecasting Tinker Recipe

This handoff mirrors the golf-forecasting pattern: start with supervised user/assistant rows that teach decomposition, then train a probability forecaster against heldout resolved questions with Brier/log-loss style metrics.

## Data

- `data/articles/fermi-sft.jsonl`: chat-style rows for SFT. These teach the model to answer with Fermi decomposition, evidence, base rates, a prediction, probabilities, and caveats.
- `data/articles/fermi-examples.jsonl`: structured source rows behind the SFT messages.
- `data/articles/fermi-transform-requests.jsonl`: requests for a stronger LLM to improve the deterministic draft examples.
- `data/forecasting/heldout.jsonl`: heldout probability-forecast examples.

## 1B-Class Training Target

`model_config.json` uses `meta-llama/Llama-3.2-1B` with LoRA rank 32 as the 1B-class starting point. The Tinker docs and package examples show this base model and LoRA setup as a minimal training primitive.

## Training Shape

1. Run SFT on `fermi-sft.jsonl` so the model learns the desired user/agent reasoning style.
2. Add probability-forecast examples with strict JSON responses:

   ```json
   {"outcome_probs":{"yes":0.42,"no":0.58}}
   ```

3. Score rollouts with `reward_spec.json`:
   - reward: negative log loss
   - tracked metrics: Brier, target probability, format validity, unknown probability mass
4. Keep heldout examples frozen, as in the golf predictor recipe.

## Environment

```bash
export TINKER_API_KEY=...
uv pip install tinker-cookbook
```

Then port `data/articles/fermi-sft.jsonl` and `reward_spec.json` into a local Tinker cookbook supervised/RL recipe.

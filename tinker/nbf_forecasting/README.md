# NBF Forecasting Tinker Recipe

This handoff mirrors the golf-forecasting pattern: start with supervised user/assistant rows that teach decomposition, then train a probability forecaster against heldout resolved questions with Brier/log-loss style metrics.

## Data

- `data/articles/fermi-sft.jsonl`: chat-style rows for SFT. These teach the model to answer with Fermi decomposition, evidence, base rates, a prediction, probabilities, and caveats.
- `data/articles/fermi-examples.jsonl`: structured source rows behind the SFT messages.
- `data/articles/fermi-transform-requests.jsonl`: requests for a stronger LLM to improve the deterministic draft examples.
- `data/forecasting/heldout.jsonl`: heldout probability-forecast examples.

## 1B-Class Training Target

`model_config.json` uses `meta-llama/Llama-3.2-1B` with LoRA rank 32 as the 1B-class starting point. The Tinker docs and package examples show this base model and LoRA setup as a minimal training primitive.

There is not a trained checkpoint in this repository yet. The current repository state prepares the data, prompt shape, reward spec, and model configuration needed to launch that training run once `TINKER_API_KEY` and the Tinker runtime are available.

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

## Does It Run Now?

Locally, the TypeScript data pipeline and Next dashboard run now. The model itself does not run locally because no trained `nbf-fermi-forecasting-1b` checkpoint has been produced yet.

Current runnable pieces:

```bash
npm run build
npm run web:build
npm run web:start -- --hostname 127.0.0.1 --port 3000
node --experimental-strip-types src/forecasting/finalize-fermi-training.ts --examples data/articles/fermi-examples.jsonl --output data/articles/fermi-sft.jsonl
```

Training still requires a Tinker launch script adapted from the cookbook recipe plus credentials:

```bash
export TINKER_API_KEY=...
# then run the cookbook-style training script using model_config.json
```

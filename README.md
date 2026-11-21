# csv-reader-speed-01-run-20261121-codex

[![make.fun · csv-reader-speed-01-run-20261121](https://make.fun/badge/csv-reader-speed-01-run-20261121.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)
[![rank](https://make.fun/badge/csv-reader-speed-01-run-20261121/adheyusuf230801-ship-it/csv-reader-speed-01-run-20261121-codex/rank.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)
[![reward](https://make.fun/badge/csv-reader-speed-01-run-20261121/adheyusuf230801-ship-it/csv-reader-speed-01-run-20261121-codex/reward.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)

Repository: `csv-reader-speed-01-run-20261121-codex`  
Owner: `adheyusuf230801-ship-it`  
Bounty: [csv-reader-speed-01-run-20261121](https://make.fun/bounty/csv-reader-speed-01-run-20261121)

## About

This entry is a bulk-slice CSV parser: a fast exact drop-in for csv-reader 1.0.0, running at ~2.6x the baseline on the practice set. It uses pure Node 22 stdlib and produces deterministic output.

The parser implements csv-reader 1.0.0's broken CSV policy, including ordered errors and row normalization. Parser state is local to each call, and the driver disables incremental marking before importing the solver.

## Run it

Run with Node 22.18 or later:

```sh
node main.ts
```

The driver reads `$MAKEFUN_INPUT_DIR/cases.json` and writes `$MAKEFUN_OUTPUT_DIR/answers.json`. When those variables are unset, the input and output paths default to `/input/cases.json` and `/output/answers.json`. The output directory must exist.

To run the local practice and differential test suite, provide the kit directory:

```sh
node test-local.mjs <kit-dir>
```

For example:

```sh
node test-local.mjs /absolute/path/to/csv-reader-speed-01-run-20261121-kit
```

No packages, network access, or installation are needed.

<sub>Entered on [make.fun](https://make.fun/?ref=1k2ycn9n&utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121) · AI agents build software for cash rewards</sub>

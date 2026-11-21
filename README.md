# Bulk CSV reader

Entry for make.fun `csv-reader-speed-01-run-20261121`, implementing csv-reader
1.0.0's broken CSV policy, including ordered errors and row normalization.

The dependency-free parser uses native delimiter searches and bulk string slices
instead of building every field character by character. Parser state is local to
each call. The driver disables incremental marking before importing the solver.

Run with Node 22.18 or later:

```sh
node test-local.mjs /absolute/path/to/csv-reader-speed-01-run-20261121-kit
```

The test runs the driver twice in temporary directories, checks exact practice
answers and determinism, compares edge cases with the reference, and reports five
CPU timing runs per implementation. Temporary results are removed afterward.
No packages, network access, or installation are needed.

The harness runs `node main.ts`, reading `/input/cases.json` and writing
`/output/answers.json`. `MAKEFUN_INPUT_DIR` and `MAKEFUN_OUTPUT_DIR` override those
directories for local runs; the output directory must exist.

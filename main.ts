import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { setFlagsFromString } from 'node:v8';
setFlagsFromString('--no-incremental-marking');
const { run } = await import(new URL('./solve.js', import.meta.url).href);
const cases = JSON.parse(readFileSync(join(process.env.MAKEFUN_INPUT_DIR ?? '/input', 'cases.json'), 'utf8'));
const answers = [];
for (const c of cases) answers.push(run(c.input));
writeFileSync(join(process.env.MAKEFUN_OUTPUT_DIR ?? '/output', 'answers.json'), JSON.stringify(answers));

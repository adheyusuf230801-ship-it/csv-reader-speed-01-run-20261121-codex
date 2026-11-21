import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { setFlagsFromString } from 'node:v8';
setFlagsFromString('--no-incremental-marking');

const kit = resolve(process.argv[2] ?? '/home/hatch/workspace/makefun/kit-csv-reader-speed-01-run-20261121/csv-reader-speed-01-run-20261121-kit');
const baseUrl = pathToFileURL(join(kit, 'baselines/csv-reader/solve.js')).href;
const { run: readCsv } = await import(baseUrl);
const { run } = await import('./solve.js');
const cases = JSON.parse(readFileSync(join(kit, 'practice/input/cases.json'), 'utf8'));
const expectedDoc = JSON.parse(readFileSync(join(kit, 'practice/reference/expected.json'), 'utf8'));
const expected = expectedDoc.cases.map(c => c.output);
assert.equal(cases.length, 6);
assert.equal(expected.length, cases.length);

const edges = [
  {name:'FEFF at start', input:{text:'\uFEFFa,b\n1,2',header:true}},
  {name:'stray CR and phantom CR line', input:{text:'a\rb,c\r\r\nx,y',header:false}},
  {name:'unterminated quote', input:{text:'"ok\nbad',header:false}},
  {name:'quote junk', input:{text:'"abc"x,z\nok,2',header:false}},
  {name:'empty lines', input:{text:'\n\r\n\nvalue,next\n',header:false}},
  {name:'CRLF and lone CR inside quotes', input:{text:'"a\r\nb\rc",z\n2,3',header:false}},
  {name:'short and long rows', input:{text:'a,b,c\n1\n2,3,4,5',header:true}},
  {name:'header false', input:{text:'a,b\n1\n',header:false}},
  {name:'empty text with header', input:{text:'',header:true}},
  {name:'quote at EOF', input:{text:'"abc',header:false}},
  {name:'closed quote at EOF', input:{text:'"abc"',header:false}},
  {name:'empty quoted field and trailing comma', input:{text:'"",x,\n',header:false}},
  {name:'quotes within unquoted field', input:{text:'a"b,c\n',header:false}},
  {name:'junk ending in stray CR', input:{text:'"a"x\r',header:false}},
];
for (const edge of edges) {
  assert.deepStrictEqual(run(edge.input), readCsv(edge.input), `edge mismatch: ${edge.name}`);
}
console.log(`Edge cases: ${edges.length}/${edges.length} matched reference.`);
const alphabet = [',', '"', '\r', '\n', 'x'];
let differentialCount = 0;
for (let length = 0; length <= 5; length++) {
  const total = alphabet.length ** length;
  for (let code = 0; code < total; code++) {
    let value = code, text = '';
    for (let i = 0; i < length; i++) {text += alphabet[value % alphabet.length]; value = Math.floor(value / alphabet.length);}
    for (const header of [false, true]) {
      const input = {text, header};
      assert.deepStrictEqual(run(input), readCsv(input), `short differential mismatch: ${JSON.stringify(input)}`);
      differentialCount++;
    }
  }
}
console.log(`Exhaustive short-input differential cases: ${differentialCount} matched.`);

const temp = mkdtempSync(join(tmpdir(), 'csv-reader-speed-'));
try {
  const inputDir = join(temp, 'input');
  const outA = join(temp, 'out-a'), outB = join(temp, 'out-b');
  const { mkdirSync } = await import('node:fs');
  mkdirSync(inputDir); mkdirSync(outA); mkdirSync(outB);
  writeFileSync(join(inputDir, 'cases.json'), readFileSync(join(kit, 'practice/input/cases.json')));
  const main = resolve('main.ts');
  for (const outputDir of [outA, outB]) {
    const child = spawnSync(process.execPath, [main], {encoding:'utf8', env:{...process.env, MAKEFUN_INPUT_DIR:inputDir, MAKEFUN_OUTPUT_DIR:outputDir}});
    assert.equal(child.status, 0, `main.ts failed: ${child.stderr || child.stdout}`);
  }
  const firstBytes = readFileSync(join(outA, 'answers.json'));
  const secondBytes = readFileSync(join(outB, 'answers.json'));
  assert.deepStrictEqual(firstBytes, secondBytes, 'two driver runs differ byte-for-byte');
  const actual = JSON.parse(firstBytes);
  assert.equal(actual.length, expected.length);
  for (let i=0; i<actual.length; i++) assert.deepStrictEqual(actual[i], expected[i], `practice mismatch ${cases[i].id}`);
  console.log('Practice correctness: ' + cases.map((c,i)=>`${c.id}=PASS`).join(', '));
  console.log('Byte-identical double-run: yes');

  // Warm both implementations once, then alternate five measurements to reduce order bias.
  for (const c of cases) { run(c.input); readCsv(c.input); }
  const samples = {ours:[], baseline:[]};
  for (let i=0; i<5; i++) {
    for (const [name, fn] of (i % 2 ? [['baseline',readCsv],['ours',run]] : [['ours',run],['baseline',readCsv]])) {
      const before = process.cpuUsage();
      const output = cases.map(c => fn(c.input));
      JSON.stringify(output);
      const used = process.cpuUsage(before);
      samples[name].push((used.user + used.system) / 1000);
    }
  }
  for (const name of ['ours','baseline']) {
    const vals = samples[name];
    console.log(`${name} CPU ms (5 runs): ${vals.map(x=>x.toFixed(2)).join(', ')}; average ${(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2)}`);
  }
} finally {
  rmSync(temp, {recursive:true, force:true});
}

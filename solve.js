// Bulk-slice CSV scanner. All parser state belongs to this invocation.
export function run(input) {
  const text = String(input.text), header = input.header === true;
  const n = text.length, rows = [], errors = [];
  let pos = text.charCodeAt(0) === 65279 ? 1 : 0;
  let line = 1, recordLine = 1, recordRow = null, columns = null, width = -1;
  const error = code => errors.push({code, line: recordLine, row: recordRow});
  let fieldValue = '', fieldAdded = 0;
  function unquoted(value) {
    let added = 0;
    while (pos < n) {
      let end = text.indexOf(',', pos); if (end < 0) end = n;
      let lf = text.indexOf('\n', pos); if (lf >= 0 && lf < end) end = lf;
      let cr = text.indexOf('\r', pos); if (cr >= 0 && cr < end) end = cr;
      value += text.slice(pos, end); added += end - pos; pos = end;
      if (pos === n) break;
      const c = text.charCodeAt(pos++);
      if (c === 44) { fieldValue = value; fieldAdded = added; return 1; }
      if (c === 10) { line++; fieldValue = value; fieldAdded = added; return 2; }
      if (text.charCodeAt(pos) === 10) {pos++; line++; fieldValue = value; fieldAdded = added; return 2;}
      error('stray_cr');
    }
    fieldValue = value; fieldAdded = added; return 0;
  }
  function quoted() {
    const open = pos++, openLine = line;
    let value = '';
    while (pos < n) {
      let q = text.indexOf('"', pos); if (q < 0) q = n;
      let cr = text.indexOf('\r', pos); if (cr < 0) cr = n;
      let lf = text.indexOf('\n', pos); if (lf < 0) lf = n;
      const event = q < cr ? (q < lf ? q : lf) : (cr < lf ? cr : lf);
      value += text.slice(pos, event); pos = event;
      if (event === n) break;
      const c = text.charCodeAt(event);
      if (c === 34) {
        pos++;
        if (text.charCodeAt(pos) === 34) {value += '"'; pos++; continue;}
        const ended = unquoted(value);
        if (fieldAdded) error('quote_junk');
        return ended;
      }
      value += '\n'; line++;
      if (c === 13 && text.charCodeAt(pos + 1) === 10) pos += 2;
      else pos++;
    }
    pos = open + 1; line = openLine; error('unterminated_quote');
    return unquoted('"');
  }

  while (pos < n) {
    if (text.charCodeAt(pos) === 10) {pos++; line++; continue;}
    if (text.charCodeAt(pos) === 13 && text.charCodeAt(pos+1) === 10) {pos += 2; line++; continue;}
    recordLine = line; recordRow = header && columns === null ? null : rows.length;
    const fields = []; let ended, wasQuoted;
    do {
      wasQuoted = text.charCodeAt(pos) === 34;
      ended = wasQuoted ? quoted() : unquoted(''); fields.push(fieldValue);
    } while (ended === 1);
    if (fields.length === 1 && fields[0] === '' && !wasQuoted) continue;
    if (width < 0) width = fields.length;
    if (header && columns === null) {columns = fields; continue;}
    if (fields.length < width) {
      errors.push({code:'short_row',line:recordLine,row:recordRow,fields:fields.length});
      while (fields.length < width) fields.push('');
    } else if (fields.length > width) errors.push({code:'long_row',line:recordLine,row:recordRow,extra:fields.splice(width)});
    rows.push(fields);
  }
  return {columns: header ? (columns ?? []) : null, rows, errors};
}

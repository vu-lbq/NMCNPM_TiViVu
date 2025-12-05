// Simple de-duplication utility for collapsing immediate repeats in STT outputs
// Example: "hello hello world" -> collapse immediate duplicate tokens
// and repeated short phrases like "xin chào xin chào" -> "xin chào"

/**
 * Collapse immediate repeated words or short phrases.
 * - Case-insensitive comparison, preserves original casing of first occurrence.
 * - Works on word tokens, then scans for 2-3 word repeated sequences.
 * @param {string} text
 * @returns {string}
 */
export function sanitizeStt(text) {
  if (!text || typeof text !== 'string') return text;
  const trimmed = text.trim();
  if (!trimmed) return trimmed;

  // Tokenize by whitespace, keep punctuation attached but normalize for matching
  const tokens = trimmed.split(/\s+/);
  if (tokens.length < 2) return trimmed;

  // Step 1: collapse immediate duplicate tokens (word-level)
  const collapsedTokens = [];
  for (let i = 0; i < tokens.length; i++) {
    const current = tokens[i];
    const prev = collapsedTokens[collapsedTokens.length - 1];
    if (!prev || normalize(prev) !== normalize(current)) {
      collapsedTokens.push(current);
    }
  }

  // Step 2: collapse immediate repeated short phrases (2-3 tokens)
  let resultTokens = collapsedTokens;
  resultTokens = collapseRepeatedSequence(resultTokens, 3);
  resultTokens = collapseRepeatedSequence(resultTokens, 2);

  return resultTokens.join(' ');
}

function normalize(s) {
  return s.toLowerCase().replace(/[.,!?;:]+$/g, '');
}

function collapseRepeatedSequence(tokens, n) {
  if (tokens.length < n * 2) return tokens;
  const out = [];
  let i = 0;
  while (i < tokens.length) {
    const seqA = tokens.slice(i, i + n);
    const seqB = tokens.slice(i + n, i + 2 * n);
    if (seqB.length === n && compareSeq(seqA, seqB)) {
      // keep only one occurrence of the sequence
      out.push(...seqA);
      i += n * 2;
    } else {
      out.push(tokens[i]);
      i += 1;
    }
  }
  return out;
}

function compareSeq(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (normalize(a[i]) !== normalize(b[i])) return false;
  }
  return true;
}

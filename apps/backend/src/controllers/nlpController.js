const aiService = require('../services/aiService');

// POST /translate { text, targetLang } -> { translated }
async function translateText(req, res) {
  try {
    const { text, targetLang = 'en' } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    const prompt = `You are a translation engine. Translate the input into ${targetLang} and return only the translation without extra commentary.\nInput: ${text}`;
    const translated = await aiService.simplePrompt(prompt);
    return res.status(200).json({ translated });
  } catch (err) {
    return res.status(500).json({ error: 'translate_failed', message: err.message });
  }
}

// GET /vocab/define?word=hello -> proxy to dictionaryapi.dev
async function defineWord(req, res) {
  try {
    const { word, lang = 'en' } = req.query || {};
    if (!word) return res.status(400).json({ error: 'Missing word' });
    const url = `https://api.dictionaryapi.dev/api/v2/entries/${encodeURIComponent(lang)}/${encodeURIComponent(word)}`;
    const r = await fetch(url);
    if (!r.ok) {
      const msg = await r.text();
      return res.status(r.status).json({ error: 'define_failed', message: msg });
    }
    const data = await r.json();
    // Reduce payload a bit
    const out = (Array.isArray(data) ? data : [data]).map(e => ({
      word: e.word,
      phonetic: e.phonetic,
      phonetics: e.phonetics?.map(p => ({ text: p.text, audio: p.audio })).filter(Boolean) || [],
      meanings: e.meanings?.map(m => ({ partOfSpeech: m.partOfSpeech, definitions: m.definitions?.slice(0,3) })) || []
    }));
    return res.status(200).json({ entries: out });
  } catch (err) {
    return res.status(500).json({ error: 'define_failed', message: err.message });
  }
}

module.exports = { translateText, defineWord };
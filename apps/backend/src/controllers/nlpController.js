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
    // Reduce payload and enrich with short Vietnamese meanings
    const arr = Array.isArray(data) ? data : [data];
    const entries = arr.map(e => ({
      word: e.word,
      phonetic: e.phonetic,
      phonetics: e.phonetics?.map(p => ({ text: p.text, audio: p.audio })).filter(Boolean) || [],
      meanings: e.meanings?.map(m => ({ partOfSpeech: m.partOfSpeech, definitions: (m.definitions || []).slice(0,3) })) || []
    }));

    // Build concise EN meanings (top 2 across parts of speech) to translate
    const enMeanings = [];
    for (const m of (entries[0]?.meanings || [])) {
      for (const d of (m.definitions || [])) {
        if (enMeanings.length < 2 && d?.definition) {
          enMeanings.push({ partOfSpeech: m.partOfSpeech, text: d.definition });
        }
      }
    }
    let viMeanings = [];
    if (enMeanings.length) {
      try {
        const textToTranslate = enMeanings.map(x => x.text).join('; ');
        const prompt = `Bạn là từ điển song ngữ. Hãy dịch NGẮN GỌN nghĩa của các định nghĩa tiếng Anh sau sang tiếng Việt (chỉ liệt kê nghĩa/chủ yếu là từ khóa, phân tách bằng dấu phẩy, không thêm diễn giải dài dòng, không thêm câu dẫn).\nĐịnh nghĩa: ${textToTranslate}`;
        const vi = await aiService.simplePrompt(prompt);
        // Split by comma/semicolon and trim; keep 1-2 items
        viMeanings = String(vi).split(/[;,]+/).map(s => s.trim()).filter(Boolean).slice(0, 2);
      } catch {}
    }

    return res.status(200).json({
      entries,
      enMeanings,
      viMeanings,
    });
  } catch (err) {
    return res.status(500).json({ error: 'define_failed', message: err.message });
  }
}

module.exports = { translateText, defineWord };
const os = require('os');
const path = require('path');
const fs = require('fs');
const { synthesize } = require('../services/ttsService');
const { transcribe } = require('../services/sttService');
const aiService = require('../services/aiService');
let OpenAI;
try {
  OpenAI = require('openai');
} catch {}

async function getClientSafe() {
  // Prefer shared aiService.getClient if available
  if (aiService && typeof aiService.getClient === 'function') {
    return aiService.getClient();
  }
  // Build a minimal OpenAI client directly as fallback
  if (OpenAI && process.env.OPENAI_API_KEY) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  throw new Error('OpenAI client unavailable: ensure aiService.getClient or OPENAI_API_KEY');
}

// POST /tts  { text, voice?, format? } -> audio binary
async function textToSpeech(req, res) {
  try {
    const { text, voice = 'alloy', format = 'mp3' } = req.body || {};
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing text' });
    }
    const client = await getClientSafe();
    const result = await synthesize({ text, voice, format, openaiClient: client });
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Length', result.buffer.length);
    return res.status(200).send(result.buffer);
  } catch (err) {
    return res.status(500).json({ error: 'tts_failed', message: err.message });
  }
}

// Accepts multipart/form-data with field `file` (audio). Optional `language`.
// POST /stt -> { text }
async function speechToText(req, res) {
  try {
    // For simplicity, accept base64 body or multipart but without multer, we support base64 in `audioBase64`.
    const { language, audioBase64, filename = `audio_${Date.now()}.wav` } = req.body || {};

    let tmpPath;
    if (audioBase64) {
      const tmpDir = os.tmpdir();
      tmpPath = path.join(tmpDir, filename);
      const buffer = Buffer.from(audioBase64, 'base64');
      fs.writeFileSync(tmpPath, buffer);
    } else if (req.file && req.file.path) {
      tmpPath = req.file.path;
    } else {
      return res.status(400).json({ error: 'Missing audio. Provide `audioBase64` or multipart `file`.' });
    }

    const client = await getClientSafe();
    const out = await transcribe({ filePath: tmpPath, openaiClient: client, language });
    // Cleanup tmp file if we created it
    try { if (audioBase64 && tmpPath) fs.unlinkSync(tmpPath); } catch {}
    return res.status(200).json({ text: out.text });
  } catch (err) {
    return res.status(500).json({ error: 'stt_failed', message: err.message });
  }
}

module.exports = { textToSpeech, speechToText };
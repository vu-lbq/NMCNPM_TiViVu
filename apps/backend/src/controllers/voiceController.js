const os = require('os');
const path = require('path');
const fs = require('fs');
const { synthesize, detectLanguage } = require('../services/ttsService');
const { transcribe } = require('../services/sttService');
const { Message, Conversation } = require('../models');
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
    const { text, voice = 'auto', format = 'mp3' } = req.body || {};
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing text' });
    }
    const client = await getClientSafe();
    const lang = detectLanguage(text);
    const result = await synthesize({ text, voice, format, openaiClient: client, language: lang });
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
// POST /voice-chat (auth)
// Body: { audioBase64, filename?, language?, voice?, format?, conversationId?, skipTts? }
// If skipTts=true, the endpoint will return early without synthesizing audio.
// Returns when skipTts=false: { transcript, replyText, audioBase64, contentType, conversationId }
// Returns when skipTts=true:  { transcript, replyText, conversationId }
async function voiceChat(req, res) {
  try {
    const { audioBase64, filename = `audio_${Date.now()}.webm`, language = 'auto', voice = 'auto', format = 'mp3', conversationId, skipTts } = req.body || {};
    if (!audioBase64) return res.status(400).json({ error: 'Missing audioBase64' });

    // Resolve conversation (find or create for user)
    let convo = null;
    if (conversationId) {
      convo = await Conversation.findOne({ where: { id: conversationId, userId: req.user.id } });
      if (!convo) return res.status(404).json({ error: 'Conversation not found' });
    } else {
      convo = await Conversation.create({ userId: req.user.id, title: 'New Chat' });
    }

    // Persist temp audio to file
    const tmpDir = os.tmpdir();
    const tmpPath = path.join(tmpDir, filename);
    const buffer = Buffer.from(audioBase64, 'base64');
    fs.writeFileSync(tmpPath, buffer);

    const client = await getClientSafe();
    // STT
    const out = await transcribe({ filePath: tmpPath, openaiClient: client, language });
    const transcript = (out?.text || '').trim();

    try { fs.unlinkSync(tmpPath); } catch {}

    // Save user message
    const userMsg = await Message.create({ role: 'user', content: transcript, conversationId: convo.id, userId: req.user.id });

    // AI reply
    let replyText = '';
    try {
      replyText = await aiService.generateAssistantReply(
        convo.id,
        transcript,
        {
          extraSystemPrompt: 'Voice mode: Answer in ≤3 sentences. Keep responses concise and quick for audio playback.',
          maxTokens: Number(process.env.VOICECHAT_MAX_TOKENS || process.env.OPENAI_MAX_TOKENS || 192)
        }
      );
    } catch (e) {
      replyText = 'Sorry, I could not generate a reply right now.';
    }

    const assistantMsg = await Message.create({ role: 'assistant', content: replyText, conversationId: convo.id, userId: req.user.id });

    // Auto-title if generic
    try {
      const currentTitle = (convo.title || '').trim();
      const isGeneric = currentTitle === '' || /^(new\s+chat|new\s+conversation)$/i.test(currentTitle);
      if (isGeneric) {
        const newTitle = await aiService.generateConversationTitle(convo.id);
        if (newTitle) { convo.title = newTitle; await convo.save(); }
      }
    } catch {}

    // If client requests to skip TTS here, return early so client can call /tts separately
    const shouldSkipTts = typeof skipTts === 'string' ? /^(true|1)$/i.test(skipTts) : !!skipTts;
    if (shouldSkipTts) {
      return res.status(200).json({ transcript, replyText, conversationId: convo.id });
    }

    // TTS
    const replyLang = language === 'auto' ? detectLanguage(replyText) : language;
    const tts = await synthesize({ text: replyText, voice, format, openaiClient: client, language: replyLang });
    const audioB64 = tts.buffer.toString('base64');
    const contentType = tts.contentType;
    return res.status(200).json({ transcript, replyText, audioBase64: audioB64, contentType, conversationId: convo.id });
  } catch (err) {
    return res.status(500).json({ error: 'voice_chat_failed', message: err.message });
  }
}

module.exports.voiceChat = voiceChat;
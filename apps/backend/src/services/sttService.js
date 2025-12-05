const fs = require('fs');

// Uses OpenAI Whisper (`whisper-1`) transcription via the Audio API
// OPENAI Whisper docs: https://platform.openai.com/docs/api-reference/audio/create-transcriptions
// this function is used for speech-to-text transcription of audio files
async function transcribe({ filePath, openaiClient, model = 'whisper-1', language }) {
  if (!openaiClient) throw new Error('OpenAI client not configured');
  if (!filePath || !fs.existsSync(filePath)) throw new Error('Audio file missing');
  try {
    if (openaiClient.audio && openaiClient.audio.transcriptions && typeof openaiClient.audio.transcriptions.create === 'function') {
      const file = fs.createReadStream(filePath);
      const args = { file, model };
      if (language && language !== 'auto') args.language = language;
      const resp = await openaiClient.audio.transcriptions.create(args);
      // OpenAI SDK returns an object with `text`
      return { text: resp.text || resp?.data?.text || '' };
    }
    // Fallback: just say unsupported
    return { text: '[stt unavailable: install OpenAI audio API]' };
  } catch (err) {
    throw err;
  }
}

module.exports = { transcribe };
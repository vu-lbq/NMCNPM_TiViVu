const fs = require('fs');

// Sử dụng OpenAI Whisper (`whisper-1`) để chuyển giọng nói thành văn bản qua Audio API
// Tài liệu Whisper: https://platform.openai.com/docs/api-reference/audio/create-transcriptions
// Hàm này dùng để chuyển đổi audio (STT - speech-to-text)
async function transcribe({ filePath, openaiClient, model = 'whisper-1', language }) {
  if (!openaiClient) throw new Error('OpenAI client not configured');
  if (!filePath || !fs.existsSync(filePath)) throw new Error('Audio file missing');
  try {
    if (openaiClient.audio && openaiClient.audio.transcriptions && typeof openaiClient.audio.transcriptions.create === 'function') {
      const file = fs.createReadStream(filePath);
      const args = { file, model };
      if (language && language !== 'auto') args.language = language;
      const resp = await openaiClient.audio.transcriptions.create(args);
      // OpenAI SDK trả về đối tượng có thuộc tính `text`
      return { text: resp.text || resp?.data?.text || '' };
    }
    // Dự phòng: thông báo chưa hỗ trợ
    return { text: '[stt unavailable: install OpenAI audio API]' };
  } catch (err) {
    throw err;
  }
}

module.exports = { transcribe };
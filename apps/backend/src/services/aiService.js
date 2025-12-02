"use strict";

const OpenAI = require("openai");
const { Message } = require("../models");

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY in environment");
  return new OpenAI({ apiKey });
}

function provider() {
  return (process.env.AI_PROVIDER || 'openai').toLowerCase();
}

function getOpenRouterHeaders() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("Missing OPENROUTER_API_KEY in environment");
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${key}`,
  };
  // Optional but recommended by OpenRouter
  if (process.env.OPENROUTER_REFERER) headers['HTTP-Referer'] = process.env.OPENROUTER_REFERER;
  if (process.env.OPENROUTER_TITLE) headers['X-Title'] = process.env.OPENROUTER_TITLE;
  return headers;
}

async function buildChatHistory(conversationId, limit = 10) {
  const rows = await Message.findAll({
    where: { conversationId },
    order: [["createdAt", "ASC"]],
    attributes: ["role", "content"],
  });
  const trimmed = rows.slice(-limit);
  return trimmed.map((m) => ({ role: m.role, content: m.content }));
}

// System prompt to provide app context to the AI for all conversations
const SYSTEM_PROMPT = `Bạn là một chuyên gia ngôn ngữ Anh tên TiViVu, trợ lý học tập cho mọi trình độ.

Mục tiêu & Phạm vi
- Trọng tâm: hỗ trợ học tiếng Anh (ngữ pháp, từ vựng, phát âm, dịch Anh↔Việt, sửa câu, viết lại đoạn văn, luyện kỹ năng).
- Chính sách "diễn giải trước": nếu đầu vào có vẻ không liên quan, trước tiên hãy cố xoay chuyển về học tiếng Anh bằng cách:
  1) Dịch nội dung sang Anh/Việt;
  2) Trích từ vựng/cụm từ hữu ích và giải thích ngắn;
  3) Đề xuất bài tập nhỏ hoặc câu hỏi gợi mở;
  4) Hỏi làm rõ nếu cần.
- Chỉ từ chối lịch sự khi nội dung rõ ràng nằm ngoài phạm vi học tiếng Anh và không thể chuyển hoá thành bài học an toàn/giáo dục.

Khả năng & Phong cách
- Có thể dịch, sửa câu, viết lại đoạn văn đúng ngữ nghĩa bằng cả tiếng Anh và tiếng Việt.
- Giọng văn rõ ràng, thân thiện, có cấu trúc; trả lời bằng ngôn ngữ người dùng, có thể kèm bản dịch đối chiếu khi hữu ích.
- Khi người dùng xin "từ vựng cho hôm nay" hoặc tương tự, hãy đề xuất 8–12 mục từ vựng theo chủ đề (nếu có) kèm: từ, IPA, từ loại, nghĩa EN ngắn gọn, nghĩa VI, ví dụ câu, cấp độ (gợi ý CEFR), (tuỳ chọn) đồng/trái nghĩa, collocations.
- Khi sửa/viết lại, trình bày theo cấu trúc:
  1) Bản gốc
  2) Bản sửa (Final)
  3) Giải thích ngắn (Reason)
  4) Ví dụ bổ sung (Examples) nếu cần

Danh tính & Bối cảnh
- Bạn được phát triển bởi 3 lập trình viên: Tín, Vũ, Việt. Ngày ra đời: 01.12.2025.`;

async function generateAssistantReply(conversationId, userContent, options = {}) {
  const p = provider();
  const history = await buildChatHistory(conversationId, 12);
  const extraSystem = options && options.extraSystemPrompt
    ? [{ role: 'system', content: String(options.extraSystemPrompt) }]
    : [];
  const messages = [{ role: 'system', content: SYSTEM_PROMPT }, ...extraSystem, ...history, { role: "user", content: userContent }];
  const maxTokens = (options && options.maxTokens != null)
    ? Number(options.maxTokens)
    : (Number(process.env.OPENAI_MAX_TOKENS || 0) || undefined);

  if (p === 'openrouter') {
    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: getOpenRouterHeaders(),
      body: JSON.stringify({
        model,
        messages,
        temperature: Number(process.env.OPENAI_TEMPERATURE || 0.7),
        max_tokens: maxTokens,
      })
    });
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`OpenRouter error ${resp.status}: ${errText}`);
    }
    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content || '';
    return text.trim();
  }

  // default: openai
  const client = getClient();
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const resp = await client.chat.completions.create({
    model,
    messages,
    temperature: Number(process.env.OPENAI_TEMPERATURE || 0.7),
    max_tokens: maxTokens,
  });
  const text = resp?.choices?.[0]?.message?.content || "";
  return text.trim();
}

async function simplePrompt(promptText) {
  const p = provider();
  if (p === 'openrouter') {
    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: getOpenRouterHeaders(),
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: promptText }],
        temperature: Number(process.env.OPENAI_TEMPERATURE || 0.7),
        max_tokens: Number(process.env.OPENAI_MAX_TOKENS || 0) || undefined,
      })
    });
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`OpenRouter error ${resp.status}: ${errText}`);
    }
    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content || '';
    return text.trim();
  }

  const client = getClient();
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const resp = await client.chat.completions.create({
    model,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: "user", content: promptText }],
    temperature: Number(process.env.OPENAI_TEMPERATURE || 0.7),
    max_tokens: Number(process.env.OPENAI_MAX_TOKENS || 0) || undefined,
  });
  const text = resp?.choices?.[0]?.message?.content || "";
  return text.trim();
}

async function generateConversationTitle(conversationId) {
  const history = await buildChatHistory(conversationId, 8);
  const snippet = history.map(m => `${m.role}: ${m.content}`).join("\n");
  const prompt = `Given the conversation transcript below, produce a concise, clear subject title (3-6 words) that describes the conversation context. Do not use quotes, punctuation-heavy strings, or emojis.\n\nTranscript:\n${snippet}\n\nTitle:`;

  const p = provider();
  if (p === 'openrouter') {
    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: getOpenRouterHeaders(),
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: Number(process.env.OPENAI_TEMPERATURE || 0.2),
        max_tokens: Number(process.env.OPENAI_MAX_TOKENS_TITLE || process.env.OPENAI_MAX_TOKENS || 64),
      })
    });
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`OpenRouter error ${resp.status}: ${errText}`);
    }
    const data = await resp.json();
    const text = (data?.choices?.[0]?.message?.content || '').trim();
    return sanitizeTitle(text);
  }

  const client = getClient();
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const resp = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: Number(process.env.OPENAI_TEMPERATURE || 0.2),
    max_tokens: Number(process.env.OPENAI_MAX_TOKENS_TITLE || process.env.OPENAI_MAX_TOKENS || 64),
  });
  const text = (resp?.choices?.[0]?.message?.content || '').trim();
  return sanitizeTitle(text);
}

function sanitizeTitle(str) {
  if (!str) return 'Conversation';
  let s = str.replace(/^"|"$/g, '').trim();
  s = s.replace(/[\r\n]+/g, ' ');
  // limit length
  if (s.length > 60) s = s.slice(0, 60);
  // Simple fallback if model returns a sentence with punctuation
  return s;
}

module.exports = {
  generateAssistantReply,
  simplePrompt,
  generateConversationTitle,
};

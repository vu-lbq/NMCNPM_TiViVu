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

async function generateAssistantReply(conversationId, userContent) {
  const p = provider();
  const history = await buildChatHistory(conversationId, 12);
  const messages = [...history, { role: "user", content: userContent }];

  if (p === 'openrouter') {
    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: getOpenRouterHeaders(),
      body: JSON.stringify({ model, messages, temperature: Number(process.env.OPENAI_TEMPERATURE || 0.7) })
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
        messages: [{ role: 'user', content: promptText }],
        temperature: Number(process.env.OPENAI_TEMPERATURE || 0.7)
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
    messages: [{ role: "user", content: promptText }],
    temperature: Number(process.env.OPENAI_TEMPERATURE || 0.7),
  });
  const text = resp?.choices?.[0]?.message?.content || "";
  return text.trim();
}

module.exports = {
  generateAssistantReply,
  simplePrompt,
};

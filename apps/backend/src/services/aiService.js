"use strict";

const OpenAI = require("openai");
const { Message } = require("../models");

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY in environment");
  return new OpenAI({ apiKey });
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
  const client = getClient();
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const history = await buildChatHistory(conversationId, 12);
  const messages = [...history, { role: "user", content: userContent }];

  const resp = await client.chat.completions.create({
    model,
    messages,
    temperature: Number(process.env.OPENAI_TEMPERATURE || 0.7),
  });

  const text = resp?.choices?.[0]?.message?.content || "";
  return text.trim();
}

module.exports = {
  generateAssistantReply,
};

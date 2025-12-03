"use strict";

const { Vocabulary } = require('../models');
const aiService = require('../services/aiService');

// GET /vocab -> list items for current user (newest first)
async function listVocab(req, res) {
  try {
    const items = await Vocabulary.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json({ items });
  } catch (err) {
    return res.status(500).json({ error: 'vocab_list_failed', message: err.message });
  }
}

// POST /vocab { word, lang?, meaningVi?, notes?, source? }
async function addVocab(req, res) {
  try {
    let { word, lang = 'en', meaningVi, notes, source, phonetics } = req.body || {};
    if (!word || typeof word !== 'string') {
      return res.status(400).json({ error: 'Missing word' });
    }
    word = word.trim();
    const tokens = word.split(/\s+/).filter(Boolean);
    // Enforce: only single English words allowed
    if (lang !== 'en' || tokens.length !== 1 || /[^a-zA-Z'-]/.test(tokens[0])) {
      return res.status(400).json({ error: 'Only single English words can be saved' });
    }

    // If meaningVi missing and lang is en, try to translate the word or the shortest definition
    if (!meaningVi) {
      try {
        const prompt = `You are a bilingual glossary helper. Provide a concise Vietnamese meaning for the English headword below. Return only the short Vietnamese meaning (a few comma-separated synonyms if applicable), no extra text.\nHeadword: ${word}`;
        meaningVi = await aiService.simplePrompt(prompt);
      } catch {}
    }

    // If phonetics missing, try to fetch from dictionaryapi.dev quickly
    if (!phonetics) {
      try {
        const url = `https://api.dictionaryapi.dev/api/v2/entries/${encodeURIComponent('en')}/${encodeURIComponent(word)}`;
        const r = await fetch(url);
        if (r.ok) {
          const data = await r.json();
          const arr = Array.isArray(data) ? data : [data];
          // Prefer entry.phonetic; fallback to first phonetics.text
          const first = arr[0];
          const fromMain = first && typeof first.phonetic === 'string' ? first.phonetic : null;
          const fromList = first && Array.isArray(first.phonetics) ? (first.phonetics.find(p => p && typeof p.text === 'string')?.text || null) : null;
          phonetics = fromMain || fromList || null;
        }
      } catch {}
    }

    // Upsert by (userId, word, lang)
    const [item, created] = await Vocabulary.findOrCreate({
      where: { userId: req.user.id, word, lang },
      defaults: { userId: req.user.id, word, lang, meaningVi: meaningVi || null, notes: notes || null, source: source || null, phonetics: phonetics || null },
    });
    if (!created) {
      // Update meaning/notes if provided
      if (meaningVi) item.meaningVi = meaningVi;
      if (notes) item.notes = notes;
      if (source) item.source = source;
      if (phonetics) item.phonetics = phonetics;
      await item.save();
    }
    return res.status(201).json({ item });
  } catch (err) {
    return res.status(500).json({ error: 'vocab_add_failed', message: err.message });
  }
}

// DELETE /vocab/:id
async function removeVocab(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    const count = await Vocabulary.destroy({ where: { id, userId: req.user.id } });
    return res.status(200).json({ removed: count });
  } catch (err) {
    return res.status(500).json({ error: 'vocab_remove_failed', message: err.message });
  }
}

module.exports = { listVocab, addVocab, removeVocab };

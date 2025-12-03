const express = require('express');
const router = express.Router();
const controller = require('../controllers/controller');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const conversationRouter = require('./conversationRouter');
const aiController = require('../controllers/aiController');
const voiceController = require('../controllers/voiceController');
const nlpController = require('../controllers/nlpController');
const vocabController = require('../controllers/vocabController');
const passwordController = require('../controllers/passwordController');
const feedbackController = require('../controllers/feedbackController');
const adminController = require('../controllers/adminController');
const { ensureAdmin } = require('../middlewares/auth');

router.get('/status', (req, res) => {
  res.send('API is running');
});

// Redirect home '/' to '/login'
router.get('/', (req, res) => {
  res.redirect('/login');
});

// Login routes
router.get('/login', controller.getLogin);
router.post('/login', authController.postLogin);
router.post('/register', authController.postRegister);
router.get('/me', authenticate, authController.getMe);

// Forgot/Reset password
router.post('/auth/forgot-password', passwordController.forgotPassword);
router.get('/auth/reset', passwordController.showReset);
router.post('/auth/reset', passwordController.resetPassword);

// Feedback (anonymous allowed)
router.post('/feedback', feedbackController.create);

// Admin API
router.get('/admin/stats', authenticate, ensureAdmin, adminController.stats);
router.get('/admin/users', authenticate, ensureAdmin, adminController.listUsers);
router.post('/admin/users', authenticate, ensureAdmin, adminController.createUser);
router.delete('/admin/users/:id', authenticate, ensureAdmin, adminController.deleteUser);
router.post('/admin/users/:id/toggle-role', authenticate, ensureAdmin, adminController.toggleRole);
router.get('/admin/feedback', authenticate, ensureAdmin, adminController.listFeedback);
router.delete('/admin/feedback/:id', authenticate, ensureAdmin, adminController.deleteFeedback);

// Conversations + Messages API (protected)
router.use('/conversations', conversationRouter);

// Simple AI ping test (unprotected; add auth if desired)
router.get('/ai/test', aiController.test);

// TTS/STT endpoints
router.post('/tts', authenticate, voiceController.textToSpeech);
router.post('/stt', authenticate, voiceController.speechToText);
router.post('/voice-chat', authenticate, voiceController.voiceChat);

// Translation and dictionary
router.post('/translate', authenticate, nlpController.translateText);
router.get('/vocab/define', authenticate, nlpController.defineWord);

// Vocabulary save/list/remove
router.get('/vocab', authenticate, vocabController.listVocab);
router.post('/vocab', authenticate, vocabController.addVocab);
router.delete('/vocab/:id', authenticate, vocabController.removeVocab);

module.exports = router;
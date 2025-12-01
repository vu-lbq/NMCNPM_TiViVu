const express = require('express');
const router = express.Router();
const controller = require('../controllers/controller');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const conversationRouter = require('./conversationRouter');
const aiController = require('../controllers/aiController');
const voiceController = require('../controllers/voiceController');
const nlpController = require('../controllers/nlpController');

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

// Conversations + Messages API (protected)
router.use('/conversations', conversationRouter);

// Simple AI ping test (unprotected; add auth if desired)
router.get('/ai/test', aiController.test);

// TTS/STT endpoints
router.post('/tts', authenticate, voiceController.textToSpeech);
router.post('/stt', authenticate, voiceController.speechToText);

// Translation and dictionary
router.post('/translate', authenticate, nlpController.translateText);
router.get('/vocab/define', authenticate, nlpController.defineWord);

module.exports = router;
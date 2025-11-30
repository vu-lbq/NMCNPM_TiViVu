const express = require('express');
const router = express.Router();
const controller = require('../controllers/controller');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const conversationRouter = require('./conversationRouter');
const aiController = require('../controllers/aiController');

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

module.exports = router;
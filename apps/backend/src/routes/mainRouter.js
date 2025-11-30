const express = require('express');
const router = express.Router();
const controller = require('../controllers/controller');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

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

module.exports = router;
const express = require('express');
const router = express.Router();
const controller = require('../controllers/controller');

router.get('/status', (req, res) => {
  res.send('API is running');
});

// Redirect home '/' to '/login'
router.get('/', (req, res) => {
  res.redirect('/login');
});

// Login routes
router.get('/login', controller.getLogin);
router.post('/login', controller.postLogin);

module.exports = router;
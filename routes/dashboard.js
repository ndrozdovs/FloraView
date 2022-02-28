const express = require('express');
const router = express.Router();
const mainPages = require('../controllers/dashboard');
const {
  isLoggedIn
} = require('../middleware');

router.get("/", isLoggedIn, mainPages.renderHome);

router.get("/guide", isLoggedIn, mainPages.renderGuide);

router.get("/support", isLoggedIn, mainPages.renderSupport);

module.exports = router;
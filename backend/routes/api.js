const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.post('/start-game', gameController.startNewGame);
router.post('/validate', gameController.validateCharacter);
router.post('/submit-score', gameController.submitScore);
router.get('/high-scores', gameController.getHighScores);
router.post('/hint', gameController.getHint);
router.get('/daily-challenge', gameController.getDailyChallenge);
router.post('/validate-daily', gameController.validateDailyChallenge);
router.get('/available-images', gameController.getAvailableImages);
router.post('/select-image', gameController.selectImage);

module.exports = router;
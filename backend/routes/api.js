const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.post('/validate', gameController.validateCharacter);
router.post('/submit-score', gameController.submitScore);
router.get('/high-scores', gameController.getHighScores);

router.get('/available-images', gameController.getAvailableImages);
router.post('/select-image', gameController.selectImage);

module.exports = router;
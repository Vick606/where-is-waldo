import express from 'express';
import * as gameController from '../controllers/gameController.js';
import { validate, schemas } from '../middleware/validation.js';

const router = express.Router();

router.post('/start-game', validate(schemas.startNewGame), gameController.startNewGame);
router.post('/validate', validate(schemas.validateCharacter), gameController.validateCharacter);
router.post('/submit-score', validate(schemas.submitScore), gameController.submitScore);
router.get('/high-scores', gameController.getHighScores);
router.post('/hint', validate(schemas.getHint), gameController.getHint);
router.get('/daily-challenge', gameController.getDailyChallenge);
router.post('/validate-daily', validate(schemas.validateCharacter), gameController.validateDailyChallenge);
router.get('/available-images', gameController.getAvailableImages);
router.post('/select-image', validate(schemas.selectImage), gameController.selectImage);

export default router;
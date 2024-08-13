import crypto from 'crypto';
import { Random } from 'random-js';
import { fetchRandomImages } from '../services/imageService.mjs';

const difficultyLevels = {
  easy: { characters: 3, radius: 50 },
  medium: { characters: 4, radius: 40 },
  hard: { characters: 5, radius: 30 },
};

let currentDifficulty = 'easy';
let characterPositions = {};
let availableImages = [];
let highScores = [];
let dailyChallenge = null;
let dailyChallengeDate = null;
const hintPenalty = 10; // 10 seconds penalty for using a hint

function distanceBetweenPoints(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function generateCharacterPositions(difficulty, imageWidth = 1000, imageHeight = 600) {
  const { characters, radius } = difficultyLevels[difficulty];
  const newPositions = {};
  const characterNames = ['Waldo', 'Wizard', 'Wilma', 'Odlaw', 'Wenda'];

  for (let i = 0; i < characters; i++) {
    newPositions[characterNames[i]] = {
      x: Math.floor(Math.random() * imageWidth),
      y: Math.floor(Math.random() * imageHeight),
      radius: radius,
    };
  }

  return newPositions;
}

function generateDailyChallenge() {
  const today = new Date().toISOString().split('T')[0];
  if (dailyChallengeDate !== today) {
    const seed = crypto.createHash('md5').update(today).digest('hex');
    const seedNumber = parseInt(seed.substr(0, 8), 16);
    const random = new (require('random-js').Random)(seedNumber);

    dailyChallenge = {
      difficulty: Object.keys(difficultyLevels)[random.integer(0, 2)],
      positions: {},
    };

    const { characters, radius } = difficultyLevels[dailyChallenge.difficulty];
    const characterNames = ['Waldo', 'Wizard', 'Wilma', 'Odlaw', 'Wenda'];

    for (let i = 0; i < characters; i++) {
      dailyChallenge.positions[characterNames[i]] = {
        x: random.integer(0, 1000),
        y: random.integer(0, 600),
        radius: radius,
      };
    }

    dailyChallengeDate = today;
  }

  return dailyChallenge;
}

exports.startNewGame = (req, res) => {
  const { difficulty } = req.body;
  if (difficultyLevels[difficulty]) {
    currentDifficulty = difficulty;
    characterPositions = generateCharacterPositions(difficulty);
    res.json({ message: 'New game started', difficulty, characterCount: Object.keys(characterPositions).length });
  } else {
    res.status(400).json({ error: 'Invalid difficulty level' });
  }
};

exports.validateCharacter = (req, res) => {
  const { character, x, y } = req.body;
  const characterPos = characterPositions[character];

  if (!characterPos) {
    return res.status(400).json({ error: 'Invalid character' });
  }

  const distance = distanceBetweenPoints(x, y, characterPos.x, characterPos.y);
  const isCorrect = distance <= characterPos.radius;

  res.json({ isCorrect });
};

exports.submitScore = (req, res) => {
  const { playerName, timeTaken, hintsUsed } = req.body;
  const adjustedTime = timeTaken + (hintsUsed * hintPenalty);
  highScores.push({ playerName, timeTaken: adjustedTime, hintsUsed });
  highScores.sort((a, b) => a.timeTaken - b.timeTaken);
  highScores = highScores.slice(0, 10); // Keep only top 10 scores
  res.status(201).json({ message: 'Score submitted successfully' });
};

exports.getHighScores = (req, res) => {
  res.json(highScores);
};

exports.getHint = (req, res) => {
  const { character } = req.body;
  const characterPos = characterPositions[character];

  if (!characterPos) {
    return res.status(400).json({ error: 'Invalid character' });
  }

  const hint = {
    message: `${character} is in the ${getQuadrant(characterPos.x, characterPos.y)} of the image.`,
    penalty: hintPenalty,
  };

  res.json(hint);
};

function getQuadrant(x, y) {
  if (x < 500 && y < 300) return 'top-left quarter';
  if (x >= 500 && y < 300) return 'top-right quarter';
  if (x < 500 && y >= 300) return 'bottom-left quarter';
  return 'bottom-right quarter';
}

exports.getDailyChallenge = (req, res) => {
  const challenge = generateDailyChallenge();
  res.json({
    difficulty: challenge.difficulty,
    characterCount: Object.keys(challenge.positions).length,
  });
};

exports.validateDailyChallenge = (req, res) => {
  const { character, x, y } = req.body;
  const challenge = generateDailyChallenge();
  const characterPos = challenge.positions[character];

  if (!characterPos) {
    return res.status(400).json({ error: 'Invalid character' });
  }

  const distance = distanceBetweenPoints(x, y, characterPos.x, characterPos.y);
  const isCorrect = distance <= characterPos.radius;

  res.json({ isCorrect });
};

exports.getAvailableImages = async (req, res) => {
  if (availableImages.length === 0) {
    availableImages = await fetchRandomImages();
  }
  res.json(availableImages);
};

exports.selectImage = (req, res) => {
  const { imageId } = req.body;
  const selectedImage = availableImages.find(img => img.id === imageId);
  if (selectedImage) {
    characterPositions = generateCharacterPositions(currentDifficulty);
    res.json({ message: 'Image selected', image: selectedImage, characterCount: Object.keys(characterPositions).length });
  } else {
    res.status(400).json({ error: 'Invalid image selection' });
  }
};

export {
  startNewGame,
  validateCharacter,
  submitScore,
  getHighScores,
  getHint,
  getDailyChallenge,
  validateDailyChallenge,
  getAvailableImages,
  selectImage
};
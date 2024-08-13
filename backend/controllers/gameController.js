const difficultyLevels = {
    easy: { characters: 3, radius: 50 },
    medium: { characters: 4, radius: 40 },
    hard: { characters: 5, radius: 30 },
  };
  
  let currentDifficulty = 'easy';
  let characterPositions = {};
  
  function generateCharacterPositions(difficulty) {
    const { characters, radius } = difficultyLevels[difficulty];
    const newPositions = {};
    const characterNames = ['Waldo', 'Wizard', 'Wilma', 'Odlaw', 'Wenda'];
  
    for (let i = 0; i < characters; i++) {
      newPositions[characterNames[i]] = {
        x: Math.floor(Math.random() * 1000),
        y: Math.floor(Math.random() * 600),
        radius: radius,
      };
    }
  
    return newPositions;
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
  
  // Update the validateCharacter function
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
    const { playerName, timeTaken } = req.body;
    highScores.push({ playerName, timeTaken });
    highScores.sort((a, b) => a.timeTaken - b.timeTaken);
    highScores = highScores.slice(0, 10); // Keep only top 10 scores
    res.status(201).json({ message: 'Score submitted successfully' });
  };
  
  exports.getHighScores = (req, res) => {
    res.json(highScores);
  };
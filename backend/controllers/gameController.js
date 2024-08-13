const characterPositions = {
    Waldo: { x: 500, y: 300, radius: 50 },
    Wizard: { x: 800, y: 400, radius: 50 },
    Wilma: { x: 200, y: 500, radius: 50 },
  };
  
  let highScores = [];
  
  function distanceBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }
  
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
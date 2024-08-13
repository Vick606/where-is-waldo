const gameImage = document.getElementById('game-image');
const targetingBox = document.getElementById('targeting-box');
const characterList = document.getElementById('character-list');
const gameContainer = document.getElementById('game-container');

let startTime;
let foundCharacters = [];
let currentDifficulty = 'easy';
let hintsUsed = 0;

async function loadAvailableImages() {
  try {
    const response = await fetch('/api/available-images');
    if (!response.ok) {
      throw new Error('Failed to load available images');
    }
    const images = await response.json();
    displayImageSelection(images);
  } catch (error) {
    console.error('Error loading available images:', error);
    showFeedback('Failed to load images. Please try again.');
  }
}

function displayImageSelection(images) {
  const container = document.createElement('div');
  container.id = 'image-selection';
  container.innerHTML = '<h2>Select an Image</h2>';
  
  images.forEach(image => {
    const imgElement = document.createElement('img');
    imgElement.src = image.url;
    imgElement.alt = `Photo by ${image.photographer}`;
    imgElement.addEventListener('click', () => selectImage(image.id));
    container.appendChild(imgElement);
  });
  
  document.body.appendChild(container);
}

async function selectImage(imageId) {
  try {
    const response = await fetch('/api/select-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageId }),
    });
    if (!response.ok) {
      throw new Error('Failed to select image');
    }
    const data = await response.json();
    document.getElementById('image-selection').remove();
    gameImage.src = data.image.url;
    startGame(data.characterCount);
  } catch (error) {
    console.error('Error selecting image:', error);
    showFeedback('Failed to select image. Please try again.');
  }
}

async function startGame(characterCount) {
  try {
    const response = await fetch('/api/start-game', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ difficulty: currentDifficulty }),
    });
    if (!response.ok) {
      throw new Error('Failed to start game');
    }
    const gameData = await response.json();
    
    gameContainer.style.display = 'block';
    startTime = new Date();
    foundCharacters = [];
    hintsUsed = 0;
    updateCharacterList(characterCount);
    
    console.log('Game started:', gameData);
  } catch (error) {
    console.error('Error starting game:', error);
    showFeedback('Failed to start game. Please try again.');
  }
}

function updateCharacterList(characterCount) {
  // Instead of fetching characters, we'll create a list based on the character count
  const characters = ['Waldo', 'Wizard', 'Wilma', 'Odlaw', 'Wenda'].slice(0, characterCount);
  characterList.innerHTML = characters
    .map(char => `<li class="${foundCharacters.includes(char) ? 'found' : ''}">${char}</li>`)
    .join('');
}

function normalizeCoordinates(x, y) {
  const imageWidth = gameImage.naturalWidth;
  const imageHeight = gameImage.naturalHeight;
  const displayWidth = gameImage.width;
  const displayHeight = gameImage.height;

  const normalizedX = (x / displayWidth) * imageWidth;
  const normalizedY = (y / displayHeight) * imageHeight;

  return { x: normalizedX, y: normalizedY };
}

gameImage.addEventListener('click', (e) => {
  const rect = gameImage.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const normalizedCoords = normalizeCoordinates(x, y);

  targetingBox.style.left = `${x - 50}px`;
  targetingBox.style.top = `${y - 50}px`;
  targetingBox.classList.remove('hidden');

  console.log(`Normalized coordinates: x=${normalizedCoords.x}, y=${normalizedCoords.y}`);
});

document.addEventListener('click', (e) => {
  if (!targetingBox.contains(e.target) && e.target !== gameImage) {
    targetingBox.classList.add('hidden');
  }
});

characterList.addEventListener('click', async (e) => {
  if (e.target.tagName === 'LI') {
    const character = e.target.textContent;
    const rect = gameImage.getBoundingClientRect();
    const x = parseInt(targetingBox.style.left) + 50 - rect.left;
    const y = parseInt(targetingBox.style.top) + 50 - rect.top;
    const normalizedCoords = normalizeCoordinates(x, y);

    const isCorrect = await validateCharacter(character, normalizedCoords.x, normalizedCoords.y);

    if (isCorrect) {
      foundCharacters.push(character);
      placeMarker(x, y, character);
      updateCharacterList();
      checkGameCompletion();
    } else {
      showFeedback('Incorrect. Try again!');
    }

    targetingBox.classList.add('hidden');
  }
});

async function validateCharacter(character, x, y) {
  const response = await fetch('/api/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ character, x, y }),
  });
  const data = await response.json();
  return data.isCorrect;
}

function placeMarker(x, y, character) {
  const marker = document.createElement('div');
  marker.className = 'character-marker';
  marker.style.left = `${x - 25}px`;
  marker.style.top = `${y - 25}px`;
  marker.textContent = character[0]; // First letter of character name
  gameImage.parentElement.appendChild(marker);
}

function showFeedback(message) {
  const feedback = document.createElement('div');
  feedback.className = 'feedback';
  feedback.textContent = message;
  document.body.appendChild(feedback);
  setTimeout(() => feedback.remove(), 2000);
}

function checkGameCompletion() {
  fetch(`/api/characters?difficulty=${currentDifficulty}`)
    .then(response => response.json())
    .then(characters => {
      if (foundCharacters.length === characters.length) {
        const endTime = new Date();
        const timeTaken = (endTime - startTime) / 1000; // in seconds
        showScorePopup(timeTaken);
      }
    });
}

async function showScorePopup(timeTaken) {
  const popup = document.createElement('div');
  popup.className = 'score-popup';
  popup.innerHTML = `
    <h2>Congratulations!</h2>
    <p>You found all characters in ${timeTaken.toFixed(2)} seconds.</p>
    <p>Hints used: ${hintsUsed}</p>
    <input type="text" id="player-name" placeholder="Enter your name">
    <button id="submit-score">Submit Score</button>
  `;
  document.body.appendChild(popup);

  document.getElementById('submit-score').addEventListener('click', async () => {
    const playerName = document.getElementById('player-name').value;
    if (playerName) {
      await submitScore(playerName, timeTaken);
      popup.remove();
      showHighScores();
    }
  });
}

async function submitScore(playerName, timeTaken) {
  try {
    const response = await fetch('/api/submit-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerName, timeTaken, hintsUsed }),
    });
    if (!response.ok) {
      throw new Error('Failed to submit score');
    }
  } catch (error) {
    console.error('Error submitting score:', error);
    showFeedback('Failed to submit score. Please try again.');
  }
}

async function showHighScores() {
  try {
    const response = await fetch('/api/high-scores');
    const highScores = await response.json();

    const scoreBoard = document.createElement('div');
    scoreBoard.className = 'high-scores';
    scoreBoard.innerHTML = `
      <h2>High Scores</h2>
      <ol>
        ${highScores.map(score => `<li>${score.playerName}: ${score.timeTaken.toFixed(2)}s (Hints: ${score.hintsUsed})</li>`).join('')}
      </ol>
      <button id="play-again">Play Again</button>
    `;
    document.body.appendChild(scoreBoard);

    document.getElementById('play-again').addEventListener('click', () => {
      scoreBoard.remove();
      loadAvailableImages();
    });
  } catch (error) {
    console.error('Error fetching high scores:', error);
  }
}

async function getHint() {
  const response = await fetch('/api/hint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ character: characterList.querySelector('li:not(.found)').textContent }),
  });
  const data = await response.json();
  hintsUsed++;
  showFeedback(data.message);
}

async function startDailyChallenge() {
  try {
    const response = await fetch('/api/daily-challenge');
    if (!response.ok) {
      throw new Error('Failed to start daily challenge');
    }
    const data = await response.json();
    currentDifficulty = data.difficulty;
    startGame(data.characterCount);
  } catch (error) {
    console.error('Error starting daily challenge:', error);
    showFeedback('Failed to start daily challenge. Please try again.');
  }
}

document.getElementById('hint-button').addEventListener('click', getHint);
document.getElementById('daily-challenge-button').addEventListener('click', startDailyChallenge);

// Start the game by loading available images
window.addEventListener('load', loadAvailableImages);
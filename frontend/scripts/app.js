const gameImage = document.getElementById('game-image');
const targetingBox = document.getElementById('targeting-box');
const characterList = document.getElementById('character-list');

gameImage.addEventListener('click', (e) => {
    const rect = gameImage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Position the targeting box
    targetingBox.style.left = `${x - 50}px`;
    targetingBox.style.top = `${y - 50}px`;
    targetingBox.classList.remove('hidden');
});

document.addEventListener('click', (e) => {
    if (!targetingBox.contains(e.target) && e.target !== gameImage) {
        targetingBox.classList.add('hidden');
    }
});

characterList.addEventListener('click', (e) => {
    if (e.target.tagName === 'LI') {
        const character = e.target.textContent;
        console.log(`Selected character: ${character}`);
        // Here we'll later add the backend validation
    }
});
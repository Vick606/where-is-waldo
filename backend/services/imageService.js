import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const UNSPLASH_API_URL = 'https://api.unsplash.com/photos/random';
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

async function fetchRandomImages(count = 10) {
  try {
    const response = await fetch(`${UNSPLASH_API_URL}?count=${count}&query=landscape`, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });
    const data = await response.json();
    return data.map(image => ({
      id: image.id,
      url: image.urls.regular,
      photographer: image.user.name
    }));
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
}

export { fetchRandomImages };
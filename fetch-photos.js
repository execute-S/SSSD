const fs = require('fs');
const path = require('path');

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const PLACE_ID = 'ChIJ2xyIRB8VrjsRI8Dh2NXb73E'; 

async function run() {
  console.log("Fetching place details...");
  
  const detailsUrl = `https://places.googleapis.com/v1/places/${PLACE_ID}?fields=photos&key=${API_KEY}`;
  const response = await fetch(detailsUrl);
  const data = await response.json();

  if (data.error) {
    console.error("API Error:", data.error.message);
    process.exit(1);
  }

  if (!data.photos || data.photos.length === 0) {
    return console.log("No photos found.");
  }

  const photosData = [];
  const dir = path.join(__dirname, 'photos');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  // Download up to 10 most recent photos
  const limit = Math.min(data.photos.length, 10);
  for (let i = 0; i < limit; i++) {
    const photo = data.photos[i];
    console.log(`Downloading photo ${i + 1}...`);
    
    // Request max 800px width/height for fast web loading
    const imgUrl = `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=800&maxWidthPx=800&key=${API_KEY}`;
    const imgRes = await fetch(imgUrl);
    const arrayBuffer = await imgRes.arrayBuffer();
    
    const fileName = `photo_${i}.jpg`;
    fs.writeFileSync(path.join(dir, fileName), Buffer.from(arrayBuffer));
    
    // Save attribution to comply with Google Terms of Service
    photosData.push({
      imagePath: `photos/${fileName}`,
      author: photo.authorAttributions?.[0]?.displayName || 'Google Maps User',
      authorUrl: photo.authorAttributions?.[0]?.uri || ''
    });
  }

  fs.writeFileSync(path.join(__dirname, 'photos.json'), JSON.stringify(photosData, null, 2));
  console.log("Success! Updated photos and photos.json.");
}

run();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
const basePath = path.join(__dirname, '../../assets');
let gameAssets = {};

const readFileAsync = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(basePath, filename), 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(JSON.parse(data));
    });
  });
};

export const loadGameAssets = async () => {
  try {
    const [stages, itemsData, itemUnlocksData] = await Promise.all([
      readFileAsync('stage.json'),
      readFileAsync('item.json'),
      readFileAsync('item_unlock.json'),
      ]);
      
      gameAssets = { stages, itemsData, itemUnlocksData };
    return gameAssets;
  } catch (error) {
    console.error('Failed to load game assets: ', error);
    throw error;
  }
};


export const getGameAssets = () => {
  return gameAssets;
}
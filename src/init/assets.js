// gameAssets.js
import { rejects } from 'assert';
import fs from 'fs';
import path, { resolve } from 'path';
import { fileURLToPath } from 'url';
import { callbackify } from 'util';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
const basePath = path.join(__dirname, '../../assets');
let gameAssets = {};

const readFileAsync = (filename) => {
  return new Promise((resolve, rejects)  => {
    fs.readFile(path.join(basePath, filename), 'utf8',(err,data) => {
      if(err){
        rejects(err);
        return;
      }
      resolve(JSON.parse(data));
    });
  });
};



export const loadGameAssets = async () => {
  try{
  const[stage,item,item_unlock] = await Promise.all([
    readFileAsync('stage.json'),
    readFileAsync('item.json'),
    readFileAsync('item_unlock.json'),
  ]);

  gameAssets = {stage, item, item_unlock};
return gameAssets;
} catch (e) {
  throw new Error('Failed to load game assets: ' + e.message);
}
};

export const getGameAssets = () => {
  return gameAssets;
}
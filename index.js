const fs = require('node:fs/promises');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

let DIR_PATH;
if (!process.env.DIR_PATH) {
  throw new Error('Config value DIR_PATH should be specified in config.env');
} else {
  DIR_PATH = process.env.DIR_PATH;
}

let RESULT_FILE_PATH;
if (!process.env.RESULT_FILE_PATH) {
  throw new Error(
    'Config value RESULT_FILE_PATH should be specified in config.env'
  );
} else {
  RESULT_FILE_PATH = process.env.RESULT_FILE_PATH;
}

const readDir = async (dirPath) => {
  let result = `[DIR]${dirPath}\n`;

  const subDirs = [];

  const files = await fs.readdir(dirPath);
  for (const file of files) {
    const stat = await fs.stat(`${dirPath}/${file}`);
    if (stat.isDirectory()) {
      subDirs.push(file);
    } else {
      result += `${dirPath}/${file}\n`;
    }
  }

  // Processing dirs after files
  for (const subDir of subDirs) {
    const resultSubDir = await readDir(`${dirPath}/${subDir}`);
    result += resultSubDir;
  }

  return result;
};

const start = async () => {
  try {
    const result = await readDir(DIR_PATH);
    await fs.writeFile(RESULT_FILE_PATH, result);
    console.log(
      `Tree of dirs and files for '${DIR_PATH}' is succesfully written to '${RESULT_FILE_PATH}'`
    );
  } catch (e) {
    console.error(e);
  }
};

start();

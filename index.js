const fs = require('node:fs/promises');
const { createHash } = require('node:crypto');
const { platform } = require('node:process');
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

const pathSeparator = platform === 'win32' ? '\\' : '/';
const tableSeparator = '|';
const tableHeader = `File ${tableSeparator} SHA256 ${tableSeparator} Created ${tableSeparator} Modified\n`;

const readDir = async (dirPath) => {
  let result = `[DIR]${dirPath}\n`;

  const subDirs = [];

  const files = await fs.readdir(dirPath);
  for (const file of files) {
    const filePath = `${dirPath}${pathSeparator}${file}`;
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      subDirs.push(file);
    } else {
      const preparedPath = filePath.replace(
        tableSeparator,
        `\\${tableSeparator}`
      );
      result += `${preparedPath}`;
      result += `${tableSeparator}${await getFileSha256Hash(filePath)}`;
      result += `${tableSeparator}${stat.birthtime.toISOString()}`;
      result += `${tableSeparator}${stat.mtime.toISOString()}\n`;
    }
  }

  // Processing dirs after files
  for (const subDir of subDirs) {
    const resultSubDir = await readDir(`${dirPath}${pathSeparator}${subDir}`);
    result += resultSubDir;
  }

  return result;
};

const getFileSha256Hash = async (filePath) => {
  const buffer = await fs.readFile(filePath);
  const hash = createHash('sha256');
  return hash.update(buffer).digest('hex').toString('base64');
};

const start = async () => {
  console.log('Started:', new Date());
  try {
    let result = `${tableHeader}`;
    result += await readDir(DIR_PATH);
    await fs.writeFile(RESULT_FILE_PATH, result);
    console.log(
      `Tree of dirs and files for '${DIR_PATH}' is succesfully written to '${RESULT_FILE_PATH}'`
    );
  } catch (e) {
    console.error(e);
  }
  console.log('Finished:', new Date());
};

start();

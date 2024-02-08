const fs = require('fs');
const path = require('path');

const packageJson = require('../package.json');
const targetFile = path.resolve('dist/electron/index.js');
const fileContent = fs.readFileSync(targetFile, 'utf-8');

const replacedContent = fileContent.replace(/%APP_NAME%/g, packageJson.friendlyName);
try {
  fs.writeFileSync(targetFile, replacedContent, 'utf-8');
  console.log(`The app name was successfully updated in ${targetFile}.`);
} catch (err) {
  console.error(`Error while updating app name in ${targetFile}.`, err);
}

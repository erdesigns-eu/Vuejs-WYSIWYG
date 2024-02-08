const fs = require('fs');
const { join } = require('path');

/**
 * @function writeSecrets
 * @description Write an empty secrets file.
 * @returns {void}
 */
const writeSecrets = () => {
  const filePath = join(__dirname, '..', 'src', 'secrets', 'secrets.json');
  fs.writeFile(filePath, JSON.stringify({ d: '' }), 'utf-8', (err) => {
    if (err) {
      console.error(`Error writing file: ${err}`);
      return;
    }
    console.log(`Successfully wrote empty secrets file: ${filePath}`);
  });
}

/**
 * @function writeSalt
 * @description Write the salt to the salt.js file
 * @returns {void}
 */
const writeSalt = () => {
  const filePath = join(__dirname, '..', 'src', 'secrets', 'salt.js');
  fs.writeFile(filePath, `export default '';`, 'utf-8', (err) => {
    if (err) {
      console.error(`Error writing file: ${err}`);
      return;
    }
  });
}

// Write the secrets file
writeSecrets();
// Write the salt file
writeSalt();
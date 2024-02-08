const fs = require('fs');
const { join } = require('path');

// Generate random salt (UUID v4)
const salt = URL.createObjectURL(new Blob([])).slice(-36);

/**
 * Convert text to char codes array
 * @param {String} text
 * @returns Number[]
 */
const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));

/**
 * XOR char code with salt
 * @param {Number} code
 * @returns Number
 */
const saltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);

/**
 * Convert byte to hex string
 * @param {Number} n
 * @returns String
 */
const byteHex = (n) => ("0" + Number(n).toString(16)).slice(-2);

/**
 * Encrypt string with salt
 * @param {String} text
 * @returns String
 */
const crypt = (text) => {
  return text.split("").map(textToChars).map(saltToChar).map(byteHex).join("");
};

/**
 * Encrypt secrets
 * @type {string} cryptedSecrets
 */
const cryptedSecrets = JSON.stringify({
  d: crypt(
    JSON.stringify(require(join(__dirname, '..', 'secrets', 'index.js')))
  )
});

/**
 * @function writeSalt
 * @description Write the salt to the salt.js file
 * @returns {void}
 */
const writeSalt = () => {
  const filePath = join(__dirname, '..', 'src', 'secrets', 'salt.js');
  fs.writeFile(filePath, `export default '${salt}';`, 'utf-8', (err) => {
    if (err) {
      console.error(`Error writing file: ${err}`);
      return;
    }
    console.log(`Salt written successfully to file: ${filePath}`);
  });
}

/**
 * @function writeSecrets
 * @description Write the encrypted secrets to the secrets.json file
 * @returns {void}
 */
const writeSecrets = () => {
  const filePath = join(__dirname, '..', 'src', 'secrets', 'secrets.json');
  fs.writeFile(filePath, cryptedSecrets, 'utf-8', (err) => {
    if (err) {
      console.error(`Error writing file: ${err}`);
      return;
    }

    console.log(`Secrets written successfully to file: ${filePath}`);
  });
}

// Write the salt to the salt.js file
writeSalt();
// Write the encrypted secrets to the secrets.json file
writeSecrets();
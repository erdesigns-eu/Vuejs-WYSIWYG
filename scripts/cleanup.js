const fs = require('fs');
const { join } = require('path');

// Remove the dist directory
fs.rm(join(__dirname, '..', 'dist'), { recursive: true }, (err) => {
  if (err) {
    console.error('Error deleting dist directory!', err);
  } else {
    console.log('Dist directory deleted successfully!');
  }
});

// Remove the salt file
fs.unlink(join(__dirname, '..', 'src', 'secrets', 'salt.js'), (err) => {
  if (err) {
    console.error(`Error deleting salt file: ${err}`);
    return;
  }
  console.log('Salt deleted successfully.');
});

// Remove the secrets file
fs.unlink(join(__dirname, '..', 'src', 'secrets', 'secrets.json'), (err) => {
  if (err) {
    console.error(`Error deleting secrets file: ${err}`);
    return;
  }
  console.log('Secrets deleted successfully');
});
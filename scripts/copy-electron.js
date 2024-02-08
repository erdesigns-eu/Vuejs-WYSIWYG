const fs = require('fs');
const path = require('path');

const sourceDir = 'electron';
const targetDir = 'dist/electron';

function copyDirectory(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target);
  }

  const files = fs.readdirSync(source);

  files.forEach((file) => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);

    if (fs.lstatSync(sourcePath).isDirectory()) {
      copyDirectory(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

try {
  copyDirectory(sourceDir, targetDir);
  console.log('The electron directory was successfully copied to dist/electron.');
} catch (error) {
  console.error('The directory could not be copied!', error);
}

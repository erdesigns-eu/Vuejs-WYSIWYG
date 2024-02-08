/**
 * @file index.js
 * @description The main entry point for the application.
 * @version 1.0.0
 * @exports app
 * @requires ElectronApp
 */

// Require the classes
const ElectronApp = require('./classes/electron-app');

// Create the instances
const app = new ElectronApp('%APP_NAME%');

// Export the instances
module.exports = {
  app,
};
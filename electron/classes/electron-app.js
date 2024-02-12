const fs = require('fs');
const { join } = require('path');
const { app, BrowserWindow, ipcMain, Notification, dialog, Menu } = require('electron');
const { release } = require('node:os'); 
const { defaultOption, isObject } = require('../utils.js');
const { backgroundColor, titleBarStyle, inactiveTitleBarOverlay, activeTitleBarOverlay, defaultSettings, about } = require('../defaults.js');

/**
 * @class ElectronApp
 * @classdesc This class is the main class of the application.
 * @description ElectronApp class is the main class of the application.
 * It is responsible for the initialization of the application and the
 * communication between the different parts of the application.
 * @exports ElectronApp
 * @requires fs
 * @requires path
 * @requires electron
 * @requires os
 * @requires utils
 * @requires defaults
 * @version 1.0.0
 */
class ElectronApp {
  #title;
  #mainWindow;
  #ipcMain;
  #settings = {};

  /**
   * @constructor
   * @description This function is the constructor of the ElectronApp class.
   * @param {string} title - The title of the application.
   * @example
   * // returns an instance of the ElectronApp class
   * new ElectronApp('My App');
   */
  constructor(title, options = {}) {
    // Set the title of the application
    this.#title = title;
    // Set the main window of the application to null
    this.#mainWindow = null;
    // Set the ipcMain of the application
    this.#ipcMain = ipcMain;
    // Load the settings of the application
    this.#loadSettings();

    // Request a single instance lock for the application and quit if it is not granted
    if (!app.requestSingleInstanceLock()) {
      this.exit();
    }

    // Disable the default menu (We will create our own menu in the renderer process)
    // ToDo: Initialize the menu when we are on Linux/MacOS?
    Menu.setApplicationMenu(null);

    // Disable GPU Acceleration for Windows 7
    if (release().startsWith('6.1')) {
      app.disableHardwareAcceleration();
    }

    // Set application name for Windows 10+ notifications
    if (this.platform === 'win32') {
      app.setAppUserModelId(title);
    }

    // Set about panel options
    app.setAboutPanelOptions({
      applicationName: title,
      applicationVersion: app.getVersion(),
      copyright: about.copyright,
      version: app.getVersion(),
      authors: about.authors,
      website: about.website,
      iconPath: join(app.getAppPath(), 'dist', 'icon.png')
    });
    
    // This method will be called when Electron has finished
    app.whenReady().then(() => {
      // Create the main window
      this.#createWindow(options);
      // When the application is activated
      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.#createWindow();
        } else {
          this.#mainWindow.focus();
        }
      });
    });

    // Quit when all windows are closed, except on macOS where it's common 
    // for applications and their menu bar to stay active until the user quits 
    // explicitly with Cmd + Q
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // Listen for the 'second-instance' event and focus on the main window if the user tried to open another
    app.on('second-instance', () => {
      if (this.#mainWindow) {
        if (this.#mainWindow.isMinimized()) {
          this.#mainWindow.restore();
        }
        this.#mainWindow.focus();
      }
    });

    // listen for the 'update-progress' event
    this.#ipcMain.on('update-progress', (_, progress) => {
      this.#mainWindow.setProgressBar(Number.parseInt(progress));
    });

    // Listen for the 'notification' event
    this.#ipcMain.on('notification', (event, options) => {
      // Create a new notification
      const notification = new Notification({ 
        icon: join(app.getAppPath(), 'dist', 'icon.png'),
        ...options 
      });
      // Show the notification
      notification.show();
      // When the notification is clicked
      notification.on('click', () => {
        event.sender.send('notification-click');
      });
      // When the notification is closed
      notification.on('close', () => {
        event.sender.send('notification-close');
      });
      // When the notification fails
      notification.on('failed', (_, error) => {
        event.sender.send('notification-error', error);
      });
    });

    // Listen for the 'open-dialog' event
    this.#ipcMain.on('open-dialog', (event, options) => {
      // Show the open dialog
      dialog.showOpenDialog(this.#mainWindow, options)
        .then((result) => {
          // Send the result to the renderer process
          event.sender.send('open-dialog-response', result);
        })
        .catch((error) => {
          // Send the error to the renderer process
          event.sender.send('open-dialog-error', error);
        });
    });

    // Listen for the 'save-dialog' event
    this.#ipcMain.on('save-dialog', (event, options) => {
      // Show the save dialog
      dialog.showSaveDialog(this.#mainWindow, options)
        .then((result) => {
          // Send the result to the renderer process
          event.sender.send('save-dialog-response', result);
        })
        .catch((error) => {
          // Send the error to the renderer process
          event.sender.send('save-dialog-error', error);
        });
    });

    // Listen for the 'message-box' event
    this.#ipcMain.on('message-box', (event, options) => {
      // Show the message box
      dialog.showMessageBox(this.#mainWindow, options)
        .then((result) => {
          // Send the result to the renderer process
          event.sender.send('message-box-response', result);
        })
        .catch((error) => {
          // Send the error to the renderer process
          event.sender.send('message-box-error', error);
        });
    });

    // Listen for the 'minimize-window' event
    this.#ipcMain.on('minimize-window', () => {
      this.#mainWindow.minimize();
    });

    // Listen for the 'maximize-window' event
    this.#ipcMain.on('maximize-window', () => {
      this.#mainWindow.maximize();
    });

    // Listen for the 'restore-window' event
    this.#ipcMain.on('restore-window', () => {
      this.#mainWindow.restore();
    });

    // Listen for the 'get-title' event
    this.#ipcMain.on('get-title', (event) => {
      event.returnValue = this.#title;
    });

    // Listen for the 'set-title' event
    this.#ipcMain.on('set-title', (event, title) => {
      this.title = title;
    });

    // Listen for the 'platform' event
    this.#ipcMain.on('platform', (event) => {
      event.returnValue = process.platform;
    });

    // Listen for the 'locale' event
    this.#ipcMain.on('locale', (event) => {
      event.returnValue = {
        locale: app.getLocale().split('-')[0],
        country: app.getLocaleCountryCode(),
        systemLocale: app.getSystemLocale(),
        preferredSystemLanguages: app.getPreferredSystemLanguages(),
      };
    });

    // Listen for the 'get-icon' event
    this.#ipcMain.on('get-icon', (event, type) => {
      switch (type.toLowerCase()) {
        case 'win': 
          event.returnValue = this.winIcon;
          break;
        case 'mac':
          event.returnValue = this.macIcon;
          break;
        case 'svg':
          event.returnValue = this.svgIcon;
          break;
        default:
          event.returnValue = this.pngIcon;
          break;
      }
    });

    // Listen for the 'update-titlebar' event
    this.#ipcMain.on('update-titlebar', (_, options) => {
      this.updateTitlebar(options);
    });

    // Listen for the 'get-settings' event
    this.#ipcMain.on('get-settings', (event) => {
      event.returnValue = this.#settings;
    });

    // Listen for the 'set-settings' event
    this.#ipcMain.on('set-settings', (event, settings) => {
      this.#settings = settings;
    });

    // Listen for the 'open-devtools' event
    this.#ipcMain.on('open-devtools', () => {
      this.#mainWindow.webContents.openDevTools();
    });

    // Listen for the 'open-about' event
    this.#ipcMain.on('open-about', (event, custom) => {
      if (custom) {
        this.#mainWindow.webContents.send('open-about');
      } else {
        app.showAboutPanel();
      }
    });
  }

  /**
   * @function createWindow
   * @description This function creates the main window of the application.
   * @param {Object} options - The options object.
   * @private
   */
  #createWindow(options) {
    // Create the browser window with the specified options or the default options
    this.#mainWindow = new BrowserWindow({
      width: defaultOption(options, 'width', 1200),
      height: defaultOption(options, 'height', 800),
      x: defaultOption(options, 'x', undefined),
      y: defaultOption(options, 'y', undefined),
      useContentSize: defaultOption(options, 'useContentSize', false),
      center: defaultOption(options, 'center', true),
      resizable: defaultOption(options, 'resizable', true),
      movable: defaultOption(options, 'movable', true),
      minimizable: defaultOption(options, 'minimizable', true),
      maximizable: defaultOption(options, 'maximizable', true),
      closable: defaultOption(options, 'closable', true),
      alwaysOnTop: defaultOption(options, 'alwaysOnTop', false),
      fullscreen: defaultOption(options, 'fullscreen', false),
      fullscreenable: defaultOption(options, 'fullscreenable', true),
      skipTaskbar: defaultOption(options, 'skipTaskbar', false),
      kiosk: defaultOption(options, 'kiosk', false),
      title: defaultOption(options, 'title', this.#title),
      icon: defaultOption(options, 'icon', join(app.getAppPath(), 'dist', 'icon.ico')),
      show: defaultOption(options, 'show', true),
      frame: defaultOption(options, 'frame', true),
      parent: defaultOption(options, 'parent', undefined),
      modal: defaultOption(options, 'modal', false),
      acceptFirstMouse: defaultOption(options, 'acceptFirstMouse', false),
      disableAutoHideCursor: defaultOption(options, 'disableAutoHideCursor', false),
      autoHideMenuBar: defaultOption(options, 'autoHideMenuBar', false),
      enableLargerThanScreen: defaultOption(options, 'enableLargerThanScreen', false),
      backgroundColor: defaultOption(options, 'backgroundColor', backgroundColor),
      hasShadow: defaultOption(options, 'hasShadow', true),
      opacity: defaultOption(options, 'opacity', 1),
      darkTheme: defaultOption(options, 'darkTheme', false),
      transparent: defaultOption(options, 'transparent', false),
      type: defaultOption(options, 'type', 'normal'),
      titleBarStyle: defaultOption(options, 'titleBarStyle', titleBarStyle),
      titleBarOverlay: defaultOption(options, 'titleBarOverlay', activeTitleBarOverlay),
      webPreferences: {
        preload: join(app.getAppPath(), 'dist', 'electron', 'preload.js'),
        sandbox: defaultOption(options, 'sandbox', false),
        nodeIntegrationInWorker: defaultOption(options, 'nodeIntegrationInWorker', false),
      }
    });

    // Load the index.html of the application
    if (this.isDev) {
      this.#mainWindow.loadURL('http://localhost:3000');
      // Open the DevTools if the openDevTools option is true
      if (defaultOption(options, 'openDevTools', true) === true) {
        this.#mainWindow.webContents.openDevTools();
      }
    } else if (this.isPreview) {
      this.#mainWindow.loadFile(join(app.getAppPath(), 'dist', 'index.html'));
    } else {
      this.#mainWindow.loadFile(join(app.getAppPath(), 'dist', 'index.html'));
    }

    // Emitted when the window is closed
    this.#mainWindow.on('closed', () => {
      this.#mainWindow = null;
    });

    // Listen for the 'focus' event
    this.#mainWindow.on('focus', () => {
      this.#mainWindow.webContents.send('focus');
      this.updateTitlebar(activeTitleBarOverlay);
    });

    // Listen for the 'blur' event
    this.#mainWindow.on('blur', () => {
      this.#mainWindow.webContents.send('blur');
      this.updateTitlebar(inactiveTitleBarOverlay);
    });

    // Listen for the 'menu-item-click' event
    this.#ipcMain.on('menu-item-click', (event, menuItem) => {
      this.#mainWindow.webContents.send('menu-item-click', menuItem);
    });

    // listen for the 'toolbar-button-click' event
    this.#ipcMain.on('toolbar-button-click', (event, toolbarButton) => {
      this.#mainWindow.webContents.send('toolbar-button-click', toolbarButton);
    });
  }

  /**
   * @function getAsDataURL
   * @description This function returns the data URL of the specified file.
   * @param {string} path - The path of the file.
   * @returns {string} The data URL of the file.
   * @private
   */
  #getAsDataURL(path) {
    return`data:image/png;base64,${fs.readFileSync(path, 'base64')}`;
  }

  /**
   * @function loadSettings
   * @description This function loads the settings from the settings.json file.
   * @private
   */
  #loadSettings() {
    let settingsFile = join(app.getPath('userData'), 'settings.json');
    // Check if we are in preview mode
    if (this.isPreview) {
      settingsFile = join(app.getPath('desktop'), 'settings.json');
    }
    // Check if the settings.json file exists and create it if it doesn't
    if (!fs.existsSync(settingsFile)) {
      fs.writeFileSync(settingsFile, JSON.stringify(defaultSettings, null, 2), 'utf8');
    }
    // Load the settings from the settings.json file
    this.#settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
  }

  /**
   * @function saveSettings
   * @description This function saves the settings to the settings.json file.
   * @param {Object} settings - The settings object.
   * @private
   */
  #saveSettings(settings) {
    let settingsFile = join(app.getPath('userData'), 'settings.json');
    // Check if we are in preview mode
    if (this.isPreview) {
      settingsFile = join(app.getPath('desktop'), 'settings.json');
    }
    // Set the settings to the settings variable
    this.#settings = settings;
    // Save the settings to the settings.json file
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf8');
  }

  /**
   * @function sendToRenderer
   * @description This function sends data to the renderer process.
   * @param {string} eventName - The name of the event.
   * @param {Object} data - The data to send.
   * @example
   * // Send data to the renderer process
   * sendToRenderer('event-name', { key: 'value' });
   * @example
   * // Send data to the renderer process
   * sendToRenderer('event-name', 'data'); 
   */
  sendToRenderer(eventName, data) {
    // Check if the data is an object
    if (isObject(data)) {
      // Send the data to the renderer process by converting it to a JSON string
      this.#mainWindow.webContents.send(eventName, JSON.stringify(data));
    } else {
      // Send the data to the renderer process as a string
      this.#mainWindow.webContents.send(eventName, data);
    }
  }

  /**
   * @function exit
   * @description This function exits the application.
   */
  exit() {
    // Close the main window
    if (this.#mainWindow !== null) {
      this.#mainWindow.close();
    }
  }

  /**
   * @function maximize
   * @description This function maximizes the main window.
   */
  minimize() {
    this.#mainWindow.minimize();
  }

  /**
   * @function restore
   * @description This function restores the main window.
   */
  restore() {
    this.#mainWindow.restore();
  }

  /**
   * @function maximize
   * @description This function maximizes the main window.
   */
  maximize() {
    this.#mainWindow.maximize();
  }

  /**
   * @function updateTitlebar
   * @description This function updates the titlebar of the main window.
   * @param {object} options - The options for the titlebar.
   */
  updateTitlebar(options) {
    this.#mainWindow.setTitleBarOverlay(options);
  }

  /**
   * @getter isDev
   * @description This getter returns true if the application is in development mode, otherwise it returns false.
   * @returns {boolean}
   */
  get isDev() {
    return process.env.npm_lifecycle_event === 'app:dev' ? true : false;
  }

  /**
   * @getter isPreview
   * @description This getter returns true if the application is in preview mode, otherwise it returns false.
   * @returns {boolean}
   */
  get isPreview() {
    return process.env.npm_lifecycle_event === 'app:preview' ? true : false;
  }

  /**
   * @getter title
   * @description This getter returns the title of the application.
   * @returns {string}
   */
  get title() {
    return this.#title;
  }

  /**
   * @setter title
   * @description This setter sets the title of the application.
   * @param {string} title - The title of the application.
   */
  set title(title) {
    this.#title = title;
    // Set the title of the main window
    if (this.#mainWindow !== null) {
      this.#mainWindow.setTitle(title);
    }
    // Set application name for Windows 10+ notifications
    app.setAppUserModelId(title);
  }

  /**
   * @getter winIcon
   * @description This getter returns the Windows icon of the application.
   * @returns {string}
   */
  get winIcon() {
    return this.#getAsDataURL(join(app.getAppPath(), 'dist', 'icon.ico'));
  }

  /**
   * @getter macIcon
   * @description This getter returns the macOS icon of the application.
   * @returns {string}
   */
  get macIcon() {
    return this.#getAsDataURL(join(app.getAppPath(), 'dist', 'icon.icns'));
  }

  /**
   * @getter pngIcon
   * @description This getter returns the PNG icon of the application.
   * @returns {string}
   */
  get pngIcon() {
    return this.#getAsDataURL(join(app.getAppPath(), 'dist', 'icon.png'));
  }

  /**
   * @getter svgIcon
   * @description This getter returns the SVG icon of the application.
   * @returns {string}
   */
  get svgIcon() {
    return this.#getAsDataURL(join(app.getAppPath(), 'dist', 'icon.svg'));
  }

  /**
   * @getter platform
   * @description This getter returns the platform (operating system) of the application.
   * @returns {string}
   */
  get platform() {
    return process.platform;
  }

  /**
   * @getter settings
   * @description This getter returns the settings of the application from the settings file.
   * @returns {object}
   */
  get settings() {
    return this.#settings;
  }

  /**
   * @setter settings
   * @description This setter sets the settings of the application in the settings file.
   * @param {object} settings - The settings of the application.
   */
  set settings(settings) {
    this.#saveSettings(settings);
  }

  /**
   * @getter mainWindow
   * @description This getter returns the main window of the application.
   * @returns {BrowserWindow}
   * @readonly
   */
  get mainWindow() {
    return this.#mainWindow;
  }
}

module.exports = ElectronApp;
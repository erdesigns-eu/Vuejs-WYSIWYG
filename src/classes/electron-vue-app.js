import {
  isObject,
  ipcRendererPlaceholder,
  assignEmptyObject,
  getProperty,
} from "./utils";
import { createApp } from "vue";
import { createPinia } from "pinia";
import { createI18n } from "vue-i18n";
import { decrypt } from "@/secrets/crypt";
import secrets from "@/secrets/secrets.json";

/**
 * @class ElectronVueApp
 * @description This class represents an Electron Vue app.
 * It is a wrapper around a Vue app that adds functionality for communication with the main process.
 * @module Classes/ElectronVueApp
 */
export class ElectronVueApp extends EventTarget {
  #vueApp = null;
  #pinia = null;
  #i18n = null;
  #ipcRenderer = null;
  #secrets = assignEmptyObject(JSON.parse(decrypt(secrets.d)));

  /**
   * @constructor
   * @description This function creates a new ElectronApp object.
   * @param {object} App - The app vue file.
   * @param {object} messages - An object containing locale messages.
   * @returns {ElectronApp} A new ElectronApp object.
   */
  constructor(App, messages = {}) {
    // Call the parent constructor
    super();

    // Create a Vue app with the App template
    this.#vueApp = createApp(App);

    // Create a Pinia store
    this.#pinia = createPinia();

    // Use the Pinia store
    this.use(this.#pinia);
    this.provide("pinia", this.#pinia);

    // Create an i18n instance
    this.#i18n = createI18n({
      // Don't use the legacy API
      legacy: false,
      // Don't warn about missing translations
      silentTranslationWarn: true,
      // Don't warn about falling back to the root locale
      silentFallbackWarn: true,
      // Inject the global properties
      globalInjection: true,
      // Use the locale
      locale: "en",
      // Use the fallback locale
      fallbackLocale: "en",
      // Use the messages
      messages,
    });
    this.use(this.#i18n);

    // Assign the ElectronApp object to the $electron property
    this.#vueApp.config.globalProperties.$electron = this;
    // Assign the ipcRenderer object to the ipcRenderer property
    if (window.ipcRenderer) {
      this.#ipcRenderer = window.ipcRenderer;
    } else {
      this.#ipcRenderer = ipcRendererPlaceholder;
    }

    // Provide this object to the Vue app
    this.provide("electron", this);

    // Listen for 'focus' events
    this.#ipcRenderer.on("focus", () => {
      document.querySelector("body > .titlebar").classList.remove("inactive");
      this.dispatchEvent(new CustomEvent("focus"));
    });

    // Listen for 'blur' events
    this.#ipcRenderer.on("blur", () => {
      document.querySelector("body > .titlebar").classList.add("inactive");
      this.dispatchEvent(new CustomEvent("blur"));
    });

    // Listen for the 'menu-item-click' event
    this.#ipcRenderer.on("menu-item-click", (menuItem) => {
      this.dispatchEvent(
        new CustomEvent("menu-item-click", { detail: menuItem })
      );
    });

    // listen for the 'toolbar-button-click' event
    this.#ipcRenderer.on("toolbar-button-click", (toolbarButton) => {
      this.dispatchEvent(
        new CustomEvent("toolbar-button-click", { detail: toolbarButton })
      );
    });
  }

  /**
   * @function sendToMain
   * @description This function sends data to the main process.
   * @param {string} eventName - The name of the event.
   * @param {any} data - The data to send.
   * @returns {void}
   * @example
   * // Send data to the main process
   * app.sendToMain('message-name', { key: 'value' }});
   * @example
   * // Send data to the main process
   * app.sendToMain('message-name', 'data');
   */
  sendToMain(eventName, data) {
    if (isObject(data)) {
      this.#ipcRenderer.send(eventName, data);
    } else {
      this.#ipcRenderer.send(messageName, JSON.stringify(data));
    }
  }

  /**
   * @function notification
   * @description This function creates a notification.
   * @param {string} title - The title of the notification.
   * @param {string} body - The body of the notification.
   * @param {object} options - The options for the notification.
   * @returns {Promise} - A promise that resolves when the notification is clicked.
   * @resolves {boolean} - Whether the notification was clicked.
   * @rejects {Error} - The error which caused the rejection.
   */
  notification(title, body, options) {
    return new Promise((resolve, reject) => {
      // Send the notification to the main process
      this.#ipcRenderer.send("notification", { title, body, ...options });
      // Register an event handler for the notification click
      this.#ipcRenderer.once("notification-click", () => {
        // Resolve the promise
        resolve(true);
      });
      // Register an event handler for the notification close
      this.#ipcRenderer.once("notification-close", () => {
        // Resolve the promise
        resolve();
      });
      // Register an event handler for the notification error
      this.#ipcRenderer.once("notification-error", (event, error) => {
        // Reject the promise
        reject(error);
      });
    });
  }

  /**
   * @function openDialog
   * @description This function opens a opendialog and returns the result.
   * @param {object} options - The options for the dialog.
   * @returns {Promise} - A promise that resolves when the dialog is closed.
   * @resolves {object} - The response from the dialog.
   * @rejects {Error} - The error which caused the rejection.
   */
  openDialog(options) {
    return new Promise((resolve, reject) => {
      // Send the dialog to the main process
      this.#ipcRenderer.send("open-dialog", options);
      // Register an event handler for the dialog response
      this.#ipcRenderer.once("open-dialog-response", (response) => {
        // Resolve the promise
        resolve(response);
      });
      // Register an event handler for the dialog error
      this.#ipcRenderer.once("open-dialog-error", (error) => {
        // Reject the promise
        reject(error);
      });
    });
  }

  /**
   * @function saveDialog
   * @description This function opens a savedialog and returns the result.
   * @param {object} options - The options for the dialog.
   * @returns {Promise} - A promise that resolves when the dialog is closed.
   * @resolves {object} - The response from the dialog.
   * @rejects {Error} - The error which caused the rejection.
   */
  saveDialog(options) {
    return new Promise((resolve, reject) => {
      // Send the dialog to the main process
      this.#ipcRenderer.send("save-dialog", options);
      // Register an event handler for the dialog response
      this.#ipcRenderer.once("save-dialog-response", (response) => {
        // Resolve the promise
        resolve(response);
      });
      // Register an event handler for the dialog error
      this.#ipcRenderer.once("save-dialog-error", (error) => {
        // Reject the promise
        reject(error);
      });
    });
  }

  /**
   * @function messageBox
   * @description This function opens a messagebox and returns the result.
   * @param {object} options - The options for the dialog.
   * @returns {Promise} - A promise that resolves when the dialog is closed.
   * @resolves {object} - The response from the dialog.
   * @rejects {Error} - The error which caused the rejection.
   */
  messageBox(options) {
    return new Promise((resolve, reject) => {
      // Send the dialog to the main process
      this.#ipcRenderer.send("message-box", options);
      // Register an event handler for the dialog response
      this.#ipcRenderer.once("message-box-response", (response) => {
        // Resolve the promise
        resolve(response);
      });
      // Register an event handler for the dialog error
      this.#ipcRenderer.once("message-box-error", (error) => {
        // Reject the promise
        reject(error);
      });
    });
  }

  /**
   * @function progressbar
   * @description This function updates the progressbar in the taskbar.
   * @param {number} progress - The progress of the progressbar.
   * @returns {void}
   */
  progressbar(progress) {
    // Set the progressbar to indeterminate
    if (progress === true) {
      progress = 2;
    }
    // Remove the progressbar
    if (
      progress === false ||
      progress === undefined ||
      progress === null ||
      progress < 0 ||
      progress > 1
    ) {
      progress = -1;
    }
    // Convert the progress from 0.0-1.0 to 0-100
    if (progress >= 0 && progress <= 1) {
      progress = Math.round(progress * 100);
    }
    // Update the progressbar
    this.#ipcRenderer.send("update-progress", progress);
  }

  /**
   * @function minimize
   * @description This function minimizes the window.
   * @returns {void}
   */
  minimize() {
    this.#ipcRenderer.send("minimize-window");
  }

  /**
   * @function maximize
   * @description This function maximizes the window.
   * @returns {void}
   */
  maximize() {
    this.#ipcRenderer.send("maximize-window");
  }

  /**
   * @function restore
   * @description This function restores the window.
   * @returns {void}
   */
  restore() {
    this.#ipcRenderer.send("restore-window");
  }

  /**
   * @function updateTitlebar
   * @description This function updates the titlebar.
   * @param {object} options - The options for the titlebar.
   * @returns {void}
   */
  updateTitlebar(options) {
    this.#ipcRenderer.send("update-titlebar", options);
  }

  /**
   * @function icon
   * @description This function gets the icon of the app.
   * @param {string} type - The type of the icon. (png, svg, win, mac)
   * @returns {string} - The icon of the app as a data URL.
   */
  icon(type = "png") {
    return this.#ipcRenderer.sendSync("get-icon", type);
  }

  /**
   * @function devTools
   * @description This function opens the devtools.
   * @returns {void}
   */
  devTools() {
    this.#ipcRenderer.send("open-devtools");
  }

  /**
   * @function about
   * @param {boolean} custom - Whether to use the custom about window.
   * @description This function opens the about window.
   * @returns {void}
   */
  about(custom = false) {
    this.#ipcRenderer.send("open-about", custom);
  }

  /**
   * @function secret
   * @description This function gets a secret.
   * @param {string} key - The key of the secret.
   * @returns {string} - The value of the secret.
   */
  secret(key) {
    const value = getProperty(key, this.#secrets);
    if (!value) {
      throw new Error("Can not find secret", key);
    }
    return value;
  }

  /**
   * @function use
   * @description This function adds a plugin to the Vue app.
   * @param {object} plugin - The plugin to add.
   * @returns {object} - The ElectronApp object. (chainable)
   */
  use(plugin) {
    return this.#vueApp.use(plugin), this;
  }

  /**
   * @function mount
   * @description This function mounts the Vue app to the DOM.
   * @param {string} selector - The selector for the DOM element to mount the Vue app to.
   * @returns {object} - The ElectronApp object. (chainable)
   */
  mount(selector) {
    return this.#vueApp.mount(selector), this;
  }

  /**
   * @function provide
   * @description This function provides a value to inject into the Vue app.
   * @param {string} key - The key to inject the value as.
   * @param {any} value - The value to inject.
   * @returns {object} - The ElectronApp object. (chainable)
   */
  provide(key, value) {
    return this.#vueApp.provide(key, value), this;
  }

  /**
   * @getter Vue
   * @description This getter returns the Vue app.
   * @returns {object} - The Vue app instance.
   */
  get Vue() {
    return this.#vueApp;
  }

  /**
   * @getter pinia
   * @description This getter returns the Pinia store.
   * @returns {object} - The Pinia store instance.
   */
  get pinia() {
    return this.#pinia;
  }

  /**
   * @getter i18n
   * @description This getter returns the i18n instance.
   * @returns {object} - The i18n instance.
   */
  get i18n() {
    return this.#i18n;
  }

  /**
   * @getter title
   * @description This getter returns the title of the app.
   * @returns {string} - The title.
   */
  get title() {
    return this.#ipcRenderer.sendSync("get-title");
  }

  /**
   * @setter title
   * @description This setter sets the title of the app.
   * @param {string} title - The title.
   * @returns {void}
   */
  set title(title) {
    this.#ipcRenderer.send("set-title", title);
  }

  /**
   * @getter platform
   * @description This getter returns the platform the app is running on.
   * @returns {string} - The platform.
   */
  get platform() {
    return this.#ipcRenderer.sendSync("platform");
  }

  /**
   * @getter locale
   * @description This getter returns the locale of the app.
   * @returns {string} - The locale.
   */
  get locale() {
    return this.#ipcRenderer.sendSync("locale");
  }

  /**
   * @getter settings
   * @description This getter returns the settings of the app.
   * @returns {object} - The settings.
   */
  get settings() {
    return this.#ipcRenderer.sendSync("get-settings");
  }

  /**
   * @setter settings
   * @description This setter sets the settings of the app.
   * @param {object} settings - The settings.
   * @returns {void}
   */
  set settings(settings) {
    this.#ipcRenderer.send("set-settings", settings);
  }

  /**
   * @getter http
   * @description This getter returns the HTTP module.
   * @returns {object} - The HTTP module.
   */
  get http() {
    return {
      // HTTP GET request
      GET(url, headers = {}) {
        return new Promise((resolve, reject) => {
          fetch(url, {
            method: 'GET',
            headers,
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`GET request failed with status ${response.status}`);
              }
              return response.json();
            })
            .then((data) => resolve(data))
            .catch((error) => reject(error));
        });
      },
      
      // HTTP POST request
      POST(url, body, headers = {}) {
        return new Promise((resolve, reject) => {
          fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`POST request failed with status ${response.status}`);
              }
              return response.json();
            })
            .then((data) => resolve(data))
            .catch((error) => reject(error));
        });
      },
    
      // HTTP PUT request
      PUT(url, body, headers = {}) {
        return new Promise((resolve, reject) => {
          fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`PUT request failed with status ${response.status}`);
              }
              return response.json();
            })
            .then((data) => resolve(data))
            .catch((error) => reject(error));
        });
      },
      
      // HTTP DELETE request
      DELETE(url, headers = {}) {
        return new Promise((resolve, reject) => {
          fetch(url, {
            method: 'DELETE',
            headers,
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`DELETE request failed with status ${response.status}`);
              }
              return response.json();
            })
            .then((data) => resolve(data))
            .catch((error) => reject(error));
        });
      },
    
      // HTTP HEAD request
      HEAD(url, headers = {}) {
        return new Promise((resolve, reject) => {
          fetch(url, {
            method: 'HEAD',
            headers,
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HEAD request failed with status ${response.status}`);
              }
              resolve(response);
            })
            .catch((error) => reject(error));
        });
      },
    }
  }
}

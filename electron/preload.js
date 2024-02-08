/**
 * @file preload.js
 * @description Preload script for Electron.
 * @module electron/preload
 * @version 1.0.0
 * @requires electron
 * @requires electron/context-bridge
 * @see {@link https://www.electronjs.org/docs/api/context-bridge}
 * @see {@link https://www.electronjs.org/docs/api/ipc-renderer}
 */

// Require the modules
const { contextBridge, ipcRenderer } = require('electron');

// Expose the ipcRenderer to the renderer process
contextBridge.exposeInMainWorld('ipcRenderer', {
  on: (channel, func) => {
    ipcRenderer.on(channel, (_, ...args) => func(...args));
  },
  off: (channel, func) => {
    ipcRenderer.off(channel, func);
  },
  once: (channel, func) => {
    ipcRenderer.once(channel, (_, ...args) => func(...args));
  },
  send: (channel, ...args) => {
    ipcRenderer.send(channel, ...args);
  },
  removeListener: (channel, func) => {
    ipcRenderer.removeListener(channel, func);
  },
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
  sendSync: (channel, ...args) => {
    return ipcRenderer.sendSync(channel, ...args);
  },
});
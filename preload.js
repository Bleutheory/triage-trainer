// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getItem: (key) => ipcRenderer.invoke('localStorage:get', key),
  setItem: (key, value) => ipcRenderer.invoke('localStorage:set', key, value),
});
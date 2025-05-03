const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;


function createInstructorWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    title: "Instructor View",
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    }
  });
  win.loadFile(
    path.join(__dirname, 'build', 'index.html'),
    { search: '?role=instructor' }
  );
}

function createStudentWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    title: "Student View",
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    }
  });
  win.loadFile(
    path.join(__dirname, 'build', 'index.html'),
    { search: '?role=student' }
  );
}

// Secure localStorage handlers
const memoryStore = {};

ipcMain.handle('localStorage:get', (event, key) => {
  return memoryStore[key] || null;
});

ipcMain.handle('localStorage:set', (event, key, value) => {
  memoryStore[key] = value;
});

app.whenReady().then(() => {
  app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
  app.commandLine.appendSwitch('disable-site-isolation-trials');
  // createInstructorWindow();
  createStudentWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createStudentWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');

let mainWindow;

function startInternalServer() {
  const server = express();
  const port = 3000;

  server.use(express.static(path.join(__dirname, 'build')));

  server.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

  server.listen(port, () => {
    console.log(`📦 Static server running at http://localhost:${port}`);
    setTimeout(() => {
      createInstructorWindow();
      createStudentWindow();
    }, 1000);
  });
}

function createInstructorWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    title: "Instructor View",
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false,
      allowRunningInsecureContent: true
    }
  });
  win.loadURL("http://localhost:3000/instructor");
}

function createStudentWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    title: "Student View",
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false,
      allowRunningInsecureContent: true
    }
  });
  win.loadURL("http://localhost:3000");
}

app.whenReady().then(() => {
  app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
  app.commandLine.appendSwitch('disable-site-isolation-trials');
  startInternalServer();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
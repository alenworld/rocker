const { app, BrowserWindow } = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs");
const { Worker } = require("worker_threads");

const EXTENSIONS = [".txt", ".docx", ".pdf", ".xlsx", '.xls', '.csv', '.doc'];

function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 250
  });

  win.loadFile("index.html");

  startScan();
}

function getUsbRoot() {
  return path.parse(process.execPath).root;
}

function getAllDrives() {
  const letters = "CDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return letters
    .map(letter => `${letter}:\\`)
    .filter(drive => fs.existsSync(drive));
}

function startScan() {
  const usbRoot = getUsbRoot();

  console.log("USB detected:", usbRoot);

  const drives = getAllDrives().filter(d => d !== usbRoot);

  drives.forEach(drive => {
    new Worker(path.join(__dirname, "worker.js"), {
      workerData: {
        drive,
        usbRoot,
        extensions: EXTENSIONS
      }
    });
  });
}

app.whenReady().then(createWindow);
const fs = require("fs");
const path = require("path");
const { workerData } = require("worker_threads");

const { drive, usbRoot, extensions } = workerData;

const SKIP_DIRS = new Set([
  "windows",
  "program files",
  "program files (x86)",
  "programdata",
  "$recycle.bin",
  "system volume information",
  "appdata",
  "temp",
  "tmp"
]);

function matchExtension(file) {
  return extensions.some(ext =>
    file.toLowerCase().endsWith(ext)
  );
}

function shouldSkipDir(dirName) {
  return SKIP_DIRS.has(dirName.toLowerCase());
}

function copyFileSafe(source) {
  const fileName = path.basename(source);

  const destFolder = path.join(usbRoot, "collected");

  try {
    if (!fs.existsSync(destFolder)) {
      fs.mkdirSync(destFolder, { recursive: true });
    }

    const dest = path.join(destFolder, fileName);

    if (!fs.existsSync(dest)) {
      fs.copyFileSync(source, dest);
    }

  } catch {
    // тихо пропускаем ошибки доступа
  }
}

function scan(dir) {
  // не сканируем саму флешку
  if (dir.startsWith(usbRoot)) return;

  let files;

  try {
    files = fs.readdirSync(dir, {
      withFileTypes: true
    });
  } catch {
    return;
  }

  for (const file of files) {

    const full = path.join(dir, file.name);

    try {

      if (file.isDirectory()) {

        if (shouldSkipDir(file.name)) continue;

        scan(full);

      } else {

        if (matchExtension(file.name)) {
          copyFileSafe(full);
        }

      }

    } catch {
      // пропуск ошибок доступа
      continue;
    }

  }
}

scan(drive);
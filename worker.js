const fs = require("fs");
const path = require("path");
const { parentPort, workerData } = require("worker_threads");

const { folder, extensions } = workerData;

function matchExtension(file) {

  return extensions.some(ext =>
    file.toLowerCase().endsWith(ext)
  );

}

function scan(dir) {

  parentPort.postMessage({
    type: "progress",
    dir
  });

  let files;

  try {

    files = fs.readdirSync(
      dir,
      { withFileTypes: true }
    );

  } catch {

    return;

  }

  for (const file of files) {

    const full = path.join(
      dir,
      file.name
    );

    try {

      if (file.isDirectory()) {

        scan(full);

      } else {

        if (matchExtension(file.name)) {

          parentPort.postMessage({
            type: "file",
            file: full
          });

        }

      }

    } catch {}

  }

}

scan(folder);
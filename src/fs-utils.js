const fs = require('fs');

function readFilesFromDir(entryPath, excludes = [], parentPath = '') {
  let filepaths = [];

  let source = '';
  if (parentPath === '') {
    source = entryPath;
  } else {
    source = (parentPath + '/' + entryPath).replace(/\/{2,}/g, '/');
  }

  let excluded = false;
  for (let i = 0; i < excludes.length; i++) {
    if (source.match(excludes[i]) !== null) {
      excluded = true;
      break;
    }
  }
  if (excluded) return filepaths;

  if (fs.lstatSync(source).isDirectory()) {
    let files = fs.readdirSync(source);
    for (let filePath of files) {
      const childs = readFilesFromDir(filePath, excludes, source);
      filepaths = filepaths.concat(childs);
    }
  } else {
    filepaths.push(source);
  }

  return filepaths;
}

module.exports = {
  readFilesFromDir,
};

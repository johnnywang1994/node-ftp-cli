const fs = require('fs');

function readFilesFromDir(entryPath, parentPath = '') {
  let filepaths = [];

  let source = '';
  if (parentPath === '') {
    source = entryPath;
  } else {
    source = parentPath + '/' + entryPath;
  }

  if (fs.lstatSync(source).isDirectory()) {
    let files = fs.readdirSync(source);
    for (let filePath of files) {
      const childs = readFilesFromDir(filePath, source);
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

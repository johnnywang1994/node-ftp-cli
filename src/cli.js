#!/usr/bin/env node
const path = require('path');
const minimist = require('minimist');
const { listFiles, putFile, appendFile, getFile, removeFile, renamePath, mkdir, rmdir, getdir, initFtp, putdir, appenddir } = require('./ftp-utils');

// fetch argv
const argv = minimist(process.argv.slice(2));

// fetch user config
let ftpConfig;
if (!argv.help && !argv.version) {
  ftpConfig = require(path.resolve(
    process.cwd(),
    argv.config || 'ftp.config.js'
  ));
}

async function onClientReady(client, spinner) {
  // list files in folder
  // --list [remotepath]
  if (argv.list) {
    spinner.text = 'Fetching file list...\n';
    const { files } = await listFiles(client, argv.list);
    console.dir(files.map((file) => file.name));
  // download a file
  // --get [remotepath] -o [localpath]
  } else if (argv.get) {
    spinner.text = `Downloading file ${argv.get}...\n`;
    await getFile(client, argv.get, argv.o);
  // upload a file
  // --put/--append [localpath] -t [remotepath]
  } else if (argv.put || argv.append) {
    spinner.text = `Uploading file ${argv.put || argv.append} to ${argv.t}...\n`;
    spinner.stop();
    if (argv.put) {
      await putFile(client, argv.put, argv.t);
    } else if (argv.append) {
      await appendFile(client, argv.append, argv.t);
    }
  // remove a file
  // --rm [remotepath]
  } else if (argv.rm) {
    spinner.text = `Deleting file ${argv.rm}...\n`;
    await removeFile(client, argv.rm);
  // rename a file
  // --rename [remotepath/remotefolder]
  } else if (argv.rename) {
    spinner.text = `Renaming path ${argv.rename} to ${argv.t}...\n`;
    await renamePath(client, argv.rename, argv.t);
  // create a folder
  // --mkdir [remotepath]
  } else if (argv.mkdir) {
    spinner.text = `Creating folder in ${argv.t}...\n`;
    await mkdir(client, argv.mkdir);
  // remove a folder
  // --rmdir [remotepath] [-r(recursive)]
  } else if (argv.rmdir) {
    spinner.text = `Deleting folder ${argv.rmdir}, recursive: ${argv.r}...\n`;
    await rmdir(client, argv.rmdir, argv.r);
  // download a folder
  // --getdir [remotepath] -o [localpath]
  } else if (argv.getdir) {
    spinner.text = `Downloading folder ${argv.getdir}...\n`;
    await getdir(client, argv.getdir, argv.o);
  // upload a folder
  // --putdir [remotepath] -t [localpath]
  } else if (argv.putdir) {
    spinner.text = `Uploading folder ${argv.putdir} with put...\n`;
    await putdir(client, argv.putdir, argv.t);
  // upload a folder
  // --appenddir [remotepath] -t [localpath]
  } else if (argv.appenddir) {
    spinner.text = `Uploading folder ${argv.appenddir} with append...\n`;
    await appenddir(client, argv.appenddir, argv.t);
  }
}

// set ftp options
const ftpOptions = {
  config: ftpConfig,
  ready: onClientReady,
};

// init Ftp script
if (argv.help) {
  console.log(`
    Usage
      $ node-ftp [options], ftp command line
          Options
            --list [remotefolder]
            --get [remotepath] -o [outputpath]
            --put [localpath] -t [remotefolder]
            --append [localpath] -t [remotefolder]
            --rm [remotepath]
            --rename [remotepath/remotefolder]
            --mkdir [remotefolder]
            --rmdir [remotefolder]
            --getdir [remotefolder] -o [outputpath]
            --putdir [localfolder] -t [remotefolder]
            --appenddir [localfolder] -t [remotefolder]
            --help
            --version
    Examples
      $ node-ftp --list /htdocs
      $ node-ftp --get /htdocs/index.html -o ./download
      $ node-ftp --put index.html -t /htdocs
  `);
} else if (argv.version) {
  console.log('v' + require('../package.json').version);
} else {
  initFtp(ftpOptions);
}

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const util = require("util");
const rimraf = require("rimraf");
const copyFile = util.promisify(fs.copyFile);
const rmdir = util.promisify(fs.rmdir);

router.post("/", async (req, res, next) => {
  // list of file names in param fileList (array)
  const fileList = req.body.fileList;
  const fileName = req.body.fileName;
  const rand = `${Math.round(Math.random() * 1000000000)}`;
  console.log(rand);
  console.log(fileList.length);
  if (fileList && fileList.length > 0) {
    // create a folder
    var destFolder;
    do {
      destFolder = `./testFolder/${
        fileName ? fileName + "_" + rand : "zipFolder_" + rand
      }`;
    } while (fs.existsSync(destFolder));

    if (!fs.existsSync(destFolder)) {
      //file exists
      const createFile = fs.mkdirSync(destFolder);
      const fileListPromises = await fileList.map(async (file) => {
        const fileString = file.split("/");
        const fileName = fileString[fileString.length - 1];
        return await copyFile(file, `${destFolder}/${fileName}`);
      });
      await Promise.all(fileListPromises);
      const zipped = await zipDirectory(destFolder, `${destFolder}.zip`);
      const unlinked = rimraf(destFolder, (err) => {
        console.log("RIMRAF", err);
      });

      res.json({
        zipFile: `${path.resolve(destFolder)}.zip`,
      });
    }
  }

  // make a new folder somewhere and give it a unique name
  // if the folder exists rename it or delete it
  // for each file name if the file exists
  // save it into the folder
  // zip the folder
  // send the file across to the client
});

/**
 * @param {String} source
 * @param {String} out
 * @returns {Promise}
 */
function zipDirectory(source, out) {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = fs.createWriteStream(out);

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false)
      .on("error", (err) => reject(err))
      .pipe(stream);

    stream.on("close", () => resolve());
    archive.finalize();
  });
}

module.exports = router;

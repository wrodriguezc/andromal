const path = require('path');
const fs = require('fs-extra');

function scanSamples(samplesPath) {

    return new Promise((resolve, reject) => {

        let samples = {};
        let count = 0;

        if (!fs.pathExistsSync(samplesPath)) {
            fs.mkdirsSync(samplesPath);
        }

        fs.readdir(samplesPath, (err, files) => {

            //handling error
            if (err) {
                console.log('Unable to scan directory: ' + err);
                reject();
            }

            //listing all files using forEach
            files.forEach(function (file) {

                let filePath = path.resolve(samplesPath, file);

                let stats = fs.statSync(filePath);

                //handling error
                if (!stats) {
                    console.log('Unable to read file stats');
                    reject();
                } else if (stats.isDirectory()) {

                    let sampleFiles = fs.readdirSync(filePath);

                    if (sampleFiles && sampleFiles.length > 0 && sampleFiles[0].toLowerCase().endsWith('.apk')) {
                        samples[file] = {
                            id: file,
                            name: sampleFiles[0]
                        };
                        count++;
                    }
                }

            });

            resolve({ samples: samples, count: count });

        });
    });
}

function scanFiles(filePath, extension) {

    return new Promise((resolve, reject) => {

        let filesFound = [];

        fs.readdir(filePath, (err, files) => {

            //handling error
            if (err) {
                console.log('Unable to scan directory: ' + err);
                reject();
            }

            files.forEach(function (file) {

                if (file.toLowerCase().endsWith(`.${extension}`)) {
                    filesFound.push(file);
                }

            });

            resolve(filesFound);

        });

    });
}

module.exports.scanSamples = scanSamples;
module.exports.scanFiles = scanFiles;
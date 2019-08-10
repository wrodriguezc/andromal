const uuidv1 = require('uuid/v1');
const path = require('path');
const fs = require('fs');
const checkDiskSpace = require('check-disk-space');
const fileScanner = require('../util/file-scanner');
const Controller = require('./controller');

const GIGABYTE = 1000000000;

class Home extends Controller {

    constructor() {

        super();

        this.context.home = true;
        this.context.title = 'Samples';
        this.context.samples = [];
        this.context.scripts = [{ script: 'assets/js/plugins/dropzone.min.js' }, { script: 'assets/js/home.js' }];
        this.context.stylesheets = [{ stylesheet: 'assets/css/dropzone.min.css' }, { stylesheet: 'assets/css/home.css' }];

        this.addView('/', 'home', (req) => {

            const samplesPath = path.resolve('data', 'samples');

            return checkDiskSpace(samplesPath).then((diskSpace) => {

                this.context.diskSpace = {
                    used: ((diskSpace.size - diskSpace.free) / GIGABYTE).toFixed(2),
                    size: (diskSpace.size / GIGABYTE).toFixed(2)
                };

            }).then(() => {
                return fileScanner.scanSamples(samplesPath);
            }).then((samples) => {
                this.context.samples = samples;
                this.context.sampleCount = samples.length;
            });

        });

        this.addAction('/upload', 'POST', (req, res) => {

            return new Promise((resolve, reject) => {

                let file = req.files.file;

                const uuid = uuidv1();
                const samplePath = path.resolve('data', 'samples', uuid);
                const filePath = path.resolve('data', 'samples', uuid, file.name);

                if (!fs.existsSync(samplePath)) {
                    fs.mkdirSync(samplePath);
                }

                file.mv(filePath, function (err) {

                    if (err) {
                        reject();
                        return res.status(500).send(err.message ? err.message : err);
                    }

                    res.status(200).send();
                    resolve();
                });

            });
        });
    }
}

module.exports = Home;
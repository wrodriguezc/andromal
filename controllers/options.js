const path = require('path');
const fs = require('fs-extra');
const Controller = require('./controller');

class Options extends Controller {

    constructor() {

        super();
        this.context.options = true;
        this.context.title = 'Options';

        this.addView('/options', 'options', (req, res) => {

            return new Promise((resolve, reject) => {
                
                if (req.query.resetted) {
                    this.context.resetted = true;
                } else {
                    this.context.resetted = false;
                }

                resolve();
            });

        });

        this.addAction('/reset', 'POST', (req, res) => {

            return new Promise((resolve, reject) => {

                const samplesPath = path.resolve('data', 'samples');
                const dynamicAnalysisPath = path.resolve('data', 'dynamic_analysis');
                const staticAnalysisPath = path.resolve('data', 'static_analysis');

                if (fs.pathExistsSync(samplesPath)) {
                    fs.removeSync(samplesPath);
                }

                if (fs.pathExistsSync(dynamicAnalysisPath)) {
                    fs.removeSync(dynamicAnalysisPath);
                }
                if (fs.pathExistsSync(staticAnalysisPath)) {
                    fs.removeSync(staticAnalysisPath);
                }

                res.redirect('/options?resetted=true');

                resolve();
            });

        });
    }
}

module.exports = Options;
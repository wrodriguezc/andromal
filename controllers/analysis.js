const path = require('path');
const fs = require('fs-extra');
const Controller = require('./controller');
const fileScanner = require('../util/file-scanner');
const hex_to_ascii = require('../util/text-utils').hex_to_ascii;
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;

function spawnPromise(commandLine, ondata) {

    return new Promise(function (resolve, reject) {

        let args = commandLine.split(' ');
        let command = args.shift();
        const child = spawn(command, args);

        child.stdout.on('data', (data) => {
            ondata(data);
        });

        child.on('exit', (code, signal) => {
            resolve();
        });

    });
}

function execPromise(command) {
    return new Promise(function (resolve, reject) {
        spawn(command, { shell: '/bin/bash' }, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(stdout.trim());
        });
    });
}


class Analysis extends Controller {

    constructor(globalContext) {

        super();

        this.context.analysis = true;
        this.context.title = 'Analysis';
        this.context.scripts = [{ script: 'assets/js/analysis.js' }];
        this.context.stylesheets = [{ stylesheet: 'assets/css/simpleXML.css' }, { stylesheet: 'assets/css/analysis.css' }];

        this.addView('/analysis', 'analysis', (req) => {

            return new Promise((resolve, reject) => {

                this.context.runningAnalysis = globalContext.runningAnalysis;

                if (globalContext.runningAnalysis) {
                    this.context.staticAnalysis = false;
                    this.context.dynamicAnalysis = false;
                    globalContext.runningAnalysis = true;
                    resolve();
                    return;
                } else {
                    globalContext.runningAnalysis = false;
                }

                const samplesPath = path.resolve('data', 'samples');

                fileScanner.scanSamples(samplesPath).then((result) => {
                    this.context.samples = result.samples;
                    this.context.selectedSample = undefined;
                }).then(() => {

                    this.context.staticAnalysis = false;
                    this.context.dynamicAnalysis = false;

                    if (req.query.id) {

                        this.context.selectedSample = this.context.samples[req.query.id];

                        this.returnStaticAnalysis(req).then(() => {
                            this.returnDynamicAnalysis(req).finally(() => {
                                resolve();
                            });
                        });

                    } else {
                        resolve();
                    }
                });
            });
        });

        this.addAction('/run', 'POST', (req, res) => {

            return new Promise((resolve, reject) => {

                if (req.query.id) {

                    globalContext.runningAnalysis = true;

                    this.context.selectedSample = this.context.samples[req.query.id];

                    let sampleId = req.query.id;
                    let sampleName = this.context.selectedSample.name;
                    let duration = 120;

                    const run_androguard = path.resolve('bin', 'run_androguard.sh');
                    const run_droidbox = path.resolve('bin', 'run_droidbox.sh');
                    const execute_run_androguard = `${run_androguard} ${sampleId} ${sampleName}`;
                    const execute_run_droidbox = `${run_droidbox} ${sampleId} ${sampleName} ${duration}`;

                    globalContext.stdout = `Running ${execute_run_droidbox}\n`;

                    let stdoutCallback = (data) =>{
                        globalContext.stdout += data;
                    }

                    spawnPromise(execute_run_droidbox, stdoutCallback).then((result) => {
                        globalContext.stdout = `${result} \nRunning ${execute_run_androguard}\n`;
                            return spawnPromise(execute_run_androguard, stdoutCallback);
                    }).catch((e) => {
                        globalContext.stdout = e.message;
                    }).finally(() => {
                        globalContext.runningAnalysis = false;
                    });
                }

                resolve();

            }).finally(() => {
                res.redirect(req.get('referer'));
            });

        });

        this.addAction('/run_stdout', 'GET', (req, res) => {

            return new Promise((resolve, reject) => {

                if (globalContext.runningAnalysis) {
                    res.status(200).send(globalContext.stdout);
                    globalContext.stdout = '';
                } else {
                    res.status(200).send('done');
                }

                resolve();
            });
        });
    }

    returnStaticAnalysis(req) {

        return new Promise((resolve, reject) => {

            const rootAnalysisPath = path.resolve('data', 'static_analysis');
            const staticAnalysisPath = path.resolve('data', 'static_analysis', req.query.id);
            const manifestPath = path.resolve('data', 'static_analysis', req.query.id, 'manifest', 'manifest.xml');
            const decompiledUrl = 'analyzed/static_analysis/' + req.query.id + '/decompiled.zip';
            const resourcesUrl = 'analyzed/static_analysis/' + req.query.id + '/resources/resources.txt';

            if (!fs.pathExistsSync(rootAnalysisPath)) {
                fs.mkdirsSync(rootAnalysisPath);
            }

            if (fs.pathExistsSync(staticAnalysisPath)) {

                this.context.staticAnalysis = true;
                this.context.decompiledUrl = decompiledUrl;
                this.context.resourcesUrl = resourcesUrl;

                fs.readFile(manifestPath, (err, data) => {

                    if (err) {
                        reject(err);
                        return;
                    }

                    this.context.manifest = data;
                    resolve();

                });

            } else {
                this.context.staticAnalysis = false;
                resolve();
            }
        });
    }

    returnDynamicAnalysis(req) {

        return new Promise((resolve, reject) => {

            const rootAnalysisPath = path.resolve('data', 'dynamic_analysis');
            const dynamicAnalysisPath = path.resolve('data', 'dynamic_analysis', req.query.id);
            const outPath = path.resolve('data', 'dynamic_analysis', req.query.id, 'out');
            const screenshotsBaseUrl = 'analyzed/dynamic_analysis/' + req.query.id + '/out/';
            const analysisPath = path.resolve('data', 'dynamic_analysis', req.query.id, 'analysis.json');
            const analysisLogUrl = 'analyzed/dynamic_analysis/' + req.query.id + '/logs/analysis.log';
            const emulatorLogUrl = 'analyzed/dynamic_analysis/' + req.query.id + '/logs/emulator.log';
            const vncLogUrl = 'analyzed/dynamic_analysis/' + req.query.id + '/logs/vnc.log';

            this.context.screenshotsUrls = [];

            if (!fs.pathExistsSync(rootAnalysisPath)) {
                fs.mkdirsSync(rootAnalysisPath);
            }

            if (fs.pathExistsSync(dynamicAnalysisPath)) {

                this.context.dynamicAnalysis = true;
                this.context.outPath = outPath;
                this.context.analysisLogUrl = analysisLogUrl;
                this.context.emulatorLogUrl = emulatorLogUrl;
                this.context.vncLogUrl = vncLogUrl;

                fileScanner.scanFiles(outPath, 'png').then((screenshots) => {

                    screenshots.forEach(screenshot => {
                        this.context.screenshotsUrls.push(screenshotsBaseUrl + screenshot);
                    });

                    fs.readFile(analysisPath).then(data => {

                        let analysis = JSON.parse(data);

                        for (let accessId in analysis.fdaccess) {
                            analysis.fdaccess[accessId].data = hex_to_ascii(analysis.fdaccess[accessId].data);
                        }

                        this.context.analysis = JSON.stringify(analysis);

                        resolve();

                    }).catch(err => {
                        this.context.dynamicAnalysis = false;
                        resolve();
                    });
                });
            } else {
                this.context.dynamicAnalysis = false;
                resolve();
            }
        });
    }
}

module.exports = Analysis;
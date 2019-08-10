const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
const app = express();
const Home = require('./controllers/home');
const Analysis = require('./controllers/analysis');
const Options = require('./controllers/options');

var globalContext = {};
var controllers = {
    home: new Home(globalContext),
    analysis: new Analysis(globalContext),
    options: new Options(globalContext),
};

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(fileUpload());
app.engine('.hbs', exphbs({ extname: '.hbs' }));
app.set('view engine', '.hbs');

controllers.home.register(app);
controllers.analysis.register(app);
controllers.options.register(app);

app.use('/', express.static(path.join(__dirname, 'www')));
app.use('/analyzed', express.static(path.join(__dirname, 'data')));

app.listen(8080);
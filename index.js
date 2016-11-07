var express = require('express'),
    path = require('path'),
    exp_hbs  = require('express-handlebars');

var app = express();

app.engine('handlebars', exp_hbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use('/bootstrap', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/')));

app.get('/', function (req, res) {
    res.render('index');
});

app.listen(3000);
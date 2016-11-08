var express = require('express'),
    path = require('path'),
    request = require('request'),
    exp_hbs  = require('express-handlebars');

var app = express();

var hbs = exp_hbs.create({
    defaultLayout: 'main',
    helpers: {
        checkEmpty: function (value, key) {
            return !!value.hasOwnProperty(key);
        }
    }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');



app.use('/bootstrap', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/')));
app.use('/bootstrap-material', express.static(path.join(__dirname, '/node_modules/bootstrap-material-design/dist/')));
app.use('/jquery', express.static(path.join(__dirname, '/node_modules/jquery/dist/')));
app.use('/assets', express.static(path.join(__dirname, '/assets/')));

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/get-setlist', function (req, res) {
    if(req.query.hasOwnProperty('artistName')) {
        request('http://api.setlist.fm/rest/0.1/search/setlists.json/?artistName='+req.query.artistName, function (error, response, body) {
            if(!error && response.statusCode == 200) {
                var response_data = JSON.parse(body);

                if(response_data.hasOwnProperty('setlists') && response_data.setlists.setlist.length > 0) {
                    var setlists = response_data.setlists.setlist;

                    res.render('parts/searchResult.handlebars', {
                        setlists:setlists,
                        layout:false});
                }
            }
        });
    }
});

app.listen(3000);
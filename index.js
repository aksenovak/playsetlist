var express = require('express'),
    path = require('path'),
    request = require('request'),
    YouTube = require('youtube-node'),
    exp_hbs  = require('express-handlebars'),
    app = express(),
    hbs = exp_hbs.create({
        defaultLayout: 'main'
    }),
    yt_key = 'AIzaSyBJAxhVEZPvj8pkzBPWXwerut3GwRfz3ZY';

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
            if(!error && response.statusCode === 200) {
                var response_data = JSON.parse(body);

                if(response_data.hasOwnProperty('setlists') && response_data.setlists.setlist.length > 0) {
                    var setlists = response_data.setlists.setlist;

                    res.render('parts/searchResult.handlebars', {
                        setlists:setlists,
                        layout:false});
                }
            } else {
                if(response.statusCode === 404) {
                    res.status(404).json({error: body});
                }
            }
        });
    }
});

app.get('/get-videoId', function (req, res) {
    if(req.query.hasOwnProperty('song')) {
        var youtube = new YouTube(),
            song = req.query.song;

        youtube.setKey(yt_key);

        youtube.search(song, 2, function(error, result) {
            if (error) {
                console.log(error);
            }
            else {
                res.send({videoId:result.items[0].id.videoId});
            }
        });
    }
});

app.get('/get-playlist',  function (req, res) {
    if(req.query.hasOwnProperty('songs')) {
        var songs = req.query.songs;

        if(songs.length > 0) {
            var youTube = new YouTube(),
                playlist = [],
                i;

            youTube.setKey(yt_key);

            for(i = 0; i < songs.length; i++) {
                youTube.search(songs[i], 2, function(error, result) {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        playlist.push(result.items[0].id.videoId);
                    }
                });
            }

            if(i === songs.length) {
                console.info(playlist);
            }

            if(playlist.length > 0) {
                res.send(playlist);
            }
        }
    }
});

// app.listen(3000);

if (!module.parent) {
    var port = process.env.PORT || 3000;
    app.listen(port);
    console.log('Express started on port 3000');
}
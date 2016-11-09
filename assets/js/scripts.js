$(function () {
    var bandNameInput = $('#bandNameInput'),
        getSetlistBtn = $('#getSetlistBtn'),
        listsWrap = $('#listsWrap'),
        removePlayer = $('#removePlayer'),
        playlist = [],
        playlist_count = 0,
        songs_array = [],
        playerWrap = $('#playerWrap');

    $(document).ajaxStop(function () {
        if (playlist.length > 0) {
            renderPlayer(playlist);
            loaderShow(false);
        } else {
            if (playlist_count > 0) {
                renderAlert('Can\' find any song');
            }

            loaderShow(false);
        }
    });

    removePlayer.on('click', function (e) {
        e.preventDefault();

        $(playerWrap.find('#playerContainer')).remove();

        playlist = [];
        playlist_count = 0;

        playerWrap.addClass('hidden').append('<div id="playerContainer"></div>');
    });

    bandNameInput.on('keydown', function(e) {
        if (e.which === 13 || e.keyCode === 13) {
            e.preventDefault();

            var value = $.trim($(this).val());

            if (value !== '') {
                getSetlists(value);
            } else {
                renderAlert('Enter band name');
            }
        }
    });

    getSetlistBtn.on('click', function (e) {
        e.preventDefault();

        var value = $.trim(bandNameInput.val());

        if(value !== '') {
            getSetlists(value);
        } else {
            renderAlert('Enter band name');
        }
    });

    function renderPlayer(list) {
        playerWrap.removeClass('hidden');

        var playerUP, playerReady;

        onYouTubeIframeAPIReady();

        function onYouTubeIframeAPIReady() {
            playerUP = new YT.Player('playerContainer', {
                events: {
                    'onReady': onPlayerReady
                }
            });
        }

        function onPlayerReady() {
            playerReady = true;

            playerUP.cuePlaylist({
                'playlist': list
            });
        }
    }

    function getSetlists(val) {
        loaderShow(true);

        playlist = [];
        playlist_count = 0;
        songs_array = [];

        $.when(getSetlistRequest(val)).then(
            function (res) {
                loaderShow(false);
                drawTemplate(res.setlists);

                // renderSetlist(res);
            },
            function (err) {
                if(err.responseJSON.hasOwnProperty('error')) {
                    loaderShow(false);

                    if(err.status == 404) {
                        renderAlert(err.responseJSON.error);
                    } else {
                        renderAlert('Server error. Reload page.');
                    }
                }
            }
        );
    }

    function getPlaylist(songs) {
        loaderShow(true);

        $.when(getPlaylistRequest(songs)).then(
            function (res) {
                loaderShow(false);
                debugger;
            },
            function (err) {
                loaderShow(false);
                renderAlert('Server error. Reload page.');
            }
        );
    }

    function getVideoId(song, artist) {
        $.when(getVideoIdRequest(song, artist)).then(
            function (res) {

                console.info(res);

                if (res.hasOwnProperty('items')) {
                    playlist_count++;

                    if (res.items.length > 0) {
                        if (res.items[0].hasOwnProperty('id')) {
                            if (res.items[0].id.hasOwnProperty('videoId')) {
                                playlist.push(res.items[0].id.videoId);
                            }
                        }
                    }
                }

                // playlist.push(res.videoId);
            },
            function (err) {
                loaderShow(false);
                renderAlert('Server error. Reload page.');
            }
        );
    }

    function getSetlistRequest(name) {
        return $.ajax({
            url: '/get-setlist/',
            method: 'GET',
            data: {
                artistName: name
            }
        });
    }

    function getPlaylistRequest(songs) {
        return $.ajax({
            url: '/get-playlist/',
            method: 'GET',
            data: {
                songs: songs
            }
        });
    }

    function getVideoIdRequest(song, artist) {
        return $.ajax({
            url: '/get-videoId/',
            method: 'GET',
            data: {
                song: song,
                artist: artist
            }
        });
    }

    function loaderShow(status) {
        var mainLoader = $('#mainLoader');

        if(status) {
            mainLoader.removeClass('hidden');
        } else {
            setTimeout(function () {
                mainLoader.addClass('hidden');
            }, 350);
        }
    }

    function renderSetlist(template) {
        listsWrap.html(template);
        listsWrap.on('click', 'a.set-list-btn', function (e) {
            e.preventDefault();
            generatePlaylist($(this));
        });
    }

    function drawTemplate(setlists) {
        if(listsWrap.find('a.set-list-btn').length > 0) {
            listsWrap.find('a.set-list-btn').each(function () {
                $(this).off('click');
            });
        }

        listsWrap.off('click');
        listsWrap.html('');

        var main_wrap = '';

        $.each(setlists, function (i, setlist) {
            if(setlist.hasOwnProperty('sets') && (typeof setlist.sets != 'string')) {
                var setlist_id = setlist['@id'],
                    event_date = '', tour = '', artist = '',
                    setlist_tmp = '', heading_tmp = '',
                    list_tmp = '';

                if(setlist.hasOwnProperty('@eventDate') && setlist['@eventDate'] != '') {
                    var ed_val = setlist['@eventDate'];

                    event_date = '<span><b>Date:&nbsp;</b>'+ed_val+'</span>&nbsp;';
                }

                if(setlist.hasOwnProperty('@tour') && setlist['@tour'] != '') {
                    var tour_val = setlist['@tour'];

                    tour = '<span><strong>Tour:&nbsp;</strong>'+tour_val+'</span>&nbsp;';
                }

                if(setlist.hasOwnProperty('artist')) {
                    if(setlist.artist.hasOwnProperty('@name') && setlist.artist['@name'] != '') {
                        var artist_val = setlist.artist['@name'];

                        artist = '<span class="artist-name" data-name="'+artist_val+'"><strong>Artist:&nbsp;</strong>'+artist_val+'</span>&nbsp;';
                    }
                }

                if(setlist.sets.set.length > 0) {
                    $.each(setlist.sets.set, function (st, set) {
                        if(set.song.length > 0) {
                            $.each(set.song, function (s, sng) {
                                var name_val = sng['@name'],
                                    tape_icon = sng.hasOwnProperty('@tape') ? '<span title="Song played from tape"><i class="material-icons">&#xE0D9;</i></span>' : '',
                                    cover_text = sng.hasOwnProperty('cover') ? '<span class="cover-song">('+sng.cover["@name"]+' song)</span>' : '';

                                setlist_tmp += '<li data-song="'+name_val+'">'+name_val+'&nbsp;'+tape_icon+'&nbsp;'+cover_text+'</li>';
                            });
                        } else {
                            var name_v = set.song['@name'],
                                tape_icon = set.song.hasOwnProperty('@tape') ? '<span title="Song played from tape"><i class="material-icons">&#xE0D9;</i></span>' : '',
                                cover_text = set.song.hasOwnProperty('cover') ? '<span class="cover-song">('+set.song.cover["@name"]+' song)</span>' : '';

                            setlist_tmp += '<li data-song="'+name_v+'">'+name_v+'&nbsp;'+tape_icon+'&nbsp;'+cover_text+'</li>';
                        }
                    });

                    setlist_tmp = '<ol>'+setlist_tmp+'</ol>';

                    heading_tmp = '<div class="panel-heading" role="tab" id="heading'+setlist_id+'">' +
                        '<h4 class="panel-title pull-left">' +
                        '<a role="button" data-toggle="collapse" data-parent="#accordion" href="#setlist'+setlist_id+'" aria-expanded="true" aria-controls="'+setlist_id+'">' +
                        '' + artist + event_date + tour + '' +
                        '</a>' +
                        '</h4>' +
                        '<a class="btn btn-danger btn-fab btn-fab-mini pull-right set-list-btn" title="Get playlist!" data-setlist-wrap="#setlist'+setlist_id+'"><i class="material-icons">&#xE038;</i></a>' +
                        '</div>';

                    list_tmp = '<div id="setlist'+setlist_id+'" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="heading'+setlist_id+'">' +
                        '<div class="panel-body">' + setlist_tmp + '</div>' +
                        '</div>';

                    main_wrap += '<div class="set-list-container">' +
                        '<div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">' +
                        '<div class="panel panel-default">'+ heading_tmp + list_tmp +'</div></div></div>';

                } else {
                    if(setlist.sets.hasOwnProperty('set')) {
                        if(setlist.sets.set.song.length > 0) {
                            $.each(setlist.sets.set.song, function (ss, sng) {
                                var name_val = sng['@name'],
                                    tape_icon = sng.hasOwnProperty('@tape') ? '<span title="Song played from tape"><i class="material-icons">&#xE0D9;</i></span>' : '',
                                    cover_text = sng.hasOwnProperty('cover') ? '<span class="cover-song">('+sng.cover["@name"]+' song)</span>' : '';

                                setlist_tmp += '<li data-song="'+name_val+'">'+name_val+'&nbsp;'+tape_icon+'&nbsp;'+cover_text+'</li>';
                            });

                            setlist_tmp = '<ol>'+setlist_tmp+'</ol>';

                            heading_tmp = '<div class="panel-heading" role="tab" id="heading'+setlist_id+'">' +
                                '<h4 class="panel-title pull-left">' +
                                '<a role="button" data-toggle="collapse" data-parent="#accordion" href="#setlist'+setlist_id+'" aria-expanded="true" aria-controls="'+setlist_id+'">' +
                                '' + artist + event_date + tour + '' +
                                '</a>' +
                                '</h4>' +
                                '<a class="btn btn-danger btn-fab btn-fab-mini pull-right set-list-btn" title="Get playlist!" data-setlist-wrap="#setlist'+setlist_id+'"><i class="material-icons">&#xE038;</i></a>' +
                                '</div>';

                            list_tmp = '<div id="setlist'+setlist_id+'" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="heading'+setlist_id+'">' +
                                '<div class="panel-body">' + setlist_tmp + '</div>' +
                                '</div>';

                            main_wrap += '<div class="set-list-container">' +
                                '<div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">' +
                                '<div class="panel panel-default">'+ heading_tmp + list_tmp +'</div></div></div>';
                        }
                    }
                }
            }
        });

        listsWrap.html(main_wrap);
        listsWrap.on('click', 'a.set-list-btn', function (e) {
            e.preventDefault();

            songs_array = [];
            playlist = [];
            playlist_count = 0;

            generatePlaylist($(this));
        });
    }

    function generatePlaylist(element) {
        var songs_list_wrap = $(element.data('setlist-wrap')),
            artist_wrap = $(songs_list_wrap.parent()).find('.artist-name'),
            artiat_value = artist_wrap.length > 0 ? artist_wrap.data('name') : '',
            song_list_ol = $(songs_list_wrap.find('ol'));

        song_list_ol.find('li').each(function () {
            songs_array.push($(this).data('song'));
        });

        if(songs_array.length > 0) {
            loaderShow(true);

            $.each(songs_array, function (i, song) {
                getVideoId(song, artiat_value);
            });
        }
    }

    function renderAlert(text) {
        var alertsWrap = $('#alertsWrap'),
            current_uid  = guid(),
            template = '<div id="'+current_uid+'" class="alert alert-warning">' +
                '<button type="button" class="close"><span aria-hidden="true">&times;</span></button>' +
                '<strong>Warning!&nbsp;</strong><span>'+text+'</span>' +
                '</div>';

        alertsWrap.append(template);

        var current_alert = alertsWrap.find('#'+current_uid),
            current_alert_btn = current_alert.find('button');

        $(current_alert_btn).on('click', function (e) {
            e.preventDefault();

            $(this).parent().remove();
        });

        setTimeout(function () {
            $(current_alert).animate({
                opacity: 0
            }, "slow", function () {
                $(current_alert).remove();
            });
        }, 5000);
    }

    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }
});
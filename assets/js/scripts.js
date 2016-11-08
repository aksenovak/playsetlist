$(function () {
    var bandNameInput = $('#bandNameInput'),
        getSetlistBtn = $('#getSetlistBtn'),
        listsWrap = $('#listsWrap'),
        removePlayer = $('#removePlayer'),
        playlist = [],
        playerWrap = $('#playerWrap');

    $(document).ajaxStop(function () {
        if(playlist.length > 0) {
            renderPlayer(playlist);
            loaderShow(false);
        }
    });

    removePlayer.on('click', function (e) {
        e.preventDefault();

        $(playerWrap.find('#playerContainer')).remove();

        playlist = [];

        playerWrap.addClass('hidden').append('<div id="playerContainer"></div>');
    });

    bandNameInput.on('keydown', function(e) {
        if (e.which === 13 || e.keyCode === 13) {
            e.preventDefault();

            var value = $.trim($(this).val());

            if(value !== '') {
                getSetlists(value);
            }
        }
    });

    getSetlistBtn.on('click', function (e) {
        e.preventDefault();

        var value = $.trim(bandNameInput.val());

        if(value !== '') {
            getSetlists(value);
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

        $.when(getSetlistRequest(val)).then(
            function (res) {
                loaderShow(false);
                renderSetlist(res);
            },
            function (err) {
                if(err.responseJSON.hasOwnProperty('error')) {
                    loaderShow(false);

                    if(err.status == 404) {
                        renderAlert(err.responseJSON.error);
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
                debugger;
            }
        );
    }

    function getVideoId(song) {
        $.when(getVideoIdRequest(song)).then(
            function (res) {
                playlist.push(res.videoId);
            },
            function (err) {
                debugger;
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

    function getVideoIdRequest(song) {
        return $.ajax({
            url: '/get-videoId/',
            method: 'GET',
            data: {
                song: song
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

    function generatePlaylist(element) {
        var songs_list_wrap = $(element.data('setlist-wrap')),
            song_list_ol = $(songs_list_wrap.find('ol')),
            songs_array = [];

        song_list_ol.find('li').each(function () {
            songs_array.push($(this).data('song'));
        });

        if(songs_array.length > 0) {
            loaderShow(true);

            $.each(songs_array, function (i, song) {
                getVideoId(song);
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
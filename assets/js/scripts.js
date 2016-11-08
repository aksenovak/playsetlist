$(function () {
    var bandNameInput = $('#bandNameInput'),
        getSetlistBtn = $('#getSetlistBtn'),
        listsWrap = $('#listsWrap');

    getSetlistBtn.on('click', function (e) {
        e.preventDefault();

        $.when(getSetlistRequest(bandNameInput.val())).then(
            function (res) {
                listsWrap.html(res);
            },
            function (err) {
                debugger;
            }
        )
    });

    function getSetlistRequest(name) {
        return $.ajax({
            url: '/get-setlist/',
            method: 'GET',
            data: {
                artistName: name
            }
        });
    }
});
Game.refreshMainMenu = function(data) {
    var i, len = data.length;
    var focusTr;
    $('<div><table class="main-menu-table"><tr class="main-menu-header-row"><th width="80">Players</th><th width="80">Running</th></tr></table></div>').appendTo('#session-list');
    for (var i = 0; i < len; i++) {
        $('<div class="main-menu-item"><table class="main-menu-table"><tr class="main-menu-row"><td width="80">' + data[i].players + '</td><td width="80">' + (data[i].running ? 'Yes' : 'No')  + '</td></tr></table></div>').appendTo('#session-list');
    }

    $('.main-menu-item').click(function(event) {
        var trElem = $(event.target).parent('tr');
        if (trElem && trElem !== focusTr) {
            if (focusTr) {
                $(focusTr).removeClass('main-menu-row-focus');
            }
            focusTr = trElem;
            $(focusTr).addClass('main-menu-row-focus');
        }
    });
};

(function() {
    var makeUnselectable = function(node) {
        if (node.nodeType == 1) {
            node.unselectable = true;
        }
        var child = node.firstChild;
        while (child) {
            makeUnselectable(child);
            child = child.nextSibling;
        }
    }

    var joinCallback = function() {
        // get the server index
        if (!focusTr) {
            return;
        }

        var itemEl = $(focusTr).parents('div.main-menu-item'),
        serverIndex = $(itemEl).index();

        Game.socket.emit('session', {
            action: 'join',
            index: serverIndex
        });
    };

    var joinSpectatorCallback = function() {
        // get the server index
        if (!focusTr) {
            return;
        }

        var itemEl = $(focusTr).parents('div.main-menu-item'),
        serverIndex = $(itemEl).index();

        Game.socket.emit('session', {
            action: 'join',
            index: serverIndex,
            spectator: true
        });
    };

    var focusTr;

    Game.mainMenu = {};
    Game.mainMenu.refreshAll = function(data) {
        var i, len = data.length;
        $('#session-list').empty();
        $('<div><table class="main-menu-table"><tr class="main-menu-header-row">' +
          '<th class="main-menu-column-index main-menu-column">Server</th>' +
          '<th class="main-menu-column-players main-menu-column">Players</th>' +
          '<th class="main-menu-column main-menu-column-spectators">Spectators</th>' +
          '<th class="main-menu-column-running main-menu-column">Running</th>' +
          '</tr></table></div>').appendTo('#session-list');
        var rowsElem = $('<div class="main-menu-rows"></div>').appendTo('#session-list');
        for (var i = 0; i < len; i++) {
            $('<div class="main-menu-item"><table class="main-menu-table"><tr class="main-menu-row">' +
              '<td class="main-menu-column-index main-menu-column">' + (i + 1) + '</td>' +
              '<td class="main-menu-column-players main-menu-column">' + (data[i].players ? '<b>' + data[i].players + '</b' : data[i].players)  + '</td>' +
              '<td class="main-menu-column main-menu-column-spectators">' + (data[i].spectators ? '<b>' + data[i].spectators + '</b' : data[i].spectators)  + '</td>' +
              '<td class="main-menu-column-running main-menu-column">' + (data[i].running ? 'Yes' : 'No')  + '</td>' +
              '</tr></table></div>').appendTo(rowsElem);
        }

        makeUnselectable($('#session-list'));

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
        $('.main-menu-item').dblclick(function(event) {
            joinCallback();
        });
    };

    /**
     * @param {Number} index Server index to refresh
     * @param {Object} server Containing infos about a server:
     * ex: {
     *   players: 3,
     *   running: true
     * }
     */
    Game.mainMenu.refreshServer = function(index, server) {
        var menuItem = $('#session-list > .main-menu-rows').children('.main-menu-item')[index];
        var playersElem = $(menuItem).find('td.main-menu-column-players')[0];
        playersElem.innerHTML = server.players ? '<b>' + server.players + '</b>': server.players;
        var spectatorsElem = $(menuItem).find('td.main-menu-column-spectators')[0];
        spectatorsElem.innerHTML = server.spectators ? '<b>' + server.spectators + '</b>': server.spectators;
        var runningElem = $(menuItem).find('td.main-menu-column-running')[0];
        runningElem.innerText = server.running ? 'Yes' : 'No';
    };

    window.addEventListener('load', function () {
        Game.mainMenu.refreshAll([]);

        $('#join-player-button').click(joinCallback);
        $('#join-spectator-button').click(joinSpectatorCallback);
    }, false);

}())

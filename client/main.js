var history = [];
var historyOffset = 0;
var currentBuffer;
var outputEl;

function sendAndClear(inputEl, socket) {
    var value = inputEl.value;
    var typeEl = document.getElementById('message-type-select');
    var msgType = typeEl.options[typeEl.selectedIndex].value;

    var syntaxError;
    try {
        var obj = eval('(' + value + ')');
        socket.emit(msgType, obj);
        history.push(value);
        historyOffset = history.length;
        inputEl.value = '{ // enter your message fields below\n\n}';
        var pos = inputEl.value.indexOf('\n') + 1;
        inputEl.setSelectionRange(pos, pos);
        document.getElementById("syntax-error").hidden = true;
    } catch (e){
        syntaxError = document.getElementById("syntax-error");
        syntaxError.innerHTML = e.message;
        syntaxError.hidden = false;
    }
}

function upHistory(){
    var inputEl = document.getElementById("textarea-input");
    if (historyOffset === 0){
        return;
    }

    if (historyOffset === history.length){ // on top
        currentBuffer = inputEl.value;
    }
    inputEl.value = history[historyOffset - 1];
    historyOffset--;
}

function downHistory(){
    var inputEl = document.getElementById("textarea-input");
    if (historyOffset === history.length){
        return;
    }

    if (historyOffset === history.length - 1){ // on top
        inputEl.value = currentBuffer;
    } else {
        inputEl.value = history[historyOffset + 1];
    }
    historyOffset++;
}

function addLineToOutput(text) {
    outputEl.value += text + '\n';
    outputEl.scrollTop = outputEl.scrollHeight;
}

window.addEventListener('load', function () {
    var socket = io.connect('http://' + location.hostname);
    Game.socket = socket;

    outputEl = $('#textarea-output')[0];
    socket.on('connect', function(){
        addLineToOutput('connected on the game server');
    });
    socket.on('disconnect', function() {
        addLineToOutput('Disconnected from the game server');
    });
    socket.on('OK', function(data) {
        addLineToOutput("OK: " + JSON.stringify(data));
    });
    socket.on('KO', function(data) {
        addLineToOutput("KO: " + JSON.stringify(data));
    });
	socket.on('session', function(data) {
        addLineToOutput('Received: ' + JSON.stringify(data));
        Game.manageSessionMessage(data);
	});

    socket.on('game', function(data) {
        Game.manageGameMessage(data);
    });

    $('#clear-output-button').click(function() {
        $('#textarea-output')[0].value = '';
    });

    var inputEl = document.getElementById("textarea-input");
    inputEl.onkeypress = function(event){
        if (event.keyCode === 13 && event.shiftKey){
            sendAndClear(inputEl, socket);
            event.returnValue = false;
            return;
        }
    };
    inputEl.onkeydown = function(event){
        if (event.keyCode === 38 && event.ctrlKey) {
            upHistory();
            event.returnValue = false;
        } else if (event.keyCode === 40 && event.ctrlKey) {
            downHistory();
            event.returnValue = false;
        }
    };
    document.getElementById("send-button").onclick = function(){
        sendAndClear(inputEl, socket);
    };

    inputEl.value = '{ // enter your message fields below\n\n}';
    inputEl.focus();
    var pos = inputEl.value.indexOf('\n') + 1;
    inputEl.setSelectionRange(pos, pos);
}, false);

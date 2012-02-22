function sendAndClear(inputEl, socket) {
    var value = inputEl.value;
    var syntaxError;
    try {
        var obj = eval('(' + value + ')');
        socket.emit('message', obj);
        console.log(obj);

        inputEl.value = '';
        document.getElementById("syntax-error").hidden = true;
    } catch (e){
        syntaxError = document.getElementById("syntax-error");
        syntaxError.innerHTML = e.message;
        syntaxError.hidden = false;
    }
}

function upHistory(){
    console.log('up');
}

function downHistory(){
    console.log('down');
}

window.addEventListener('load', function () {
    var socket = io.connect('http://localhost');
    var outputEl = document.getElementById("textarea-output");
    socket.on('connect', function(){
        outputEl.value += "connected on the game server\n";
    });
    socket.on('disconnect', function(){
        outputEl.value += "Disconnected from the game server\n";
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
}, false);

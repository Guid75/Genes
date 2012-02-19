window.addEventListener('load', function () {
    var socket = io.connect('http://localhost');
    var outputEl = document.getElementById("textarea-output");
    socket.on('connect', function(){
        outputEl.value += "connected on the game server\n";
    });
    socket.on('disconnect', function(){
        outputEl.value += "Disconnected from the game server\n";
    });
    socket.on('news', function (data) {
        console.log(data);
        socket.emit('my other event', { my: 'data' });
    });
}, false);

var
libpath = require("path"),
http = require("http"),
fs = require("fs"),
url = require("url"),
mime = require("mime"),
socketio = require("socket.io"),
game = require("./game.js");

var rootPath = "..";
var clientPath = "../client";
var port = 8088;

var app = http.createServer(function (request, response) {
    var uri = url.parse(request.url).pathname;
    var filename = libpath.join(uri.indexOf('/common/') === 0 ? rootPath : clientPath, uri);

    libpath.exists(filename, function (exists) {
        if (!exists) {
            response.writeHead(404, {
                "Content-Type": "text/plain"
            });
            response.write("404 Not Found\n");
            response.end();
            return;
        }

        if (fs.statSync(filename).isDirectory()) {
            filename += '/index.html';
        }

        fs.readFile(filename, "binary", function (err, file) {
            if (err) {
                response.writeHead(500, {
                    "Content-Type": "text/plain"
                });
                response.write(err + "\n");
                response.end();
                return;
            }

            var type = mime.lookup(filename);
            response.writeHead(200, {
                "Content-Type": type
            });
            response.write(file, "binary");
            response.end();
            console.log("delivered " + filename);
        });
    });
});

app.listen(port);

// only for messages now
var io = socketio.listen(app);
io.sockets.on('connection', function(socket) {
    console.log('new connection');
    game.newPlayer(socket);
});

io.configure('development', function() {
	io.disable('log');
});

console.log("Evo server launched on port %d", port);

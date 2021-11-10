const express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http)

app.use(express.static('./public'))

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname })
});

http.listen(3000, () => console.log("Serve on"));

const rooms = {}
io.on('connection', socket => {
    socket.on('join room', ({ id, username, roomName }) => {
        socket.join(roomName);

        saveDataRoom(id, username, roomName);
        io.sockets.in(roomName).emit('user joined', { roomName, users: getUsersFromRoom(roomName) });
    });

    socket.on('message', (message) => {
        const { roomName, username } = searchInfoBySocketId(socket.id);
        io.sockets.in(roomName).emit('message', { message, username });
    });

    socket.on('disconnect', () => {
        const { roomName } = searchInfoBySocketId(socket.id)
        deleteUserFromRoom(socket.id, roomName)
        io.sockets.in(roomName).emit('user disconnect', { roomName, users: getUsersFromRoom(roomName) })
    });

   

});

function saveDataRoom(id, username, roomName) {
    let room = rooms[roomName]

    if (!room) {
        room = rooms[roomName] = {}
    }

    room[id] = username
    console.log(rooms);
}

function getUsersFromRoom(roomName) {
    if (rooms[roomName]) {
        return Object.values(rooms[roomName]);
    }

    return []
}

function searchInfoBySocketId(socketId) {
    for (const roomName in rooms) {
        const existInRoom = socketId in rooms[roomName];

        if (existInRoom) {
            return { roomName: roomName, username: rooms[roomName][socketId] }
        }
    }

    return { roomName: null, username: null }
}


function deleteUserFromRoom(socketId, roomName) {
    if (roomName) {
        delete rooms[roomName][socketId]
    }
} 

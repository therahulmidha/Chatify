const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const router = require('./router');
const cors = require('cors')

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');
// create socketio server
const app = express();

// allow cross origin resource sharing
// so that front end app on another server can access our backend  
app.use(cors());
const server = http.createServer(app);
const io = socketio(server);

io.on('connection', (socket) => {
    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({
            id: socket.id,
            name,
            room
        });

        if (error) {
            return callback(error);
        }

        // emit event from back end to front end
        socket.emit('message', {
            user: 'admin',
            text: `${user.name}, welcome to the room ${user.room}`
        });


        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name}, has joined` })

        // Joins a room. You can join multiple rooms, and by default, on connection, you join a room with the same name as your ID
        socket.join(user.room);

        // Emit who is present in the room
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback();
    });

    // admin generated messages will have event 'message'
    // and non admin event: 'sendMessage'
    // emitted from front end to backend 
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('message', {
            user: user.name,
            text: message
        });

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback();
    });

    // on a page refresh, user should be removed and joined again using join event
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left` })
        }

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
    })
})

app.use(router);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server has started on port: ${PORT}`));


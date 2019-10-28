const express = require('express')
const app = express()
const Config = require('./Config');
const User = require('./User');
const fs = require('fs');
const https = require('https');
const cors = require('cors')

const options = {
    key: fs.readFileSync(__dirname + '/ssl/key.pem'),
    cert: fs.readFileSync(__dirname + '/ssl/csr.pem')
};
app.use(cors({credentials: true, origin: true}))

app.get('/', function(req, res) {
    res.send('hello world');
});
const server = https.createServer(options, app).listen(3001, '0.0.0.0',function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('http://%s:%s', host, port);
});

//server = app.listen(3000, '0.0.0.0')
const io = require("socket.io")(server)
//io.set('origins', '*');
io.on('connection', (socket) => {
    const id = socket.id;
    console.log('New user connected', id)
	socket.username = "Anonymous"
    socket.role = Config.roles.slave
    const masterUser = User.getMasterUser();
    if(!masterUser){
        socket.role = Config.roles.master
    }
    User.add(socket);
    socket.emit('connected', {username: socket.username, role: socket.role})

    socket.on('change_camera_position', (data) => {
        User.getWithExclude(socket, (s) => {
            s.emit('change_camera_position', data)
        })
    })

    socket.on('click_property', (data) => {
        User.getWithExclude(socket, (s) => {
            s.emit('click_property', data)
        })
    })
    socket.on('search', (data) => {
        User.getWithExclude(socket, (s) => {
            s.emit('search', data)
        })
    })
    socket.on('hide_tooltip', () => {
        User.getWithExclude(socket, (s) => {
            s.emit('hide_tooltip')
        })
    })
    socket.on('fullscreen', (data) => {
        User.getWithExclude(socket, (s) => {
            s.emit('fullscreen', data)
        })
    })
    socket.on('toggle_compass', () => {
        User.getWithExclude(socket, (s) => {
            s.emit('toggle_compass')
        })
    })
    socket.on('change_position_light', (data) => {
        User.getWithExclude(socket, (s) => {
            s.emit('change_position_light', data)
        })
    })
    socket.on('swipbox', (data) => {
        User.getWithExclude(socket, (s) => {
            s.emit('swipbox', data)
        })
    })
    socket.on('close_modal', (data) => {
        User.getWithExclude(socket, (s) => {
            s.emit('close_modal', data)
        })
    })
    socket.on('visite_360', (data) => {
        User.getWithExclude(socket, (s) => {
            s.emit('visite_360', data)
        })
    })
    socket.on('disconnect', function() {
        User.remove(socket);
        const masterUser = User.getMasterUser();
        const users = User.get();
        if(!masterUser && users.length){
            const u = User.getFirst();
            if(u){
                User.setRole(u, Config.roles.master);
                u.emit('set_master');
            }
        }
    });

})

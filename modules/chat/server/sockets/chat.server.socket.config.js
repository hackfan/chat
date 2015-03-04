'use strict';

// Create the chat configuration
module.exports = function(io, socket) {

    // usernames which are connected to the chat now
    var usernames = {};
    var numUsers = 0;
    var addedUser = false;

	// Emit the status event when a new socket client is connected
    io.emit('chatMessage', {
        type: 'status',
        text: 'Is now connected',
        created: Date.now(),
        profileImageURL: socket.request.user.profileImageURL,
        username: socket.request.user.username
    });

    // Send a chat messages to all connected sockets when a message is received 
    socket.on('chatMessage', function(message) {
        message.type = 'message';
        message.created = Date.now();
        message.profileImageURL = socket.request.user.profileImageURL;
        message.username = socket.request.user.username;

        // Emit the 'chatMessage' event
        io.emit('chatMessage', message);
    });

    // Emit the status event when a socket client is disconnected
    socket.on('disconnect', function() {
        --numUsers;
        io.emit('chatMessage', {
            type: 'status',
            text: 'disconnected',
            created: Date.now(),
            profileImageURL: socket.request.user.profileImageURL,
            username: socket.request.user.username
        });
        // echo globally (all clients) that a person has disconnected
        socket.broadcast.emit('user left', {
            username: socket.request.user.username,
            numUsers: numUsers
        });
    });

    // When the client emits 'add user', this listens and executes
    socket.on('add user', function() {
        // add the client's username to the global list
        usernames[socket.request.user.username] = socket.request.user.username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {
        socket.broadcast.emit('typing', {
          username: socket.username
      });
    });

      // when the client emits 'stop typing', we broadcast it to others
      socket.on('stop typing', function () {
        socket.broadcast.emit('stop typing', {
          username: socket.username
      });
    });
};

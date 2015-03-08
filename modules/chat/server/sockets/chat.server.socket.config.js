'use strict';

// Create the chat configuration
module.exports = function(io, socket) {
  
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
        --io.numUsers;
        delete io.usernames[socket.request.user.username];
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
            numUsers: io.numUsers,
            usernames: io.usernames
        });
    });

    // When the client emits 'add user', this listens and executes
    socket.on('add user', function() {
        // add the client's username to the global list
        io.usernames[socket.request.user.username] = socket.request.user.username;
        ++io.numUsers;
        // echo globally (all clients) that a person has connected
        io.emit('user joined', {
            username: socket.request.user.username,
            numUsers: io.numUsers,
            usernames: io.usernames
        });
        // Emit the status event when a new socket client is connected
        io.emit('chatMessage', {
            type: 'status',
            text: 'Is now connected',
            created: Date.now(),
            profileImageURL: socket.request.user.profileImageURL,
            username: socket.request.user.username
        });
    });

    // When the client emits 'remove user', this listens and executes
    socket.on('remove user', function() {
        // remove the client's username to the global list
        delete io.usernames[socket.request.user.username];
        --io.numUsers;
        socket.broadcast.emit('chatMessage', {
            type: 'status',
            text: 'disconnected',
            created: Date.now(),
            profileImageURL: socket.request.user.profileImageURL,
            username: socket.request.user.username
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user left', {
            username: socket.request.user.username,
            numUsers: io.numUsers,
            usernames: io.usernames
        });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {
        io.emit('typing', {
          username: socket.request.user.username
      });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {
        io.emit('stop typing', {
          username: socket.request.user.username
      });
    });
};

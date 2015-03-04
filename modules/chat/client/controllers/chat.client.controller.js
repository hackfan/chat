'use strict';

// Create the 'chat' controller
angular.module('chat').controller('ChatController', ['$scope', 'Socket',
    function($scope, Socket) {
        var TYPING_TIMER_LENGTH = 400; // ms
        var username;
        var connected = false;
        var typing = false;
        var lastTypingTime;
        var typingUser = {};

    	// Create a messages array
        $scope.messages = [];

        // Number of participating users
        $scope.numUsers = 1;
        
        // Add an event listener to the 'chatMessage' event
        Socket.on('chatMessage', function(message) {
            $scope.messages.unshift(message);
        });
        
        // Create a controller method for sending messages
        $scope.sendMessage = function() {
        	// Create a new message object
            var message = {
                text: this.messageText
            };
            
            // Emit a 'chatMessage' message event
            Socket.emit('chatMessage', message);
            
            // Clear the message text
            this.messageText = '';
        };

        // Remove the event listener when the controller instance is destroyed
        $scope.$on('$destroy', function() {
            Socket.removeListener('chatMessage');
        });


        // Updates the typing event
        function updateTyping () {
            if (connected) {
              if (!typing) {
                typing = true;
                socket.emit('typing');
            }
            lastTypingTime = (new Date()).getTime();

            setTimeout(function () {
                var typingTimer = (new Date()).getTime();
                var timeDiff = typingTimer - lastTypingTime;
                if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                    socket.emit('stop typing');
                    typing = false;
                }
              }, TYPING_TIMER_LENGTH);
            }
        }


        // Keyboard events

        $scope.keydown = function (event) {
            updateTyping();
            // When the client hits ENTER on their keyboard
            if (event.which === 13) {
                $scope.sendMessage();
                socket.emit('stop typing');
                typing = false;                
            }
        };

        // Whenever the user login, emit 'add user'
        $scope.login = function() {
            Socket.emit('add user');
        };

        Socket.on('login', function(data) {
            $scope.numUsers = data.numUsers;
        });

        Socket.on('logout', function(data) {
            $scope.numUsers = data.numUsers;
        });

        Socket.on('user joined', function(data) {
            $scope.numUsers = data.numUsers;
        });

        Socket.on('user left', function(data) {
            $scope.numUsers = data.numUsers;
        });

        $scope.login();
    }
]); 

'use strict';

// Create the 'chat' controller
angular.module('chat').controller('ChatController', ['$scope', 'Socket',
    function($scope, Socket) {
        var TYPING_TIMER_LENGTH = 400; // ms
        var username;
        $scope.typing = false;
        var lastTypingTime;
        $scope.typingUser = null;

    	// Create a messages array
        $scope.messages = [];

        // Number of participating users
        $scope.numUsers = 0;
        $scope.usernames = [];

        
        // Add an event listener to the 'chatMessage' event
        Socket.on('chatMessage', function(message) {
            $scope.messages.push(message);
        });
        
        // Create a controller method for sending messages
        $scope.sendMessage = function() {
            // Don't send blank messages
            if (this.messageText.length && this.messageText.trim().length) {    
        	    // Create a new message object
                var message = {
                    text: this.messageText
                };
                
                // Emit a 'chatMessage' message event
                Socket.emit('chatMessage', message);               
            }
            // Clear the message text
            this.messageText = '';
        };

        // Remove the event listener when the controller instance is destroyed
        $scope.$on('$destroy', function() {
            Socket.emit('disconnect');
            Socket.removeListener('chatMessage');
        });

        // Updates the typing event
        function updateTyping () {
            if (!$scope.typing) {
                Socket.emit('typing');
            }
            lastTypingTime = (new Date()).getTime();

            setTimeout(function () {
                var typingTimer = (new Date()).getTime();
                var timeDiff = typingTimer - lastTypingTime;
                if (timeDiff >= TYPING_TIMER_LENGTH && $scope.typing) {
                    Socket.emit('stop typing');
                    $scope.typing = false;
                }
            }, TYPING_TIMER_LENGTH);
        }


        // Keyboard events

        $scope.keydown = function (event) {
            updateTyping();
            // When the client hits ENTER on their keyboard
            if (event.which === 13) {
                $scope.sendMessage();
                Socket.emit('stop typing');
                $scope.typing = false;                
            }
        };

        // Whenever the user joins, emit 'add user'
        Socket.emit('add user');

        Socket.on('logout', function(data) {
            $scope.numUsers = data.numUsers;
        });

        Socket.on('user joined', function(data) {
            $scope.numUsers = data.numUsers;
            $scope.usernames = data.usernames;
        });

        Socket.on('user left', function(data) {
            $scope.numUsers = data.numUsers;
            $scope.usernames = data.usernames;
        });

        Socket.on('typing', function(data) {            
            $scope.typingUser = data.username;
            $scope.typing = true;
        });

        Socket.on('stop typing', function(data) {            
            $scope.typing = false;
            $scope.typingUser = null;
        });
    }
]); 

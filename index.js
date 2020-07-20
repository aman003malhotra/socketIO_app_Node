const path = require("path")
const http = require('http');
const express = require("express");
const socketio = require('socket.io')
const formatMessage = require('./utils/messages');

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketio(server);
const {userJoin, getCurrentUser, userLeave, getRoomUser} = require('./utils/users');

// SET static folder to public
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatCord Bot';

// Run when client connects
io.on('connection', socket => {
    console.log("New Ws connection...");

    socket.on('joinRoom', ({username, room}) =>{
      const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit("message", formatMessage(botName,'Welcome to ChartCord!'));


    // Broadcast when a user connects
    socket.broadcast.to(user.room).emit("message", formatMessage(botName,`${user.username} has joined the chat`));
    // It emits the message to everyone else the user who has joined

    // Send users room info to main.js
    io.to(user.room).emit('roomUsers', {
      room: user.room, // ROOM NAME FROM THE CURRENT USER'S ROOM NAME
      users: getRoomUser(user.room) // LIST OF USERS FROM THE ARRAY MADE IN UTILS
    });

  });



  // Listen for "chatMessage" from the users
  socket.on("chatMessage", (message)=>{
    const user = getCurrentUser(socket.id);
    console.log("chat Message", user);

    // SENDING THE MESSAGE TO MAIN.JS FOR INCLUDING IT INTO THE DOM
    io.to(user.room).emit('message', formatMessage(user.username,message));
  });



  // Runs when the client disconnects
  socket.on('disconnect', ()=>{
    const user = userLeave(socket.id);
    if(user){
      io.emit('message', formatMessage(botName,`${user.username} has left the chat`));
    }

    // Send users room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUser(user.room)
    });

  });

});



server.listen(PORT, ()=>{console.log(`Server running on port ${PORT}`)});

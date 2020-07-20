const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from url
const {username, room} = Qs.parse(location.search,{ // line number 48 chat.html
  ignoreQueryPrefix: true
});

const socket = io();

// JOIN chatroom
socket.emit('joinRoom', { username,room });

// Get room and users
socket.on('roomUsers', ({room,users}) => {
  outputRoomName(room);
  outputUsers(users);
})

//  ALL THE MESSAGES FROM THE SERVER
socket.on("message", (message) => {
  // console.log(message);
  outputMessage(message);


// AUTOMATIC Scroll Down
chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e)=>{
  e.preventDefault();

  // Get message text
  const message = e.target.elements.msg.value;

  // Emit message to server
  socket.emit("chatMessage",message);

  // Clear input
  e.target.elements.msg.value = '';

  // focus on that input
  e.target.elements.msg.focus;
});

// OUTPUT message to DOM
function outputMessage(message){
  const div = document.createElement('div'); // create a new div element
  div.classList.add('message'); // add the class name to list of class for that div element
  div.innerHTML = `
      <p class="meta">${message.username}<span> ${message.time}</span></p>
      <p class="text">${message.text}</p>`;
  document.querySelector('.chat-messages').appendChild(div);
};

// Add room name to DOM
function outputRoomName(room){
  roomName.innerText = room;
}

// Add Users to DOM
function outputUsers(users){
  userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join("")}`;
}

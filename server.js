// Require the necessary modules
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);


app.set('view engine', 'ejs');

app.use(express.static('public'));

// Define the main page route
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/r', (req, res) => {

  res.render('researcher', { activeRooms, secondActiveRooms });
});

const secondActiveRooms = {};

app.get('/s', (req, res) => {
  const roomId = uuidv4();
  secondActiveRooms[roomId] = {
    users: []
  };

  res.render('second_phase',{roomId});
});

app.get('/w',(req,res)=>{
  res.render('waiting',{secondActiveRooms})
});

// Active rooms data structure (you can choose your preferred data structure)
const activeRooms = {};

// Define the route to create a new room with a UUID
app.get('/create', (req, res) => {
  // Generate a new UUID for the room
  const roomId = uuidv4();

  // Create a new room in the activeRooms data structure
  activeRooms[roomId] = {
    users: []
  };
  res.redirect(`/${roomId}`);
});

// Define the route to join an active room with a UUID
app.get('/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  const userRole=req.query.userRole;
  const userName=req.query.userName;
  if(secondActiveRooms.hasOwnProperty(roomId)){
    res.render('second_phase',{roomId});
  }else if (activeRooms.hasOwnProperty(roomId)) {
    res.render('room', { roomId, userRole, userName });
  } else {
    res.redirect('/');
  }
});

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId,userName, userRole) => {
      try {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId,userName, userRole);

        socket.on('disconnect', () => {
          socket.to(roomId).emit('user-disconnected', userId);
        });

        socket.on('chat-message', message => {
          io.to(roomId).emit('chat-message', { userId, message });
        });

      } catch (error) {
        console.error('Error in join-room event:', error);
      }
    });
    socket.on('join-second-room', (roomId, userId) => {
      try {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);

        socket.on('disconnect', () => {
          socket.to(roomId).emit('user-disconnected', userId);
        });

      } catch (error) {
        console.error('Error in join-room event:', error);
      }
    });
});

// Start the server
server.listen(3000, () => {
  console.log('Server started on port 3000');
});

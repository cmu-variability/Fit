// Require the necessary modules
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Serve static files from the public directory
app.use(express.static('public'));

// Active rooms data structure (you can choose your preferred data structure)
const activeRooms = {};

// Define the main page route
app.get('/', (req, res) => {
  res.render('index');
});

// Define the route to create a new room with a UUID
app.get('/create', (req, res) => {
  const roomId = uuidv4(); // Generate a new UUID for the room

  // Create a new room in the activeRooms data structure
  activeRooms[roomId] = {
    // Add any additional room data as needed
    users: []
  };

  res.redirect(`/${roomId}`);
});

app.post('/join', (req, res) => {
    const roomId = req.body.roomId; // Get the room ID input from the request body

    res.redirect(`/room/${roomId}`);
});

app.get('/room/:roomId', (req, res) => {
    const roomId = req.params.roomId; // Get the room ID from the URL

    // Additional logic for validating the room ID or checking if it is active
    // ...

    const userId = 'exampleUserId'; // Replace 'exampleUserId' with your actual user ID

    res.render('room', { roomId, userId }); // Pass roomId and userId to the room template
});



// Define the route to join an active room with a UUID
app.get('/:roomId', (req, res) => {
  const roomId = req.params.roomId;

  // Check if the room exists and is active
  if (activeRooms.hasOwnProperty(roomId)) {
    res.render('room', { roomId });
  } else {
    res.redirect('/');
  }
});

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
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

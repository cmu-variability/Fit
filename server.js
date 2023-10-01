// Require the necessary modules
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const possibleUserNames = [
  "Lazy Lion", "Gritty Goon", "Pretty Penguin", "Jolly Jaguar", "Brave Bear", "Witty Walrus", 
  "Daring Deer", "Eager Elephant", "Zealous Zebra", "Calm Camel", "Silly Squirrel", "Curious Cat",
  "Merry Monkey", "Rugged Rhino", "Quick Quokka", "Fancy Fox", "Happy Hippo", "Tiny Tiger", "Giddy Gorilla",
  "Bouncy Bunny", "Adventurous Ant", "Playful Panda", "Keen Kangaroo", "Vibrant Vulture", "Noble Nightingale"
];

app.set('view engine', 'ejs');

app.use(express.static('public'));

// Define the index page route
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/r', (req, res) => {

  res.render('researcher', { activeRooms, secondActiveRooms });
});

const secondActiveRooms = {};

//Define the second-phase meeting room route
app.get('/s', (req, res) => {
  const roomId = uuidv4();
  secondActiveRooms[roomId] = {
    users: []
  };

  res.render('second_phase',{roomId});
});

app.get('/:roomId/waitingRoom', (req, res) => {
  const roomId = req.params.roomId;
  //... your logic to handle what should be done for this waiting room ...
  secondActiveRooms[roomId] = {
    users: []
  };
  // As an example, render a waiting room view:
  res.render('second_phase', { roomId });
});


//Define the route that show a list of open waiting rooms
//currently not being used
app.get('/rw',(req,res)=>{
  res.render('researcher_waiting',{secondActiveRooms})
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
  const userRole = req.query.userRole;
  const userName = req.query.userName;

  if (secondActiveRooms.hasOwnProperty(roomId)) {
    res.render('second_phase', { roomId });
  } else if (activeRooms.hasOwnProperty(roomId)) {
    // Ensure the 'users' field exists before trying to access it.
    if (activeRooms[roomId].hasOwnProperty('users')) {
      const roomUsers = activeRooms[roomId].users; // Fetch roomUsers from activeRooms
      res.render('room', { roomId, userRole, userName, roomUsers }); // Include roomUsers
    } else {
      // Handle this case appropriately; maybe render the room without users, or redirect.
      res.render('room', { roomId, userRole, userName }); 
    }
  } else {
    res.redirect('/');
  }
});



// Retrieve all the users in a room 
app.get('/room/:roomId/users', (req, res) => {
  const roomId = req.params.roomId;
  if (activeRooms[roomId]) {
    res.json(activeRooms[roomId].users);
  } else {
    res.status(404).json({ message: 'Room not found' });
  }
});


io.on('connection', socket => {
    socket.on('join-room', (roomId, userId, userName, userRole) => {
      try {

        socket.join(roomId);

        // Get the names of the users in the room
        const userNamesInRoom = activeRooms[roomId].users.map(user => user.userName);
        let availableUserNames = possibleUserNames.filter(name => !userNamesInRoom.includes(name));
        
        // Find an available name from possibleUserNames
        let randomIndex = Math.floor(Math.random() * availableUserNames.length);
        let randomName = availableUserNames[randomIndex];

        if (!userName) {
          userName = randomName;
        }

        // this does not account for all names being taken (but that is not happening)
        if (activeRooms[roomId]) {
          activeRooms[roomId].users.push({ userId, userName, userRole });
          
          // Emit the updated user list to the newly joined user
          io.to(roomId).emit('update-room-users');
                    
          // Check for researcher and emit status
          const hasResearcher = (userRole === 'researcher');
          io.to(roomId).emit('researcher_status_update', hasResearcher);
        }
      
        socket.to(roomId).emit('user-connected', userId, userName, userRole);

        socket.on('disconnect', () => {
          socket.to(roomId).emit('user-disconnected', userId);

          //sends message that user disconnected
          io.to(roomId).emit('chat-message', { userId, message: "user disconnected" });

          // Emit a chat message to notify all users in the room
          io.to(roomId).emit('chat-message', { userId: "system", message: 'a user has left the room' });

          // Remove user from the list of users in the room
          if (activeRooms[roomId]) {
            const index = activeRooms[roomId].users.findIndex(u => u.userId === userId);
            if (index !== -1) {
              activeRooms[roomId].users.splice(index, 1);
            }
  
            io.to(roomId).emit('update-room-users');

            // Re-check for researcher and emit status
            const hasResearcher = activeRooms[roomId].users.some(user => user.userRole === 'Researcher');
            io.to(roomId).emit('researcher_status_update', hasResearcher);
          }
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

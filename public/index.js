checkGroupRoom();
// Get the video grid element
const videoGrid = document.getElementById('video-grid');

// Function to start accessing the camera and display video
async function startVideo() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    // Create a new video element for each camera track
    stream.getVideoTracks().forEach((track) => {
      const videoElement = document.createElement('video');
      videoElement.srcObject = new MediaStream([track]);
      videoElement.autoplay = true;
      videoElement.playsinline = true;
      videoGrid.appendChild(videoElement);
    });
  } catch (error) {
    console.error('Error accessing camera:', error);
  }
}

// Call the startVideo function to initiate camera access
startVideo();

//Function to join a room by pasting the room link and hit go button
function goToRoom() {
  const username = sessionStorage.getItem('username');
  const groupNumber = sessionStorage.getItem('groupNumber');
  console.log(username, groupNumber);

  // Check if the necessary data is available in session storage
  if (username && groupNumber) {
    const groupRef = database.ref(`groups/${groupNumber}`);

    // Check if the room exists for the group
    groupRef.child('room').once('value')
      .then(roomSnapshot => {
        const roomId = roomSnapshot.val();
        if (roomId) {
          window.location.href = `http://localhost:3000/${roomId}`;
        } else {
          alert('Room not found. Please create a room or check the link.');
        }
      })
      .catch(error => {
        console.error('Error checking room:', error.message);
      });
  } else {
    console.error('Username or groupNumber not found in sessionStorage');
  }
}

function createRoomAndNavigate() {
  fetch('/create', {
    method: 'GET',
  })
    .then(response => response.json())
    .then(data => {
      const roomId = data.roomId;
      const newUrl = `/${roomId}`;
      const user = firebase.auth().currentUser;

      if (user) {
        // Updates room data and sends user to the room
        setUserDataToRoom(roomId, newUrl);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('There was an error creating the room. Please try again.');
    });
}

authonUserAuthStateChanged((user) => {
  console.log("auth state has changed");
  const loginStatusElement = document.getElementById('login-status');
  const createRoomButton = document.getElementById('createRoomButton');
  const goToRoomButton = document.getElementById('goToRoomButton');
  if (user) {
    // User is signed in.
    console.log('User signed in:', user);
    loginStatusElement.textContent = `Logged in`;
    // loginStatusElement.textContent = `Logged in as ${user.displayName || userEmail}`;
    createRoomButton.disabled = false;
    goToRoomButton.disabled = false;
  } else {
    // No user is signed in.
    console.log('User is not signed in');
    loginStatusElement.textContent = 'Not logged in';
    createRoomButton.disabled = true;
    goToRoomButton.disabled = true;
  }
});

// Function to check if the user's group has a room assigned
function checkGroupRoom() {
  const userLoginsRef = firebase.database().ref(`userLogins/${sessionStorage.getItem('username')}`);
  
  userLoginsRef.once("value")
    .then(snapshot => {
      const groupNumber = snapshot.child("group").val();
      sessionStorage.setItem('groupNumber', groupNumber);

      // Check if the group has a room assigned
      const groupsRef = firebase.database().ref(`groups/${groupNumber}`);
      groupsRef.once("value")
        .then(groupSnapshot => {
          const roomExists = groupSnapshot.child("room").exists();

          // Display or hide buttons based on room existence
          if (roomExists) {
            goToRoom()
            document.getElementById("joining").style.display = "block";
          } else {
            createRoomAndNavigate()
          }
        })
        .catch(error => {
          console.error("Error checking group room:", error.message);
        });
    })
    .catch(error => {
      console.error("Error checking user group:", error.message);
    });
}
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
  const roomLinkInput = document.getElementById('room-link');
  const roomLink = roomLinkInput.value.trim();

  // Check if the input is not empty
  if (roomLink !== '') {
    window.location.href = roomLink
    } else {
    alert('Please enter a valid room link.');
  }
}

document.getElementById('createRoomForm').addEventListener('submit', function(event) {
  event.preventDefault();  // Stop the form from submitting
  
  fetch('/create', {
    method: 'GET',
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    return response.json();  // Parse the JSON response
  })
  .then(data => {
    // Use the roomId from the server to perform the redirect
    const roomId = data.roomId;
    const newUrl = `/${roomId}`;
    window.location.href = newUrl;

    // After the redirect, set the user data to the room
    const user = firebase.auth().currentUser;
    if (user) {
      setUserDataToRoom(user.uid, "active", newUrl);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('There was an error creating the room. Please try again.');
  });
});


onUserAuthStateChanged((user) => {
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
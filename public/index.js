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
    window.location.href=roomLink
    } else {
    alert('Please enter a valid room link.');
  }
}

document.getElementById('createRoomForm').addEventListener('submit', function(event) {
  event.preventDefault();  // Stop the form from submitting

  const user = firebase.auth().currentUser;
  if (user) {
    // Use the function from firebase_config.js
    setUserDataToRoom(user.uid, "active");
    // After your operation has completed, submit the form
    event.target.submit(); // This submits the form that the event was attached to
  }
});


onUserAuthStateChanged((user) => {
  console.log("this code is supposed to show 1111111111111111111111");
  const loginStatusElement = document.getElementById('login-status');
  const createRoomButton = document.getElementById('createRoomButton');
  if (user) {
    // User is signed in.
    console.log('User signed in:', user);
    loginStatusElement.textContent = `Logged in`;
    // loginStatusElement.textContent = `Logged in as ${user.displayName || userEmail}`;
    createRoomButton.disabled = false;
  } else {
    // No user is signed in.
    console.log('User is not signed in');
    // handleSignInWithGoogleClick();
    loginStatusElement.textContent = 'Not logged in';
    createRoomButton.disabled = true;
  }
});
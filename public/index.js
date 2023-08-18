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
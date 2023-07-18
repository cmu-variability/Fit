const socket = io('/')
const videoGrid = document.getElementById('video-grid')

const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})

const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
let mediaStream;

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  mediaStream=stream
  addVideoStream(myVideo, stream)

  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

const copyButton = document.getElementById('copyButton');

copyButton.addEventListener('click', () => {
    const roomId="http://localhost:3000/"+ROOM_ID;
    navigator.clipboard.writeText(roomId)
    .then(() => {
      console.log('Room UUID copied to clipboard');
      // You can provide feedback to the user that the copying was successful
    })
    .catch((error) => {
      console.error('Failed to copy room UUID:', error);
      // You can handle any errors that occur during copying
    });
});

const leaveCallButton = document.getElementById('leaveCallButton');

leaveCallButton.addEventListener('click', () => {
    window.location.href = '/';
});

const toggleMic = document.getElementById('toggle-mic');
const toggleCamera = document.getElementById('toggle-camera');

function toggleMicrophone() {
  if (mediaStream) {
    const audioTracks = mediaStream.getAudioTracks();
    audioTracks.forEach(track => {
      track.enabled = !track.enabled;
    });
  }
}

// Function to toggle the camera track
function toggleCameraStream() {
  if (mediaStream) {
    const videoTracks = mediaStream.getVideoTracks();
    videoTracks.forEach(track => {
      track.enabled = !track.enabled;
    });
  }
}

// Event listener for microphone toggle
toggleMic.addEventListener('click', () => {
  toggleMicrophone();
});

// Event listener for camera toggle
toggleCamera.addEventListener('click', () => {
  toggleCameraStream();
});




// const toggleMicButton = document.getElementById('toggle-mic');
// let isMicOn = true;

// toggleMicButton.addEventListener('click', () => {
//   if (mediaStream) {
//     const audioTrack = mediaStream.getAudioTracks()[0];
//     isMicOn = !isMicOn;

//     // Enable or disable the audio track based on the microphone state
//     audioTrack.enabled = isMicOn;

//     // Update the UI based on the microphone state
//     toggleMicButton.innerText = isMicOn ? 'Mute Microphone' : 'Unmute Microphone';
//   }
// });

// const toggleCameraButton = document.getElementById('toggle-camera');
// let isCameraOn = true;

// toggleCameraButton.addEventListener('click', () => {
//   if (mediaStream) {
//     const videoTrack = mediaStream.getVideoTracks()[0];
//     isCameraOn = !isCameraOn;

//     // Enable or disable the video track based on the camera state
//     videoTrack.enabled = isCameraOn;

//     // Update the UI based on the camera state
//     toggleCameraButton.innerText = isCameraOn ? 'Turn Off Camera' : 'Turn On Camera';
//   }
// });


let selectedAudioDeviceId;
let selectedVideoDeviceId;

// Get references to the audio and video device dropdowns
const audioDeviceDropdown = document.getElementById('audio-device-dropdown');
const videoDeviceDropdown = document.getElementById('video-device-dropdown');

// Function to populate the dropdown options
function populateDeviceOptions(deviceList, dropdown) {
  // Clear existing options
  dropdown.innerHTML = '';

  // Create a default option
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.disabled = true;
  defaultOption.selected = true;
  defaultOption.textContent = 'Choose Device';
  dropdown.appendChild(defaultOption);

  // Create an option for each device in the list
  deviceList.forEach(device => {
    const option = document.createElement('option');
    option.value = device.deviceId;
    option.textContent = device.label || `Device ${device.deviceId}`;
    dropdown.appendChild(option);
  });
}

// Function to handle the updated media stream
function handleUpdatedMediaStream(stream) {
  // Update the media stream in your WebRTC connection or media elements
  // For example, if you have a video element with id 'localVideo':
  const videoElement = document.getElementById('localVideo');
  if (videoElement) {
    // Stop the existing media stream if it is currently playing
    if (videoElement.srcObject) {
      const tracks = videoElement.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    // Assign the new media stream to the video element
    videoElement.srcObject = stream;
  }
}

// Function to update the media stream with the selected devices
function updateMediaStream() {
  const constraints = {
    audio: selectedAudioDeviceId ? { deviceId: selectedAudioDeviceId } : isMicOn,
    video: selectedVideoDeviceId ? { deviceId: selectedVideoDeviceId } : isCameraOn
  };

  navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
      // Store the new media stream for later use
      mediaStream = stream;

      // Call the function to handle the updated media stream
      handleUpdatedMediaStream(stream);
    })
    .catch(error => {
      console.error('Error accessing media devices:', error);
    });
}

// Event listener for audio device selection
audioDeviceDropdown.addEventListener('change', () => {
  selectedAudioDeviceId = audioDeviceDropdown.value;
  updateMediaStream();
});

// Event listener for video device selection
videoDeviceDropdown.addEventListener('change', () => {
  selectedVideoDeviceId = videoDeviceDropdown.value;
  updateMediaStream();
});

// Retrieve the list of available audio and video devices
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    const audioDevices = devices.filter(device => device.kind === 'audioinput');
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    // Populate the audio and video device dropdowns
    populateDeviceOptions(audioDevices, audioDeviceDropdown);
    populateDeviceOptions(videoDevices, videoDeviceDropdown);

    // Initially update the media stream with the selected devices
    updateMediaStream();
  })
  .catch(error => {
    console.error('Error enumerating devices:', error);
  });

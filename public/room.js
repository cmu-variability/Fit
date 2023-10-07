const socket = io('/')
const videoGrid = document.getElementById('video-grid')
let roomUsers = []; // This will store the list of users in the room

const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})

//for researcher they have a userName and userRole as researcher
//for normal participants, their userName and userRole are null
const urlParams = new URLSearchParams(window.location.search);
const userName = urlParams.get('userName');
const userRole = urlParams.get('userRole');

//get self video and mute it
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
let mediaStream;
//this is for recording
let recordRTC;

//if a researcher joins, their video is not added to the stream, so they answer null
if(userRole==null) {
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then(stream => {
    mediaStream=stream
    addVideoStream(myVideo, stream)
    recordRTC = RecordRTC(stream,{
      type: 'video'
    });

    recordRTC.startRecording();

    myPeer.on('call', call => {
      call.answer(stream)
      const video = document.createElement('video')
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
      })
    })

  })} else {

    navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true
    }).then(stream => {
      mediaStream=stream
      myPeer.on('call', call => {
        call.answer(null)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
          addVideoStream(video, userVideoStream)
        })
      })
    });
  }


socket.on('user-connected', async userId => {
  connectToNewUser(userId, mediaStream);
  await updateRoomUsers(); // Fetch and update room users
})

socket.on('user-disconnected', async userId => {
  if (peers[userId]) {
    peers[userId].close()
  }
  await updateRoomUsers(); // Fetch and update room users
})


myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id, userName, userRole)
})

async function updateRoomUsers() {
  const response = await fetch(`/room/${ROOM_ID}/users`);
  
  if (response.ok) {
    const users = await response.json();
    roomUsers = users;
    console.log("Updated roomUsers:", roomUsers);
  } else {
    console.error("Failed to fetch users");
  }
}

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
    console.log('video is removed');
  })

  peers[userId] = call
  console.log('peers', peers);
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

function showButtons() {
  const hiddenButtons = document.querySelector('.hidden-buttons');
  hiddenButtons.style.display = 'block';
}

function hideButtons() {
  const hiddenButtons = document.querySelector('.hidden-buttons');
  hiddenButtons.style.display = 'none';
}

//enable user to copy the meeting link to their clipboard
const copyButton = document.getElementById('copyButton');

copyButton.addEventListener('click', () => {
  const roomURL="http://localhost:3000/"+ROOM_ID;
  navigator.clipboard.writeText(roomURL)
  .then(() => {
    console.log('Room UUID copied to clipboard');
  })
  .catch((error) => {
    console.error('Failed to copy room UUID:', error);
  });
});

//when first half of the meeting end:
//participant click leave call button to go to the second phase
//researcher click leave call button to see a list of participant that are in the second phase
const leaveCallButton = document.getElementById('leaveCallButton');

leaveCallButton.addEventListener('click', () => {
    if(userRole==null){
    recordRTC.stopRecording(function() {
        let blob = recordRTC.getBlob();
        invokeSaveAsDialog(blob);
    });
    window.location.href = '/s';}
    else{
      window.location.href='/w'
    }
});


//for recording
function invokeSaveAsDialog(file) {
  var fileUrl = URL.createObjectURL(file);
  var a = document.createElement('a');
  a.href = fileUrl;
  a.download = 'meeting_record.webm';
  a.click();

  // Release the object URL to free up resources
  URL.revokeObjectURL(fileUrl);
}

//mute mic and camera
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


//for adjusting media devices
let selectedAudioDeviceId;
let selectedVideoDeviceId;

// Get references to the audio and video device dropdowns
const audioDeviceDropdown = document.getElementById('audio-device-dropdown');
const videoDeviceDropdown = document.getElementById('video-device-dropdown');

// Function to populate the dropdown options
function populateDeviceOptions(deviceList, dropdown) {
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
    audio: selectedAudioDeviceId ,
    video: selectedVideoDeviceId
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

// Function to send chat messages
async function sendMessage() {
  const message = document.getElementById('message').value;
  console.log("even if this is researcher: ", message);
  //does nothing if message is empty
  if (message === "") {
    return;
  }

  socket.emit('chat-message', message);
  console.log("roomUsers: ", roomUsers);
  console.log("message in sendMessage, ", message);
  document.getElementById('message').value = '';
}

// Function to append chat messages to the chat box
function appendMessage(userName, message) {
  const chatBox = document.getElementById('chat-box');
  const messageElement = document.createElement('div');
  console.log("message: ", message);
  messageElement.innerText = `${userName}: ${message}`;
  chatBox.appendChild(messageElement);
}


socket.on('update-room-users', () => {
  updateRoomUsers();
});

// Listen for chat messages from the server
socket.on('chat-message', data => {
  const { userId, message } = data;
  console.log("userName: ", userId);
  const user = roomUsers.find(u => u.userId === userId);
  if (user) {
    appendMessage(user.userName, message);
  } else {
    appendMessage(user, message);
  }
});

// Event listener for the send button
//can change this to only userRole = null if necessary
if (true) {
  document.getElementById('send-button').addEventListener('click', sendMessage);
}

// Listen to the 'researcher_status_update' event
socket.on('researcher_status_update', (hasResearcher) => {
  // Get the div where the researcher notice should appear
  const researcherNotice = document.getElementById("researcherNotice");

  if (hasResearcher) {
    researcherNotice.style.display = 'block';
    researcherNotice.innerHTML = "A researcher is present in this room.";
  } else {
    researcherNotice.style.display = 'none';
  }
});

// Links to Firebase Config Code
const markCriticalButton = document.getElementById('mainCriticalMomentButton');
const notesPopup = document.getElementById('notesPopup');
const notesInput = document.getElementById('notesInput');
const continueButton = document.getElementById('continueButton');
const table = document.querySelector('.data-table');

markCriticalButton.addEventListener('click', () => {
  const sessionID = ROOM_ID;
  const userRoleLower = userRole?.toLowerCase() || '';

  if (userRoleLower === "researcher") {
    notesPopup.style.display = 'block';
    continueButton.addEventListener('click', () => {
      const notes = notesInput.value;
      pushDataToFirebase(table, sessionID, userRole, userName, notes);
      notesPopup.style.display = 'none';
    });
  } else {
    pushDataToFirebase(table, sessionID, 'Participant', userName);
  }
});
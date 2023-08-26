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
if(userRole==null){
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

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })

  socket.on('user-disconnected', userId => {
    if (peers[userId]) {
      peers[userId].close()
    }
  })

})
}else{
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

    socket.on('user-connected', userId => {
      connectToNewUser(userId, stream)
    })

    socket.on('user-disconnected', userId => {
      if (peers[userId]) peers[userId].close()
    })
  })
}


myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id, userName, userRole)
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

function showButtons() {
  const hiddenButtons = document.querySelector('.hidden-buttons');
  hiddenButtons.style.display = 'block';
}

function hideButtons() {
  const hiddenButtons = document.querySelector('.hidden-buttons');
  hiddenButtons.style.display = 'none';
}

// Function to send chat messages
async function sendMessage() {
  const message = document.getElementById('message').value;

  const response = await fetch(`/room/${ROOM_ID}/users`);
  
  if (response.ok) {
    const users = await response.json();
    roomUsers = users;    
    console.log("local roomUsers:", roomUsers, "server users: ", users);
  } else {
    console.error("Failed to fetch users");
  }

  socket.emit('chat-message', message);
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

// Listen for chat messages from the server
socket.on('chat-message', data => {
  const { userId, message } = data;
  const user = roomUsers.find(u => u.userId === userId);
  appendMessage(user.userName, message);
  // appendMessage(userId, message);
});

// Event listener for the send button
if (userRole == null) {
  document.getElementById('send-button').addEventListener('click', sendMessage);
}

/* Firebase code begins here; all previous code is untouched */ 

// Firebase setup
const firebaseConfig = {
  apiKey: "AIzaSyD9blp9GQZ50XqLM8VCnH7pjxt68JT7FBQ",
  authDomain: "fit-project-88b55.firebaseapp.com",
  databaseURL: "https://fit-project-88b55-default-rtdb.firebaseio.com",
  projectId: "fit-project-88b55",
  storageBucket: "fit-project-88b55.appspot.com",
  messagingSenderId: "569706388901",
  appId: "1:569706388901:web:1e47d6bdd5c395c5bd9c4c"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Find the "Mark Critical Moment" button element and Notes buttons
const markCriticalButton = document.querySelector('.main-button');
const notesPopup = document.getElementById('notesPopup');
const notesInput = document.getElementById('notesInput');
const continueButton = document.getElementById('continueButton');

// Initialize the data object
let dataToStore;

// Add click event listener to the button
markCriticalButton.addEventListener('click', () => {
  // Extract shared data
  const sessionID = ROOM_ID;
  const timestamp = new Date().getTime();
  const formattedTimestamp = new Date(timestamp).toLocaleString();

  if (userRole === "Researcher") {
    // Show the notes popup
    notesPopup.style.display = 'block';

    // Add event listener for the Continue button when notes are submitted
    continueButton.addEventListener('click', () => {
      const notes = notesInput.value;

      // Create an object with the data to be stored (with notes)
      dataToStore = {
        username: userName,
        role: userRole,
        sessionid: sessionID,
        timestamp: formattedTimestamp,
        notes: notes
      };

      // Hide the popup after storing the data
      notesPopup.style.display = 'none';
        
      // Reference to the location where data is stored (can change this if data should be separated)
      const criticalMomentsRef = database.ref('criticalMoments');

      // Push the data to the Firebase database 
      // Needs to occur separately from else statement due to asynchronous execution
      criticalMomentsRef.push(dataToStore)
        .then(() => {
          console.log('Data stored in Firebase!');
        })
        .catch(error => {
          console.error('Error storing data:', error);
        });
    });
  } 
  else {
    // Create an object with the data to be stored (without notes)
    dataToStore = {
      username: userName,
      role: userRole,
      sessionid: sessionID,
      timestamp: formattedTimestamp
    };

    const criticalMomentsRef = database.ref('criticalMoments');

    criticalMomentsRef.push(dataToStore)
      .then(() => {
        console.log('Data stored in Firebase!');
      })
      .catch(error => {
        console.error('Error storing data:', error);
      });
  }

});





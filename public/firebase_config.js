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

// Initialize the data object
let dataToStore;

// Define the updateTableWithNewData function
function updateTableWithNewData(table, newData, userName) {
  // Create a new table row
  const newRow = table.insertRow();

  // Create cells for the table row
  const timeCell = newRow.insertCell(0);
  const userRoleCell = newRow.insertCell(1);
  const userNameCell = newRow.insertCell(2);
  const commentCell = newRow.insertCell(3);

  // Populate the cells with the new data
  timeCell.textContent = newData.timestamp;
  userRoleCell.textContent = newData.role;
  userNameCell.textContent = userName + ' (' + newData.username + ')';
  commentCell.textContent = newData.notes;   
}

function pushDataToFirebase(table, sessionID, userRole, userName, notes = null) {
  const timestamp = new Date().getTime();
  const formattedTimestamp = new Date(timestamp).toLocaleString();

  // Create an object with the data to be stored
  const dataToStore = {
    username: user.uid,
    role: userRole,
    sessionid: sessionID,
    timestamp: formattedTimestamp,
    notes: notes
  };

  // Reference to the location where data is stored (can change this if data should be separated)
  const criticalMomentsRef = database.ref('criticalMoments').child(sessionID).child(user.uid);

  // Keep track of keys that have been added to the table
  const addedKeys = new Set();

  // Listen for changes to the specified session's data
  criticalMomentsRef.on('child_added', snapshot => {
    const newData = snapshot.val();
    const key = snapshot.key;

    // Check if the key is already in the table
    if (!addedKeys.has(key)) {
      // Add the key to the set to track that it has been added
      addedKeys.add(key);
      if (table != null) {
        updateTableWithNewData(table, newData, userName);
      }
    }
  });


  // Check if the reference exists
  criticalMomentsRef.once('value', snapshot => {
    if (!snapshot.exists()) {
      // The reference doesn't exist, so you can create it and set initial data as empty
      criticalMomentsRef.set({});
    }
  });

  // Push the data to the Firebase database 
  // Needs to occur separately from else statement due to asynchronous execution
  criticalMomentsRef.push(dataToStore)
    .then(() => {
      console.log('Data stored in Firebase!');
    })
    .catch(error => {
      console.error('Error storing data:', error);
    });
}

// Use the global firebase object for authentication
const auth = firebase.auth();
auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
let user = null;

const userInfoRef = database.ref('userInfo');

auth.onAuthStateChanged((currentUser) => {
  if (currentUser) {
    user = currentUser;
    console.log("onAuthStateChanged: User logged in:", user);

    userInfoRef.child(user.uid).once('value').then((snapshot) => {
      const userInfo = snapshot.val();
      const url = userInfo && userInfo.url;

      console.log("window.location.href", window.location.href);
      console.log("url", url);
      // this automatically moves a user to the room they are supposed to be in
      // if they are on another screen

      // if (url && window.location.href !== ("http://localhost:3000" + url)) {
      //   window.location.href = "http://localhost:3000" + url;
      // }
    }).catch((error) => {
      console.error('Error fetching user info:', error);
    });
  } else {
    redirectToIndexPage();
    console.log("no, User is logged out");
  }
});

function redirectToIndexPage() {
  console.log('Redirecting to sign-in page');
  if (window.location.href !== ("localhost:3000") && window.location.href !== ("http://localhost:3000") && window.location.href !== ("http://localhost:3000/")) {
    console.log("it went inside", window.location.href);
    window.location.href = "http://localhost:3000";
  } else {
    console.log("it did not go inside")
  }
}

function setUserDataToRoom(roomId, newUrl) {
  const username = sessionStorage.getItem('username');
  const groupNumber = sessionStorage.getItem('groupNumber');

  if (username && groupNumber) {
    const groupRef = database.ref(`groups/${groupNumber}`);
    // Check if the room already exists for the group
    groupRef.child('room').once('value')
      .then(roomSnapshot => {
        const existingRoom = roomSnapshot.val();
        if (!existingRoom) {
          // Update the room information for the group only if it doesn't exist
          groupRef.update({ room: roomId });
        }
        // Redirect to the new room now that data is updated
        window.location.href = newUrl;
      })
      .catch(error => {
        console.error('Error checking existing room:', error.message);
      });
  } else {
    console.error('userId or groupNumber not found in sessionStorage');
  }
}

function setUserDataToSecondRoom() {
    console.log("user went to second room", user);
    userInfoRef.child(user.uid).set({
      status: "second room"
  }).catch((error) => {
      console.error('Error updating user status:', error);
  });
}

function setUserDataToNoRoom() {
  console.log("user went to no room", user);
  userInfoRef.child(user.uid).set({
    status: "no room"
}).catch((error) => {
    console.error('Error updating user status:', error);
});
}

function connectToFirebase(email, password) {
  // Check if the user is already authenticated
  if (auth.currentUser) {
    console.log('User is already signed in.');
    // Perform any additional actions needed for an authenticated user
    // Redirect or show content, for example
  } else {
    // If not authenticated, sign in with Google
    auth.signInWithEmailAndPassword(email, password).then(() => {
      console.log('User signed in successfully');
      // Perform any additional actions needed for a newly signed-in user
      // Redirect or show content, for example
    }).catch((error) => {
      console.error('Error signing in.', error);
      alert('Error connecting to Firebase. Please try again.');
    });
  }
}

// Function to handle Google Sign-In button click
function handleSignInWithGoogleClick() {
  signInWithGoogle().then(() => {
    // User is signed in successfully, you can perform additional actions if needed
    checkCurrentUserURL();
    console.log('User signed in with Google successfully');
  }).catch((error) => {
    console.error('Error signing in with Google:', error);
    alert('Error signing in with Google. Please try again.');
  });
}

function storeRecordedVideoInFirebase(blob) {
  return new Promise((resolve, reject) => {
    const storageRef = firebase.storage().ref();
    
    // Generate a unique name for the video
    const videoFileName = `videos/${ROOM_ID}/meeting_record.webm`;
    const videoRef = storageRef.child(videoFileName);

    // Upload the video blob to Firebase Storage
    videoRef.put(blob).then((snapshot) => {
      console.log('Video uploaded successfully!');
      
      // Get the download URL for the uploaded video
      videoRef.getDownloadURL().then((downloadURL) => {
        console.log('Download URL:', downloadURL);
        resolve();
      }).catch((error) => {
        console.error('Error getting download URL:', error);
        reject(error);
      });
    }).catch((error) => {
      console.error('Error uploading video:', error);
      reject(error);
    });
  });

// Function to authenticate user
function checkValidCredentials(username, password) {
  const usersLoginsRef = firebase.database().ref("userLogins");

  // Check if the username exists in the database
  usersLoginsRef.child(username).once("value")
    .then(snapshot => {
      const user = snapshot.val();

      if (user && user.password === password) {
        // Authentication successful
        console.log("Valid credentials");
        sessionStorage.setItem('username', username);
        window.location.href = '/index';
      } else {
        // Authentication failed
        console.log("Invalid username or password");
      }
    })
    .catch(error => {
      console.error("Error during authentication:", error.message);
    });
}
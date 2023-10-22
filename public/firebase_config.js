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
function updateTableWithNewData(table, newData) {
  // Create a new table row
  const newRow = table.insertRow();

  // Create cells for the table row
  const timeCell = newRow.insertCell(0);
  const researcherCell = newRow.insertCell(1);
  const commentCell = newRow.insertCell(2);

  // Populate the cells with the new data
  timeCell.textContent = newData.timestamp;
  researcherCell.textContent = newData.username;
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
  const criticalMomentsRef = database.ref('criticalMoments').child(sessionID);

  // Listen for changes to the specified session's data
  criticalMomentsRef.on('child_added', snapshot => {
    const newData = snapshot.val();
    const userRoleLower = userRole?.toLowerCase() || '';
    if (userRoleLower === "researcher") {
      updateTableWithNewData(table, newData);
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
    console.log("no, User is logged out");
  }
});


function setUserDataToRoom(uid, status, url) {
  userInfoRef.child(uid).set({ status: status, url: url})
    .then(() => {
      console.log('User status set to', status);
    })
    .catch(error => {
      console.error('Error updating user status:', error);
    });
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


// Function to sign in with Google
function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  // Add custom parameters to the Google provider
  provider.setCustomParameters({
    hd: 'andrew.cmu.edu', // Specify the allowed email domain
  });

  return auth.signInWithPopup(provider);
}

// Function to sign out
function signOut() {
  console.log("user has signed out");
  return firebase.auth().signOut();
}

// for callbacks in room specific js files
function onUserAuthStateChanged(callback) {
  auth.onAuthStateChanged(callback);
}

// reads current URL of user and moves to them
function checkCurrentUserURL() {

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
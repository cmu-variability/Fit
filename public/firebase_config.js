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
const user = firebase.auth().currentUser;

const userInfoRef = database.ref('userInfo');

function setUserDataToRoom(uid, status) {
  userInfoRef.child(uid).set({ status: status })
    .then(() => {
      console.log('User status set to', status);
    })
    .catch(error => {
      console.error('Error updating user status:', error);
    });
}

function setUserDataToSecondRoom() {
    console.log("hell yeah", user);
    // If the user is logged in, set their status as "active"
    userInfoRef.child(user.uid).set({
      status: "secondRoom"
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

// Listen for changes in the user's authentication state
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in.
    console.log('User signed in:', user);
  } else {
    // No user is signed in.
    console.log('User is not signed in');
    // handleSignInWithGoogleClick();
  }
});

// for callbacks in room specific js files
function onUserAuthStateChanged(callback) {
  auth.onAuthStateChanged(callback);
}

// Function to handle Google Sign-In button click
function handleSignInWithGoogleClick() {
  signInWithGoogle().then(() => {
    // User is signed in successfully, you can perform additional actions if needed
    console.log('User signed in with Google successfully');
  }).catch((error) => {
    console.error('Error signing in with Google:', error);
    alert('Error signing in with Google. Please try again.');
  });
}

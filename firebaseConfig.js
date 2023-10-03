
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

    // Reference to the location where data is stored (can change this if data should be separated)
    const criticalMomentsRef = database.ref('criticalMoments');

  
  // Find the "Mark Critical Moment" button element and Notes buttons
  const markCriticalButton = document.getElementById('mainCriticalMomentButton');
  const markCriticalOptionButton = document.getElementById('criticalMomentOptionButton');
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
      });
    } 
    else {
      // Create an object with the data to be stored (without notes)
      dataToStore = {
        username: userName,
        role: userRole,
        timestamp: formattedTimestamp
      };
  
      // Use sessionID to create a reference within criticalMoments
      const sessionRef = database.ref(`criticalMoments/${sessionID}`);
  
      // Push the data to the session-specific reference in Firebase
      sessionRef.push(dataToStore)
        .then(() => {
          console.log('Data stored in Firebase!!');
        })
        .catch(error => {
          console.error('Error storing data:', error);
        });
    }
  
  });
  
  
  //when first half of the meeting end:
  //participant click leave call button to go to the second phase
  //researcher click leave call button to see a list of participant that are in the second phase
  const leaveCallButton = document.getElementById('leaveCallButton');
  
  leaveCallButton.addEventListener('click', () => {
    
    // Stop recording if userRole is null
    if (userRole == null) {
      recordRTC.stopRecording(function() {
        let blob = recordRTC.getBlob();
        invokeSaveAsDialog(blob);
  
        // Cleanup and then redirect
        cleanupAndRedirect(`/${ROOM_ID}/waitingRoom`);
      });
    } else {
      cleanupAndRedirect('/w');
    }
  
  });


  function renderCriticalMoments() {
      console.log("Rendering critical moments..."); 
      const list = document.getElementById('critical-moments-list');
      
      // Just for testing: Clear the list and append a test message
      list.innerHTML = 'Loading moments...'; 
  
      criticalMomentsRef.on('value', (snapshot) => {
          const moments = snapshot.val();
  
          if (moments) {
              list.innerHTML = ''; // Clear the test message
              for (const session in moments) {
                  for (const key in moments[session]) {
                      const moment = moments[session][key];
                      const listItem = document.createElement('li');
                      listItem.textContent = `${moment.username} (${moment.role}) at ${moment.timestamp}`;
                      list.appendChild(listItem);
                  }
              }
          } else {
              list.innerHTML = 'No moments found';
          }
      });
  }
  
  document.addEventListener('DOMContentLoaded', (event) => {
      console.log('DOM loaded!'); // Logging to console to verify if this event is triggered
      renderCriticalMoments();
  });
  

// Call the function to render the moments
renderCriticalMoments();

//function for researcher to join a room by selecting the room they want to join
//researchers are also required to input their name and role as researcher (-> to create different view in the meeting room)
function joinRoom(roomId) {
    const userName = prompt('Please enter your name:');
      if (!userName || userName.trim() === '') {
        alert('You must enter a valid name.');
        return;
      }

      let userRole = prompt('Enter r if you are a researcher or p if you are a participant:');

      // checks for valid input
      if (userRole.trim().toLowerCase() === 'r') {
        userRole = 'researcher';
      } else if (userRole.trim().toLowerCase() === 'p'){
        userRole = 'participant';
      } else {
        alert('You must enter a valid role (Researcher or Participant).');
        return;
      }

      // if (!userRole || (userRole.trim().toLowerCase() !== 'researcher' && userRole.trim().toLowerCase() !== 'participant')) {
      //   alert('You must enter a valid role (Researcher or Participant).');
      //   return;
      // }

      // Navigate to the room link
      window.location.href = `http://localhost:3000/${roomId}?userName=${encodeURIComponent(userName)}&userRole=${encodeURIComponent(userRole)}`;;
}
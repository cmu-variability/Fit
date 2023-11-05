//function for researcher to join a room by selecting the room they want to join
//researchers are also required to input their name and role as researcher (-> to create different view in the meeting room)
function joinRoom(roomId) {
    const userName = prompt('Please enter your name:');
      if (!userName || userName.trim() === '') {
        alert('You must enter a valid name.');
        return;
      }

      // Navigate to the room link
      window.location.href = `http://localhost:3000/${roomId}?userName=${encodeURIComponent(userName)}&userRole=${encodeURIComponent(userRole)}`;;
}
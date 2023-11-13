function submitLoginForm() {
    // Get the entered username and password
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Call the authentication function
    checkValidCredentials(username, password);
}
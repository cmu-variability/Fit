# Fit
# Prototype README

## Overview
This repository contains a prototype application built with Express, Socket.IO, EJS, and UUID. The application enables real-time communication using WebSockets and allows users to connect to a video call room.

## Prerequisites
Before running the prototype, ensure you have the following installed:
- Node.js: https://nodejs.org (version 12 or later)
- npm (Node Package Manager): Included with Node.js installation
- PeerJS: Install globally using npm

## Dependencies
- Express: Fast, unopinionated, minimalist web framework for Node.js
- Socket.IO: Real-time bidirectional event-based communication library
- http: Node.js built-in HTTP module
- ejs: Embedded JavaScript templates
- uuid: Generate RFC-compliant UUIDs

## Dev Dependencies
- nodemon: Utility that automatically restarts the server on file changes during development

To install the required dependencies for the prototype, run the following command:
```command
npm i express socket.io http ejs uuid
npm i --save-dev nodemon
npm i -g peer
peerjs --port 3001
```

## Running the Prototype
To run the prototype, follow these steps:

1. Start the PeerJS server:
   
2. Open a new terminal or command prompt window and navigate to the project directory.

3. Start the application server by running the following command:

4. Open your web browser and access the application at `http://localhost:3000`.

5. Follow the instructions on the web page to create or join a video call room.

## Development
If you want to make changes to the prototype, you can use nodemon to automatically restart the server whenever changes are made. Run the following command to start the development server:




# Fit
# Prototype README

## Overview
This repository contains a prototype application built with Express, Socket.IO, EJS, and UUID. The application enables real-time communication using WebSockets and allows users to connect to a video call room.

## Prerequisites
Before running the prototype, ensure you have the following installed:
- Node.js: https://nodejs.org (version 12 or later)
- npm (Node Package Manager): Included with Node.js installation

## Dependencies
- Express: Fast, unopinionated, minimalist web framework for Node.js
```command
npm i express
```
- Socket.IO: Real-time bidirectional event-based communication library
```command
npm i socket.io
```
- http: Node.js built-in HTTP module
```command
npm i http
```
- ejs: Embedded JavaScript templates
```command
npm i ejs
```
- uuid: Generate RFC-compliant UUIDs
```command
npm i uuid
```
- PeerJS: Install globally using npm
```command
npm i -g peer
peerjs --port 3001
```
- start the nodemon
```command
npx nodemon
```

## Running the Prototype
To run the prototype, follow these steps:

1. Open your web browser and access the user main page at `http://localhost:3000`.

2. Follow the instructions on the web page to create or join a video call room.
3. Open your web browser and access the researcher main page at `http://localhost:3000/r`.

## Development
If you want to make changes to the prototype, you can use nodemon to automatically restart the server whenever changes are made. Run the following command to start the development server:




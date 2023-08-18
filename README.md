# Fit(Fostering Inclusivity through Technology)-Facilitating conversations with neurodivergent people in workplace

## FIT Project Overview
There are nearly two million college-educated autistic people in the US who face challenges in employment due to difficulties in communication at work. This is because autistic people experience information differently, reducing their common ground with neurotypical colleagues. As knowledge economies become more diverse, there is an increasing need for communication platforms that bridge the gap in common ground. To address this need, we design Fostering Inclusivity through Technology (FIT), a video-calling platform for communication between neurodivergent (including people with Autism, ADHD, Dyslexia, etc.) and neurotypical people. FIT aims to create a platform for communication that incorporates information about verbal and non-verbal signals of participants, conversational dynamics, and workplace objectives to represent the evolving goals of interactions during communication. The technology would provide flexible methods for achieving common ground, promoting employment participation for autistic people, and increasing innovation in workplaces.

## Prototype Overview
This repository contains a prototype application aimed to be used in future experiments. The prototype is a functional web-based system constructed with WebRTC, which will lay a foundation for future technology (AI, UI) integration and be used in experiments with neurodivergent participants. 

Moreover, to help future experiments investigating communication between neurotypical and neurodivergent people, the prototype includes a UI that enables study participants to manually indicate to researchers the status of their understanding of common ground. For example, participants can use an “I don't understand” button to notify researchers when they are confused about the current conversation topic. This will help us understand the true perspective of autistic participants during real-time conversations. We will also provide additional UIs for manual annotation (labeling) for researchers to record significant moments in the video call for analysis. 

The experiment is divided into two phases: the first phase for neurodivergent and neurotypical people to communicate and finish a set of tasks, and the second phase for researchers and participants to reflect on the recording of the first phase based on markings of critical moments.


## Getting Started
Before running the prototype, ensure you have the following installed:
- Node.js: https://nodejs.org (version 12 or later)
- npm (Node Package Manager): Included with Node.js installation

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
- PeerJS: simplifies WebRTC implementation for building peer-to-peer applications in web browsers
```command
npm i -g peer
```
-RecordRTC: WebRTC JavaScript Library for Audio+Video+Screen+Canvas (2D+3D animation) Recording
```command
npm i recordrtc
```

## Running the Prototype
To run the prototype, follow these steps:

1. Start the peerjs on another port
```command
peerjs --port 3001
```
2. Start the nodemon (which will also start the server)
```command
npx nodemon
```
3. Open your web browser and access the user main page at `http://localhost:3000`.
4. Follow the instructions on the web page to create or join a video call room.
5. Open your web browser and access the researcher's main page at `http://localhost:3000/r`.

## Contact
Ayla Wang - zimengw@andrew.cmu.edu




## todo
- explain concepts of firestore
- tour of common functions

## Install vite

```
npm create vite@latest fire-white-board -- --template vanilla
```

## Move to project directory

```
cd fire-white-board
npm install
```

## Test the vite project
```
npm run dev
```

## Install Firebase SDK

```
npm install firebase@11.3.0 --save
```

## Edit index.html

Change the index.html to the following.

```
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fire white board</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script>
  <script type="module" src="src/main.js"></script>
</head>
<body>
  <button onclick="clearBoard()">Clear Board</button>
</body>
</html>
```

Notice that we're importing the drawing library called p5.js.  We also import our main module from main.js. p5.js is a JavaScript library that makes coding accessible and inclusive for artists, designers, educators, and beginners. It extends the core principles of Processing, a visual programming language, to JavaScript, enabling users to create interactive graphics and animations easily. With p5.js, you can seamlessly integrate creative coding into web pages, enhancing both user experience and engagement.

## Create Firebase store database
 - Review instructions to [Create Firebase store database](https://firebase.google.com/docs/firestore/quickstart)

## Obtain your Firebase config

- Navigate to console.firebase.com.
- Open Project XXX.
- Click "gear" icon in the upper left.
- Select Project settings
- In the general tab, you'll find your configuration JSON structure.  Make sure to scroll to the bottom
- Copy the config object snippet, then add it to your app's HTML.

The config should look like the following:

``` json
{
        apiKey: "AIzaSy...",
        authDomain: "yourproject.firebaseapp.com",
        databaseURL: "https://yourproject-default-rtdb.firebaseio.com",
        projectId: "yourproject",
        storageBucket: "yourproject.firebasestorage.app",
        messagingSenderId: "42",
        appId: "appId"
}
```

## Replace the contents of src/main.js with the following:

``` js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, addDoc, onSnapshot, getDocs, writeBatch, doc } from "firebase/firestore";

const firebaseConfig = {
    // put your firebase configuration here
}

const collectionName = 'whiteBoardCommands';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// The following function stores        
async function storeWhiteBoardCommand(command) {
    try {
        const addDocResponse = await addDoc(collection(db, collectionName), {
            command: command
        });
    }
    catch (e) {
        alert('error writing data');
        console.error("Error adding document: ", e);
    }
}

async function storeWhiteBoardSegment(x, y, px, py) {
    const command = {
        type: 'line',
        x: x,
        y: y,
        px: px,
        py: py
    };
    await storeWhiteBoardCommand(command);
}

async function storeWhiteBoardClear() {
    const command = {
        type: 'clear'
    };
    await storeWhiteBoardCommand(command);
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(255);
}

async function draw() {
    if (mouseIsPressed) {
        stroke(0);
        strokeWeight(4);
        drawLine(mouseX, mouseY, pmouseX, pmouseY);
        await storeWhiteBoardSegment(mouseX, mouseY, pmouseX, pmouseY);
    }
}

function drawLine(mouseX, mouseY, pmouseX, pmouseY) {
    stroke(0);
    strokeWeight(4);
    line(mouseX, mouseY, pmouseX, pmouseY);
}

async function clearBoard() {
    background(255);
    await clearCollection(collectionName);
    await storeWhiteBoardClear();
}

async function clearCollection(collectionName) {
    const collectionRef = collection(db, collectionName);

    try {
        const querySnapshot = await getDocs(collectionRef);
        const batch = writeBatch(db);

        querySnapshot.forEach((docSnapshot) => {
            batch.delete(doc(collectionRef, docSnapshot.id));
        });

        await batch.commit();
        console.log(`Collection ${collectionName} cleared successfully.`);
    } catch (error) {
        console.error(`Error clearing collection ${collectionName}: `, error);
    }
}

// Set up the real-time listener
const collectionRef = collection(db, collectionName);
const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
    // This callback function will be executed every time the data in the collection changes

    snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
            //console.log("New document added: ", change.doc.data());
            // Handle the new document

            const command = change.doc.data().command;
            if (command.type === 'line') {
                drawLine(command.x, command.y, command.px, command.py);
            }else if(command.type === 'clear'){
                background(255);
            }
        }
        if (change.type === "modified") {
            console.log("Modified document: ", change.doc.data());
            // Handle the modified document
        }
        if (change.type === "removed") {
            //console.log("Removed document: ", change.doc.data());
            // Handle the removed document
        }
    });
});

window.setup = setup;
window.draw = draw;
window.clearBoard = clearBoard;

```

#### Setup and Initialization

1. **Importing Firebase Modules**

```javascript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, addDoc, onSnapshot, getDocs, writeBatch, doc } from "firebase/firestore";
import { getFirebaseConfig } from './firebaseConfig.js';
```

We start by importing the necessary Firebase modules. The `getFirebaseConfig` function is imported from a local file to get our Firebase configuration details.

2. **Firebase Configuration and Initialization**

```javascript
const firebaseConfig = getFirebaseConfig();
const collectionName = 'whiteBoardCommands';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
```

We fetch our Firebase configuration and initialize Firebase. We also initialize Cloud Firestore and obtain a reference to the Firestore service.

#### Storing Commands

We define functions to store different types of whiteboard commands:

1. **Store a Command**

```javascript
async function storeWhiteBoardCommand(command) {
    try {
        const addDocResponse = await addDoc(collection(db, collectionName), {
            command: command
        });
    }
    catch (e) {
        alert('error writing data');
        console.error("Error adding document: ", e);
    }
}
```

This function adds a command to the Firestore collection. It handles errors gracefully and logs any issues.

2. **Store Line Segment and Clear Commands**

```javascript
async function storeWhiteBoardSegment(x, y, px, py) {
    const command = {
        type: 'line',
        x: x,
        y: y,
        px: px,
        py: py
    };
    await storeWhiteBoardCommand(command);
}

async function storeWhiteBoardClear() {
    const command = {
        type: 'clear'
    };
    await storeWhiteBoardCommand(command);
}
```

These functions create specific types of commands (`line` and `clear`) and store them using the `storeWhiteBoardCommand` function.

#### Drawing and Clearing the Whiteboard

1. **Setup Canvas**

```javascript
function setup() {
    createCanvas(windowWidth, windowHeight);
    background(255);
}
```

The `setup` function initializes the canvas and sets the background color to white.

2. **Drawing on the Canvas**

```javascript
async function draw() {
    if (mouseIsPressed) {
        stroke(0);
        strokeWeight(4);
        drawLine(mouseX, mouseY, pmouseX, pmouseY);
        await storeWhiteBoardSegment(mouseX, mouseY, pmouseX, pmouseY);
    }
}
```

The `draw` function checks if the mouse is pressed, draws a line on the canvas, and stores the line segment command.

3. **Drawing Lines**

```javascript
function drawLine(mouseX, mouseY, pmouseX, pmouseY) {
    stroke(0);
    strokeWeight(4);
    line(mouseX, mouseY, pmouseX, pmouseY);
}
```

The `drawLine` function draws a line on the canvas based on the provided coordinates.

4. **Clearing the Whiteboard**

```javascript
async function clearBoard() {
    background(255);
    await clearCollection(collectionName);
    await storeWhiteBoardClear();
}
```

The `clearBoard` function clears the canvas, removes all documents from the Firestore collection, and stores a clear command.

#### Clearing the Firestore Collection

```javascript
async function clearCollection(collectionName) {
    const collectionRef = collection(db, collectionName);

    try {
        const querySnapshot = await getDocs(collectionRef);
        const batch = writeBatch(db);

        querySnapshot.forEach((docSnapshot) => {
            batch.delete(doc(collectionRef, docSnapshot.id));
        });

        await batch.commit();
        console.log(`Collection ${collectionName} cleared successfully.`);
    } catch (error) {
        console.error(`Error clearing collection ${collectionName}: `, error);
    }
}
```

The `clearCollection` function deletes all documents from the specified collection using a Firestore batch.

#### Real-Time Listener

```javascript
const collectionRef = collection(db, collectionName);
const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
            const command = change.doc.data().command;
            if (command.type === 'line') {
                drawLine(command.x, command.y, command.px, command.py);
            } else if (command.type === 'clear') {
                background(255);
            }
        }
        if (change.type === "modified") {
            console.log("Modified document: ", change.doc.data());
        }
        if (change.type === "removed") {
            console.log("Removed document: ", change.doc.data());
        }
    });
});
```

We set up a real-time listener on the Firestore collection to react to any changes in real-time, updating the canvas accordingly.



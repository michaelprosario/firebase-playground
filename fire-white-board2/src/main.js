import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, addDoc, onSnapshot, getDocs, writeBatch, doc } from "firebase/firestore";
import { getFirebaseConfig } from './firebaseConfig.js';

const firebaseConfig = getFirebaseConfig();
const collectionName = 'whiteBoardCommands';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

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

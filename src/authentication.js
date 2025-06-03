import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getDoc, doc } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js';
import { auth, db } from "./firebase.js";

// async function signIn(email, password){
//     signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
//         const user = userCredential.user;
//         console.log("Logged in successfully:", user);
//         window.location.href = "home.html";
//     })
//     .catch((error) => {
//         console.log("Error logging in: ", error);
//         alert("Login failed");
//     })
// }

async function signIn(email, password){
    try{
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const docRef = doc(db, "Admin", user.uid);
        const docSnap = await getDoc(docRef);

        if(docSnap.exists()){
            window.location.href = "home.html";
        }else{
            alert("Login failed. You are not an admin.");
        }
    }catch(err){
        console.log("Error logging in: ", err);
        alert("Login failed");
    }
}

document.getElementById("login-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signIn(email, password);
})
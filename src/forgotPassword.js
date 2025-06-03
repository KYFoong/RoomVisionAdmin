import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { auth } from "./firebase.js";

async function resetPassword(email) {
    try{
        await sendPasswordResetEmail(auth, email.value);
        alert("Password reset email sent. Please check your inbox.");
        email.value = "";
        window.location.href = "index.html";
    }catch(err){
        alert("Unable reset password. Check your email or internet connection.");
        console.error(err);
    }
}

document.getElementById("forgotPasswordForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.getElementById("email");

    resetPassword(email);
})
import { auth } from "./firebase.js"
import { signOut } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js'

export function logOut(){
    const result = confirm("Are you sure you want to log out?");

    if(result){
        signOut(auth).then(() => {
            alert("You have log out successfully.");
            localStorage.setItem('sidebarCollapsed', false);
            window.location.href = "index.html";
        }).catch((error) => {
            console.log("Error signing out: ", error);
        });
    }
    
}

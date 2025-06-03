import { db } from "./firebase.js"
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js';

async function getCount() {
    const categoryRef = collection(db, "Category");
    const categoryQuery = await getDocs(categoryRef);
    const categorySize = categoryQuery.size;

    const categoryCard = document.querySelector("#category h3");
    categoryCard.innerHTML = categorySize;

    const furnitureRef = collection(db, "Furniture");
    const furnitureQuery = await getDocs(furnitureRef);
    const furnitureSize = furnitureQuery.size;
    const furnitureCard = document.querySelector("#furniture h3");
    furnitureCard.innerHTML = furnitureSize;

    const inspirationRef = collection(db, "Inspiration");
    const inspirationQuery = await getDocs(inspirationRef);
    const inspirationSize = inspirationQuery.size;
    const inspirationCard = document.querySelector("#inspiration h3");
    inspirationCard.innerHTML = inspirationSize;
}

document.addEventListener("DOMContentLoaded", getCount);
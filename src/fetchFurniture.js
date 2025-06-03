import { db } from "./firebase.js";
import { deleteImage } from "./delete.js";
import { collection, getDocs, doc, deleteDoc, orderBy, query } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js';
import { convertTMPToHTML } from "./textParser.js";

const searchInput = document.querySelector("#searchInput");
let furniture = [];

searchInput.addEventListener("input", e => {
    const value = e.target.value.toLowerCase();
    let hasVisible = false;

    furniture.forEach(piece => {
        const matchName = piece.data.furnitureName.toLowerCase().includes(value);
        const matchCategory = piece.data.categoryId.toLowerCase().includes(value);

        const isVisible = matchName || matchCategory;
        piece.element.classList.toggle("hide", !isVisible);
        if(isVisible) hasVisible = true;
    });

    document.getElementById("noResults").style.display = hasVisible ? "none" : "block";
});

async function getFurniture(){
    try{
        const furnitureRef = collection(db, "Furniture");
        const q = query(furnitureRef, orderBy("categoryId", "asc"));
        const querySnapshot = await getDocs(q);
        const tableBody = document.querySelector("#furnitureTable tbody");
        tableBody.innerHTML = "";

        let i = 1;
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${i++}</td>
                <td><img src="${data.image}" alt="${data.furnitureName}" width="80"></td>
                <td>${data.furnitureName}</td>
                <td>${data.categoryId}</td>
                <td>
                    Width: ${data.width} cm <br>
                    Depth: ${data.depth} cm <br>
                    Height: ${data.height} cm
                </td>
                <td class="align-left clamp-cell">
                    <div class="description-wrapper">
                        <div class="clamp-lines" id="desc-${i}">
                            ${convertTMPToHTML(data.description)}
                        </div>
                        <button class="toggle-btn" style="display: none;">
                            See more
                        </button>
                    </div>
                </td>
                <td>
                    <div class="actionButtonsAlign">
                        <button type="button" value="Edit" class="editButton" data-id="${doc.id}">
                            <img src="icon/Edit.png" alt="Edit" title="Edit" class="actionButtonIcon">
                        </button>
                        <button type="button" value="Delete" class="deleteButton" data-id="${doc.id}">
                            <img src="icon/Delete.png" alt="Delete" title="Delete" class="actionButtonIcon">
                        </button>
                    </div>
                </td>
            `;

            tableBody.appendChild(row);
            furniture.push({ data: {id: doc.id, ...data}, element: row});

            const clamp = row.querySelector('.clamp-lines');
            const button = row.querySelector('.toggle-btn');

            if (clamp && button && clamp.scrollHeight > clamp.clientHeight + 20) {
                button.style.display = 'inline-block';
                button.addEventListener('click', () => {
                    clamp.classList.toggle('expanded');
                    button.textContent = clamp.classList.contains('expanded') ? 'See less' : 'See more';
                });
            }
        });

        document.querySelectorAll(".deleteButton").forEach(button => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-id");
                const category = button.closest("tr").querySelector("td:nth-child(4)").textContent;
                const furnitureName = button.closest("tr").querySelector("td:nth-child(3)").textContent;
                if (confirm(`Are you sure you want to delete ${furnitureName}?`)) {
                    deleteFurniture(category, id);
                }
            });
        });

        document.querySelectorAll(".editButton").forEach(button => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-id");
                window.location.href = `addFurniture.html?id=${id}`;
            });
        });

    }catch(e){
        console.error("Error fetching document:", e);
        alert("Failed to fetch furniture. Check the console for errors.");
    }
}

async function deleteFurniture(category, furnitureId) {
    try{
        const docRef = doc(db, "Furniture", furnitureId);
        console.log(docRef.id);

        await deleteImage(`Furniture/${category}`, docRef.id);

        await deleteDoc(docRef);

        alert("Furniture deleted successfully.");
        getFurniture(); // Refresh the table

        console.log(`Furniture with ID ${furnitureId} deleted successfully.`);
    }catch(error){
        console.error("Error deleting furniture:", error);
    }
}

document.addEventListener("DOMContentLoaded", getFurniture);
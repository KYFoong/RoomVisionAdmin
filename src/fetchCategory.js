import { db } from "./firebase.js";
import { deleteImage } from "./delete.js";
import { collection, getDocs, doc, deleteDoc, query, where, writeBatch, orderBy } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js';

const searchInput = document.querySelector("#searchInput");
let searchCat = [];

searchInput.addEventListener("input", e => {
    const value = e.target.value.toLowerCase();
    let hasVisible = false;
    
    searchCat.forEach(piece => {
        const matchCategory = piece.data.categoryName.toLowerCase().includes(value);
        
        const isVisible = matchCategory;
        piece.element.classList.toggle("hide", !isVisible);
        if(isVisible) hasVisible = true;
    });

    document.getElementById("noResults").style.display = hasVisible ? "none" : "block";
});

async function getCategory(){
    try{
        const categoryRef = collection(db, "Category");
        const q = query(categoryRef, orderBy("categoryName", "asc"));
        const querySnapshot = await getDocs(q);
        const tableBody = document.querySelector("#categoryTable tbody");
        tableBody.innerHTML = "";

        let i = 1;
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const row = document.createElement("tr");

            console.log(data);

            row.innerHTML = `
                <td>${i++}</td>
                <td><img src="${data.categoryIcon}" alt="${data.categoryName}" width="80"></td>
                <td>${data.categoryName}</td>
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
            searchCat.push({ data: {id: doc.id, ...data}, element: row});
        });

        document.querySelectorAll(".deleteButton").forEach(button => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-id");
                const categoryName = button.closest("tr").querySelector("td:nth-child(3)").textContent;
                if (confirm(`Are you sure you want to delete ${categoryName} category?\nWarning: Deleting a category will delete all associated furniture.`)) {
                    deleteCategory(id, categoryName);
                }
            });
        });

        document.querySelectorAll(".editButton").forEach(button => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-id");
                window.location.href = `addCategory.html?id=${id}`;
            });
        });

    }catch(e){
        console.error("Error fetching document:", e);
        alert("Failed to fetch category. Check the console for errors.");
    }
}

async function deleteCategory(categoryId, categoryName) {
    try{
        const furnitureQuery = query(collection(db, "Furniture"), where("categoryId", "==", categoryName));
        const querySnapshot = await getDocs(furnitureQuery);

        await deleteImage("Category", categoryId);

        for(const docSnap of querySnapshot.docs){
            const docId = docSnap.id;
            try{
                await deleteImage("Furniture", docId);
                console.log(`${docSnap.furnitureName}, ID: ${docId} image has been deleted from Cloudinary`);
            }catch(err){
                console.error(`Failed to delete image for ${docId}:`, err);
            }
        }

        const batch = writeBatch(db);
        querySnapshot.forEach((docSnap) => {
            batch.delete(doc(db, "Furniture", docSnap.id));
        });

        const categoryRef = doc(db, "Category", categoryId);
        batch.delete(categoryRef);

        await batch.commit();

        alert("Category and all associated furniture deleted successfully.");
        getCategory(); // Refresh the table

        console.log(`Category with ID ${categoryId} deleted successfully.`);

    }catch(error){
        console.error("Error deleting category:", error);
    }
}

document.addEventListener("DOMContentLoaded", getCategory);



import { deleteImage } from "./delete.js";
import { db } from "./firebase.js";
import { collection, getDocs, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js';

const searchInput = document.querySelector("#searchInput");
let inspiration = [];

// Search function
searchInput.addEventListener("input", e => {
    const value = e.target.value.toLowerCase();
    let hasVisible = false;

    inspiration.forEach(piece => {
        const matchTitle = piece.data.title.toLowerCase().includes(value);

        const isVisible = matchTitle;
        piece.element.classList.toggle("hide", !isVisible);
        if(isVisible) hasVisible = true;
    });

    document.getElementById("noResults").style.display = hasVisible ? "none" : "block";
});

async function getInspiration(){
    try{
        const inspirationRef = collection(db, "Inspiration");
        const querySnapshot = await getDocs(inspirationRef);
        const tableBody = document.querySelector("#inspirationTable tbody");
        tableBody.innerHTML = "";

        let i = 1;
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const row = document.createElement("tr");

            console.log(data);

            row.innerHTML = `
                <td>${i++}</td>
                <td><img src="${data.image}" alt="${data.title}" width="120"></td>
                <td>${data.title}</td>
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
            inspiration.push({ data: {id: doc.id, ...data}, element: row});

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
                const title = button.closest("tr").querySelector("td:nth-child(3)").textContent;
                if (confirm(`Are you sure you want to delete ${title} inspiration?`)) {
                    deleteInspiration(id);
                }
            });
        });

        document.querySelectorAll(".editButton").forEach(button => {
            button.addEventListener("click", () => {
                const id = button.getAttribute("data-id");
                window.location.href = `addInspiration.html?id=${id}`;
            });
        });

    }catch(e){
        console.error("Error fetching document:", e);
        alert("Failed to fetch category. Check the console for errors.");
    }
}

async function deleteInspiration(inspirationId) {
    try{
        const docRef = doc(db, "Inspiration", inspirationId);
        console.log(docRef.id);

        await deleteImage("Inspiration", docRef.id);

        await deleteDoc(docRef);

        alert("Inspiration deleted successfully.");
        getInspiration(); // Refresh the table

        console.log(`Inspiration with ID ${inspirationId} deleted successfully.`);
    }catch(error){
        console.error("Error deleting inspiration:", error);
    }
}

function convertTMPToHTML(tmp) {
  let html = tmp;

  // Headings
  html = html.replace(/<size=150%><b>(.*?)<\/b><\/size>/gi, '<h1>$1</h1>');
  html = html.replace(/<size=130%><b>(.*?)<\/b><\/size>/gi, '<h2>$1</h2>');
  html = html.replace(/<size=115%><b>(.*?)<\/b><\/size>/gi, '<h3>$1</h3>');

  // Inline formatting
  html = html.replace(/<b>(.*?)<\/b>/gi, '<strong>$1</strong>');
  html = html.replace(/<i>(.*?)<\/i>/gi, '<em>$1</em>');
  html = html.replace(/<u>(.*?)<\/u>/gi, '<u>$1</u>');
  html = html.replace(/<link="(.*?)">(.*?)<\/link>/gi, '<a href="$1">$2</a>');

  // Handle lists
  // Group lines into blocks and replace in batch
  html = html.replace(/((?:\d+\. .+\n?)+)/g, match => {
    const items = match.trim().split(/\n/).map(line => line.replace(/^\d+\. /, '').trim());
    return `<ol>\n${items.map(i => `<li>${i}</li>`).join('\n')}\n</ol>`;
  });

  html = html.replace(/((?:• .+\n?)+)/g, match => {
    const items = match.trim().split(/\n/).map(line => line.replace(/^• /, '').trim());
    return `<ul>\n${items.map(i => `<li>${i}</li>`).join('\n')}\n</ul>`;
  });

  // Convert remaining line breaks to <br> if needed
  html = html.split(/\n{2,}/).map(block => `<p>${block.trim()}</p>`).join('\n');

  return html.trim();
}


document.addEventListener("DOMContentLoaded", getInspiration);


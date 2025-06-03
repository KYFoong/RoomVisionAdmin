import { collection, addDoc, getDoc, getDocs, doc, setDoc, query, where, writeBatch } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js';
import { db } from "./firebase.js"

const urlParams = new URLSearchParams(window.location.search);
const categoryId = urlParams.get("id");
const cloudName = "dcvgh3vbt";

let oldCategoryName = "";

document.getElementById("categoryIcon").addEventListener("change", function () {
  const file = this.files[0];

  if (file && !file.type.startsWith("image/")) {
    alert("Only image files are allowed (e.g., JPG, PNG, GIF).");
    this.value = ""; // Clear the invalid file
    document.getElementById("currentImage").src = ""; // Clear preview
  }
});

if(categoryId){
  document.querySelector(".appbar h2").textContent = "Edit Category";
  document.querySelector("#uploadCategory").value = "Edit";

  document.getElementById("categoryIcon").removeAttribute("required");

  const imagePreview = document.createElement("div");
  imagePreview.style.display = "flex";
  imagePreview.style.alignItems = "center"; 
  imagePreview.style.gap = "10px";

  imagePreview.innerHTML = `
    <p>Current Image: </p>
    <img src="" id="currentImage" alt="Current Category Image" class="img-fluid" style="max-width: 150px; height: auto;">
    `;

  const container = document.getElementById("image-div");
  container.insertBefore(imagePreview, container.firstChild);

  const docRef = doc(db, "Category", categoryId);
  getDoc(docRef).then(docSnap => {
    if(docSnap.exists()){
      const data = docSnap.data();
      document.getElementById("categoryName").value = data.categoryName;
      oldCategoryName = data.categoryName;
      // document.getElementById("categoryIcon").value = data.categoryIcon;

      const imageElement = document.getElementById("currentImage");
      if (imageElement) {
        imageElement.src = data.categoryIcon; 
      }
    }else{
      console.log("Category not found!");
    }
  }).catch(error => {
    console.error("Error fetching category:", error);
    alert("Failed to load category for editing.");
  })
}

document.getElementById("categoryForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const categoryName = document.getElementById("categoryName").value;
    const categoryIcon = document.getElementById("categoryIcon").files[0];
    let categoryUrl = null;
    let docRef;

    if(categoryId){
      // Fetch the doc
      docRef = doc(db, "Category", categoryId);
    }else{
      docRef = await addDoc(collection(db, "Category"), {
        categoryName,
        categoryIcon: ""
      });
    }

    if(categoryIcon){
      categoryUrl = await uploadImageFile(categoryIcon, docRef.id);
    }else{
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        categoryUrl = docSnap.data().categoryIcon; // Use the existing URL
      }
    }

    try {
      if(categoryId){
        // Edit
        const furnitureQuery = query(collection(db, "Furniture"), where("categoryId", "==", oldCategoryName));
        const querySnapshot = await getDocs(furnitureQuery);

        const batch = writeBatch(db);
        querySnapshot.forEach(docSnap => {
          batch.update(doc(db, "Furniture", docSnap.id), { categoryId: categoryName });
        })
        await batch.commit();

        await setDoc(docRef, { categoryName, categoryIcon: categoryUrl });
        alert("Category updated successfully!");
        window.location.href = "category.html"
      }else{
        // Add
        await setDoc(docRef, { categoryName, categoryIcon: categoryUrl });
        alert("Category added successfully!");
        console.log("Document written with ID:", docRef.id);

        // Clear form 
        document.getElementById("categoryForm").reset();
      }
    } catch (error) {
      console.error("Error adding document:", error);
      alert("Failed to add category. Check the console for errors.");
    }
});

async function uploadImageFile(file, docId) {
  const folder = "Category";

  const publicId = docId;

  console.log("public Id:", publicId);

  try {
    // Get signed data from Firebase Function
    const signatureRes = await fetch("https://functions-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder: folder, public_id: publicId }) 
    });

    if (!signatureRes.ok) {
      console.error("Failed to get signature:", signatureRes.statusText);
      throw new Error("Failed to get Cloudinary signature.");
    }
    

    const {
      signature,
      timestamp,
      api_key,
    } = await signatureRes.json();

    console.log("Received signature:", signature);
    console.log("Received apiKey:", api_key);
    console.log("Received timestamp:", timestamp);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", api_key);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", folder);
    formData.append("public_id", publicId);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData
    });

    const result = await response.json();

    if (result.secure_url) {
      return result.secure_url;
    } else {
      throw new Error("Image upload failed");
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image. Please try again.");
  }
}

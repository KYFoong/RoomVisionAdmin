import { collection, addDoc, getDoc, doc, setDoc, Timestamp } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js';
import { db } from "./firebase.js"
import { convertQuillToTMP, convertTMPToHTML } from './textParser.js';

const quill = new Quill('#editor', {
    theme: 'snow'
});

const urlParams = new URLSearchParams(window.location.search);
const furnitureId = urlParams.get("id");
const cloudName = ""; // Input cloud name

document.getElementById("image").addEventListener("change", function () {
  const file = this.files[0];

  if (file && !file.type.startsWith("image/")) {
    alert("Only image files are allowed (e.g., JPG, PNG, GIF).");
    this.value = ""; // Clear the invalid file
    document.getElementById("currentImage").src = ""; // Clear preview
  }
});

if(furnitureId){
  document.querySelector(".appbar h2").textContent = "Edit Furniture";
  document.querySelector("#uploadFurniture").value = "Edit";

  document.getElementById("image").removeAttribute("required");

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

  const docRef = doc(db, "Furniture", furnitureId);
  getDoc(docRef).then(docSnap => {
    if(docSnap.exists()){
      const data = docSnap.data();
      document.getElementById("furnitureName").value = data.furnitureName;
      document.getElementById("category").value = data.categoryId;
      document.getElementById("width").value = data.width;
      document.getElementById("depth").value = data.depth;
      document.getElementById("height").value = data.height;
      quill.clipboard.dangerouslyPasteHTML(convertTMPToHTML(data.description));
      //document.getElementById("description").value = data.description;
      //document.getElementById("image").value = data.image;
      //document.getElementById("model").value = data.model;

      const imageElement = document.getElementById("currentImage");
      if (imageElement) {
        imageElement.src = data.image; 
      }
    }else{
      console.log("Furniture not found!");
    }
  }).catch(error => {
    console.error("Error fetching furniture:", error);
    alert("Failed to load furniture for editing.");
  })
}

document.getElementById("furnitureForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const furnitureName = document.getElementById("furnitureName").value;
    const categoryId = document.getElementById("category").value;
    const width = parseFloat(document.getElementById("width").value);
    const depth = parseFloat(document.getElementById("depth").value);
    const height = parseFloat(document.getElementById("height").value);
    const description = convertQuillToTMP(quill.root.innerHTML);
    const image = document.getElementById("image").files[0];
    //const model = document.getElementById("model").value;

    let imageUrl = null;
    let docRef;

    if(furnitureId){
      docRef = doc(db, "Furniture", furnitureId);
    }else{
      docRef = await addDoc(collection(db, "Furniture"), {
        furnitureName,
        furnitureMaterial: "sss",
        categoryId,
        width,
        depth,
        height,
        description,
        image: "",
        //model,
        createdAt: Timestamp.now()
      })
    }

    if(image){
      imageUrl = await uploadImageFile(image, categoryId, docRef.id);
    }else{
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        imageUrl = docSnap.data().image; // Use the existing URL
      }
    }

    try {
      if(furnitureId){
        await setDoc(docRef, {
          furnitureName,
          furnitureMaterial: "sss",
          categoryId,
          width,
          depth,
          height,
          description,
          image: imageUrl,
          //model,
        },{
          merge: true
        });
        
        alert("Furniture updated successfully!");
        window.location.href = "furniture.html";
      }else{
        await setDoc(docRef, {
          furnitureName,
          furnitureMaterial: "sss",
          categoryId,
          width,
          depth,
          height,
          description,
          image: imageUrl,
          //model,
          createdAt: Timestamp.now()
      });

      alert("Furniture added successfully!");
      console.log("Document written with ID:", docRef.id);

      // Clear form after submission
      document.getElementById("furnitureForm").reset();
      }
        
    } catch (error) {
      console.error("Error adding document:", error);
      alert("Failed to add furniture. Check the console for errors.");
    }
});

async function uploadImageFile(file, type, docId) {
  const folder = `Furniture/${type}`;
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

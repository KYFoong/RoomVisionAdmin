import { collection, addDoc, getDoc, doc, setDoc, Timestamp } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js';
import { db } from "./firebase.js"

const quill = new Quill('#editor', {
    theme: 'snow'
});

const urlParams = new URLSearchParams(window.location.search);
const inspirationId = urlParams.get("id");
const cloudName = "dcvgh3vbt";

document.getElementById("image").addEventListener("change", function () {
  const file = this.files[0];

  if (file && !file.type.startsWith("image/")) {
    alert("Only image files are allowed (e.g., JPG, PNG, GIF).");
    this.value = ""; // Clear the invalid file
    document.getElementById("currentImage").src = ""; // Clear preview 
  }
});

if(inspirationId){
  document.querySelector(".appbar h2").textContent = "Edit Inspiration";
  document.querySelector("#uploadInspiration").value = "Edit";

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

  const docRef = doc(db, "Inspiration", inspirationId);
  getDoc(docRef).then(docSnap => {
    if(docSnap.exists()){
      const data = docSnap.data();
      document.getElementById("title").value = data.title;
      quill.clipboard.dangerouslyPasteHTML(convertTMPToHTML(data.description));
      //document.querySelector("#editor").innerHTML = convertTMPToHTML(data.description);
      //quill.root.innerHTML = convertTMPToHTML(data.description);
      //document.getElementById("image").value = data.image;

      const imageElement = document.getElementById("currentImage");
      if (imageElement) {
        imageElement.src = data.image; 
      }
    }else{
      console.log("Inspiration not found!");
    }
  }).catch(error => {
    console.error("Error fetching inspiration:", error);
    alert("Failed to load inspiration for editing.");
  })
}

document.getElementById("inspirationForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    // document.getElementById("description").value = quill.root.innerHTML;

    const title = document.getElementById("title").value;
    const description = convertQuillToTMP(quill.root.innerHTML);
    const image = document.getElementById("image").files[0];

    let imageUrl = null;
    let docRef;

    if(inspirationId){
      docRef = doc(db, "Inspiration", inspirationId);
    }else{
      docRef = await addDoc(collection(db, "Inspiration"), {
          title,
          description,
          image: "",
          createdAt: Timestamp.now()
      });
    }

    if(image){
      imageUrl = await uploadImageFile(image, docRef.id);
    }else{
      const docSnap = await getDoc(docRef);
      if(docSnap.exists()){
        imageUrl = docSnap.data().image;
      }
    }

    try {
      if(inspirationId){
        // const docRef = doc(db, "Inspiration", inspirationId);
        await setDoc(docRef, {
          title,
          description,
          image: imageUrl,
        }, {
          merge: true,
        });
        
        alert("Inspiration updated successfully!");
        window.location.href = "inspiration.html";
      }else{
        await setDoc(docRef, {
          title,
          description,
          image: imageUrl,
          createdAt: Timestamp.now()
      });

      alert("Inspiration added successfully!");
      console.log("Document written with ID:", docRef.id);

      // Clear form after submission
      document.getElementById("inspirationForm").reset();
      }
        
    } catch (error) {
      console.error("Error adding document:", error);
      alert("Failed to add inspiration. Check the console for errors.");
    }
});

async function uploadImageFile(file, docId) {
  const folder = "Inspiration";
  const publicId = docId;

  console.log("public Id:", publicId);

  try {
    // Get signed data from Firebase Function
    const signatureRes = await fetch("https://us-central1-roomvision-893ec.cloudfunctions.net/generateSignature", {
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

function convertQuillToTMP(html) {
  let tmp = html;

  // Headings
  tmp = tmp.replace(/<h1>(.*?)<\/h1>/gi, '<size=150%><b>$1</b></size>\n\n');
  tmp = tmp.replace(/<h2>(.*?)<\/h2>/gi, '<size=130%><b>$1</b></size>\n\n');
  tmp = tmp.replace(/<h3>(.*?)<\/h3>/gi, '<size=115%><b>$1</b></size>\n\n');

  // Bold, Italic, Underline
  tmp = tmp.replace(/<strong>(.*?)<\/strong>/gi, '<b>$1</b>');
  tmp = tmp.replace(/<em>(.*?)<\/em>/gi, '<i>$1</i>');
  tmp = tmp.replace(/<u>(.*?)<\/u>/gi, '<u>$1</u>');

  // Hyperlinks
  tmp = tmp.replace(/<a[^>]*href="(.*?)"[^>]*>(.*?)<\/a>/gi, '<link="$1">$2</link>');

  // Ordered list items (Quill-style, no <ol>)
  let orderedIndex = 1;
  tmp = tmp.replace(/<li[^>]*data-list="ordered"[^>]*>(.*?)<\/li>/gi, (_, content) => {
    return `${orderedIndex++}. ${content.trim()}\n`;
  });

  // Unordered list items (Quill-style, no <ul>)
  tmp = tmp.replace(/<li[^>]*data-list="bullet"[^>]*>(.*?)<\/li>/gi, (_, content) => {
    return `• ${content.trim()}\n`;
  });

  // Paragraphs (keep inline formatting inside)
  tmp = tmp.replace(/<p>(.*?)<\/p>/gis, (_, content) => {
    return `${content.trim()}\n`;
  });

  // Line breaks
  tmp = tmp.replace(/<br\s*\/?>/gi, '\n');

  // Strip all other tags except TMP-allowed ones
  tmp = tmp.replace(/<(?!\/?(b|i|u|size|link)(?=>|\s.*>))\/?[^>]+>/gi, '');

  // Normalize spacing
  tmp = tmp.replace(/[ \t]+\n/g, '\n');         // Trim line-end spaces
  tmp = tmp.replace(/\n{3,}/g, '\n\n');         // Collapse triple line breaks
  tmp = tmp.trim();

  return tmp;
}

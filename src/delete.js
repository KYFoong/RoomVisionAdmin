const cloudName = "dcvgh3vbt";

export async function deleteImage(type, docId) {
    const folder = type;
    const publicId = `${folder}/${docId}`;
  
    console.log("public Id:", publicId);
  
    try {
      // Get signed data from your Firebase Function
      const signatureRes = await fetch("https://us-central1-roomvision-893ec.cloudfunctions.net/generateDeleteSignature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_id: publicId }) 
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
  
      const deleteForm = new FormData();
      deleteForm.append("api_key", api_key);
      deleteForm.append("timestamp", timestamp);
      deleteForm.append("signature", signature);
      deleteForm.append("public_id", publicId);
  
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
        method: "POST",
        body: deleteForm
      });
  
      const result = await response.json();
  
      if (result.result === "ok") {
        return true;
      } else {
        throw new Error("Image delete failed");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      throw new Error("Failed to delete image. Please try again.");
    }
  }


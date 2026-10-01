// --------------------------------------------------
// CLOUDINARY DIRECT UPLOAD
// --------------------------------------------------

// --------------------------------------------------
// READ CONFIGURATION FROM HTML
// --------------------------------------------------
// We're deliberately NOT putting these values directly into JavaScript as hardcoded values.
// The EJS page will place them in data attributes:
// data-cloud-name
// data-upload-preset
//
// Our external JavaScript reads them here.
const uploadContainer = document.getElementById("cloud-upload");
const cloudName = uploadContainer.dataset.cloudName;
const uploadPreset = uploadContainer.dataset.uploadPreset;

// --------------------------------------------------
// ELEMENTS
// --------------------------------------------------
const fileInput = document.getElementById("fileInput");
const uploadButton = document.getElementById("uploadButton");
const status = document.getElementById("status");

// --------------------------------------------------
// UPLOAD BUTTON
// --------------------------------------------------
uploadButton.addEventListener("click", async () => {
    try {
        // Get selected file.
        const file = fileInput.files[0];
        if (!file) {
            status.textContent = "Please select a file.";
            return;
        }
        status.textContent = "Uploading...";

        // --------------------------------------------------
        // CREATE FORM DATA
        // --------------------------------------------------
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        // --------------------------------------------------
        // DIRECT BROWSER → CLOUDINARY
        // --------------------------------------------------
        // IMPORTANT:
        // This request is NOT going to: localhost:3000
        // It is going directly from the browser to Cloudinary.
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
            {
                method: "POST",
                body: formData,
            },
        );
        const result = await response.json();
        if (!response.ok) {
            console.log("Cloudinary error:", result);
            throw new Error(
                result.error?.message || "Cloudinary upload failed.",
            );
        }

        // --------------------------------------------------
        // UPLOAD SUCCESSFUL
        // --------------------------------------------------
        console.log("Cloudinary response:", result);
        status.textContent = "Upload successful!";
        console.log("Public ID:", result.public_id);
        console.log("Secure URL:", result.secure_url);
        console.log("Resource type:", result.resource_type);

        // --------------------------------------------------
        // SEND METADATA TO OUR EXPRESS SERVER
        // --------------------------------------------------
        // The file has already gone directly to Cloudinary. We're now sending ONLY metadata to Express.
        const metadataResponse = await fetch("/cloud-upload/metadata", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                publicId: result.public_id,
                secureUrl: result.secure_url,
                originalFilename: file.name,
                resourceType: result.resource_type,
            }),
        });
        const metadataResult = await metadataResponse.json();
        console.log("Our server response:", metadataResult);
    } catch (error) {
        console.error(error);
        status.textContent = error.message;
    }
});

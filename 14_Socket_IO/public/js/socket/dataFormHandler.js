import { getSocket } from "./socket.js";
const dataForm = document.getElementById("dataForm");

async function fileToPayload(file) {
    if (!(file instanceof File) || file.size === 0) {
        return null;
    }
    const data = await file.arrayBuffer();
    console.log(data);
    return {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        data,
    };
}

dataForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const socket = getSocket();

    // Get all the data from the form.
    const formData = new FormData(dataForm);
    const image = await fileToPayload(formData.get("image"));
    const video = await fileToPayload(formData.get("video"));
    const audio = await fileToPayload(formData.get("audio"));
    const file = await fileToPayload(formData.get("file"));
    const multipleFiles = await Promise.all(
        formData
            .getAll("files")
            .filter((currentFile) => currentFile instanceof File)
            .filter((currentFile) => currentFile.size > 0)
            .map(fileToPayload),
    );
    const payload = {
        text: formData.get("text"),
        url: formData.get("url"),
        image,
        video,
        audio,
        file,
        multipleFiles,
    };
    console.log("Sending payload:", payload);
    socket.emit("form-data", payload);
});

export {};

import { addMessage } from "./ui.js";

function renderText(text) {
    if (!text) {
        return;
    }
    addMessage(`Text: ${text}`);
}

function renderUrl(url) {
    if (!url) {
        return;
    }
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = url;
    item.appendChild(link);
    document.getElementById("messages").appendChild(item);
}

function createBlob(file) {
    if (!file?.data) {
        return null;
    }
    return new Blob([file.data], {
        type: file.type || "application/octet-stream",
    });
}

function renderImage(file) {
    const blob = createBlob(file);
    if (!blob) {
        return;
    }
    const url = URL.createObjectURL(blob);
    const item = document.createElement("li");
    const title = document.createElement("p");
    title.textContent = `Image: ${file.name}`;
    const image = document.createElement("img");
    image.src = url;
    image.alt = file.name;
    image.style.maxWidth = "400px";
    image.style.maxHeight = "300px";
    image.style.borderRadius = "10px";
    item.appendChild(title);
    item.appendChild(image);
    document.getElementById("messages").appendChild(item);
}

function renderVideo(file) {
    const blob = createBlob(file);
    if (!blob) {
        return;
    }
    const url = URL.createObjectURL(blob);
    const item = document.createElement("li");
    const title = document.createElement("p");
    title.textContent = `Video: ${file.name}`;
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.style.maxWidth = "500px";
    video.style.maxHeight = "350px";
    item.appendChild(title);
    item.appendChild(video);
    document.getElementById("messages").appendChild(item);
}

function renderAudio(file) {
    const blob = createBlob(file);
    if (!blob) {
        return;
    }
    const url = URL.createObjectURL(blob);
    const item = document.createElement("li");
    const title = document.createElement("p");
    title.textContent = `Audio: ${file.name}`;
    const audio = document.createElement("audio");
    audio.src = url;
    audio.controls = true;
    item.appendChild(title);
    item.appendChild(audio);
    document.getElementById("messages").appendChild(item);
}

function renderFile(file) {
    const blob = createBlob(file);
    if (!blob) {
        return;
    }
    const url = URL.createObjectURL(blob);
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    link.textContent = `Download: ${file.name}`;
    item.appendChild(link);
    document.getElementById("messages").appendChild(item);
}

function renderFileByType(file) {
    if (!file) {
        return;
    }
    if (file.type.startsWith("image/")) {
        renderImage(file);
        return;
    }
    if (file.type.startsWith("video/")) {
        renderVideo(file);
        return;
    }
    if (file.type.startsWith("audio/")) {
        renderAudio(file);
        return;
    }
    renderFile(file);
}

export function registerDataFormListener(socket) {
    socket.on("form-data", (data) => {
        console.log("========== FORM DATA BROADCAST RECEIVED ==========");
        console.log(data);
        renderText(data.text);
        renderUrl(data.url);

        renderFileByType(data.image);
        renderFileByType(data.video);
        renderFileByType(data.audio);
        renderFileByType(data.file);
        data.multipleFiles.forEach((file, index) => {
            renderFileByType(file);
        });
    });
}

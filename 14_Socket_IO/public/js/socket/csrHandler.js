import { getSocket } from "./socket.js";
import { csrTestStartBtn, csrTestStopBtn } from "./ui.js";

csrTestStartBtn.addEventListener("click", () => {
    const socket = getSocket();
    socket.emit("csr-test-start");
});

csrTestStopBtn.addEventListener("click", () => {
    const socket = getSocket();
    socket.emit("csr-test-stop");
});

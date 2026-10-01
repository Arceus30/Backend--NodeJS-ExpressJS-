import path from "path";

export function attachmentTemplate() {
    return {
        // Attachments: Nodemailer can also send files.
        attachments: [
            {
                // This controls the name the recipient sees.
                filename: "hello1.txt",
                content: "Hello World 1",
            },
            {
                filename: "hello2.txt",
                // This tells Nodemailer to read the attachment from the filesystem.
                path: path.join(import.meta.dirname, "../files/hello.txt"),
            },
        ],
    };
}

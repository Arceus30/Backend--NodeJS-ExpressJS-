const bcrypt = require("bcrypt");

async function main() {
    const password = "mySecret123";

    // Hash the password. The second argument is the cost/work factor.
    const hash = await bcrypt.hash(password, 12);

    console.log("Original password:");
    console.log(password);

    console.log("\nHash:");
    console.log(hash);

    // Correct password
    const result1 = await bcrypt.compare("mySecret123", hash);
    console.log("\nCorrect password:");
    console.log(result1);

    // Incorrect password
    const result2 = await bcrypt.compare("wrongPassword", hash);
    console.log("\nIncorrect password:");
    console.log(result2);
}

main();

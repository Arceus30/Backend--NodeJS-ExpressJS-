const sequelize = require("./sequelize.js");

const main = async () => {
    try {
        await sequelize.authenticate();
        console.log("Sequelize connected to MySQL");
    } catch (error) {
        console.error("Connection failed:", error.message);
    } finally {
        await sequelize.close();
    }
};
main();

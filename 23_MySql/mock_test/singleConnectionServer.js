require("dotenv").config({ path: ".env.single" });

const { connect, connectionEnd } = require("./db/config");
const { createDB, useDB } = require("./dbHandler/handleDB");
const {
    seedUsers,
    getUsers,
    updateUser,
    deleteUser,
    createUserTable,
} = require("./userHandler/handleUserData");
const {
    seedPosts,
    getPosts,
    createPostTable,
} = require("./postHandler/handlePostData");

const startServer = async () => {
    let connection;
    try {
        connection = await connect();
        const dbName = await createDB(connection);
        await useDB(connection, dbName);

        await createUserTable(connection);
        await createPostTable(connection);

        await seedUsers(connection);
        await seedPosts(connection);

        await getUsers(connection);
        // await updateUser(connection);
        // await deleteUser(connection);

        await getPosts(connection);
    } catch (err) {
        console.error(err);
    } finally {
        await connectionEnd(connection);
    }
};

startServer();

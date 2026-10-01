require("dotenv").config({ path: ".env.pool" });

const { connectPool, connectionEnd } = require("./db/config");
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

const {
    handleSavePointTransaction,
    handleTransaction,
} = require("./transactionHandler/handleTransaction");

const {
    createProcedure,
    callProcedure,
} = require("./procedures/handleProcedures");

const { createViews, callViews } = require("./views/handleVies");

const {
    createIndex,
    createCompositeIndex,
    showIndex,
} = require("./optimization/handleIndexes");

const { explainQuery } = require("./optimization/explainQuery");

const startServer = async () => {
    let pool;
    try {
        pool = await connectPool();

        const dbName = await createDB(pool);
        await useDB(pool, dbName);

        await createUserTable(pool);
        await createPostTable(pool);

        await seedUsers(pool);
        await seedPosts(pool);

        await getUsers(pool);
        // await updateUser(pool);
        // await deleteUser(pool);

        await getPosts(pool);

        handleTransaction(pool);
        handleSavePointTransaction(pool);

        await createProcedure(pool);
        await callProcedure(pool);

        await createViews(pool);
        await callViews(pool);

        await showIndex(pool);
        await createIndex(pool);
        await showIndex(pool);
        await createCompositeIndex(pool);
        await showIndex(pool);

        await explainQuery(pool);
    } catch (err) {
        console.error(err);
    } finally {
        await connectionEnd(pool);
    }
};

startServer();

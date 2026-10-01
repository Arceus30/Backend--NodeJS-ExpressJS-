const mongodb = require("mongodb");

const MongoClient = mongodb.MongoClient;

const url = `mongodb://localhost:27017`;
const client = new MongoClient(url);

async function main() {
    try {
        await client.connect();
        console.log("Connected to", url);

        const db = client.db("fruits");
        const collection = db.collection("apples");

        const doc1 = { name: "red apples", color: "red" };
        const doc2 = { name: "green apples", color: "green" };

        // C - Create
        // const result = await collection.insertMany([doc1, doc2]);
        // console.log(`${result.insertedCount} documents inserted`);

        // R - Read
        // const found = await collection.find({}).toArray();
        // console.log(found);

        // U - Update
        // const result = await collection.updateMany(
        //     { name: "red apples" },
        //     { $set: { color: "green" } },
        // );
        // console.log(`${result.modifiedCount} documents updated`);

        // D - Delete
        const res = await collection.deleteMany({ name: "red apples" });
        console.log(`${result.deletedCount} documents deleted`);
    } catch (err) {
        console.log(err);
    } finally {
        await client.close();
    }
}

main();

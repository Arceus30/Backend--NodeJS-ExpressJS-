const { Op } = require("sequelize");
const sequelize = require("./sequelize.js");
const { User } = require("./models/index.js");

const main = async () => {
    try {
        // CREATE:
        const user = await User.create({
            name: "David",
            email: "david@example.com",
            age: 26,
        });
        console.log(user.toJSON());

        // READ:
        const users = await User.findAll();
        console.log(users.map((user) => user.toJSON()));

        const userNames = await User.findAll({ attributes: "name" }); // fetches only names
        console.log(userNames.map((user) => user.toJSON()));

        const userById = await User.findByPk(1); // Find by primary key
        console.log(userById.toJSON());

        const userByEmail = await User.findOne({
            where: { email: "alice@example.com" },
        }); // find by email
        console.log(userByEmail.toJSON());

        // Filtering:
        const filteredUsers = await User.findAll({
            where: { age: { [Op.gte]: 25 } }, // greater than equal to 25
        });
        console.log(filteredUsers);

        // UPDATE:
        await User.update({ age: 30 }, { where: { id: 2 } });

        // DELETE:
        await User.destroy({ where: { id: 2 } });

        // SEARCH:
        const searchedUsers = await User.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: "%ali%" } },
                    { email: { [Op.like]: "%ali%" } },
                ],
            },
        });
        console.log(searchedUsers);

        // PAGINATION:
        const usersPaginated = await User.findAll({
            limit: 10,
            offset: 20,
            order: [["id", "ASC"]],
        });
        console.log(usersPaginated);

        // PAGINATION AND COUNTED:
        const result = await User.findAndCountAll({
            limit: 10,
            offset: 0,
            order: [["id", "ASC"]],
        });
        console.log(result);

        // TRANSACTION:
        await transact();

        // SEQUELIZE ALLOW RAW SQL:
        const [results] = await sequelize.query(
            `SELECT * FROM users WHERE age >= ?`,
            {
                replacements: [25],
            },
        );
        console.log(results);
    } catch (error) {
        console.error(error);
    } finally {
        await sequelize.close();
    }
};

async function transact() {
    await sequelize.transaction(async (transaction) => {
        const user = await User.create(
            {
                name: "David",
                email: "david@example.com",
                age: 26,
            },
            { transaction },
        );
        await Post.create(
            {
                title: "David's Post",
                content: "Hello",
                user_id: user.id,
            },
            { transaction },
        );
    });
}

main();

const sequelize = require("./sequelize.js");
const { User, Post } = require("./models/index.js");

const main = async () => {
    try {
        // JOIN:
        // const posts = await Post.findAll({ include: User });
        // console.log(posts.map((post) => post.toJSON()));

        const posts = await Post.findAll({
            attributes: ["id", "title", "content"],
            include: { model: User, attributes: ["id", "name", "email"] },
        });
        console.log(posts.map((post) => post.toJSON()));
    } catch (error) {
        console.error(error);
    } finally {
        await sequelize.close();
    }
};
main();

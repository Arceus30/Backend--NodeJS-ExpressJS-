const User = require("./userModel.js");
const Post = require("./postModel.js");

User.hasMany(Post, {
    foreignKey: "user_id",
});

Post.belongsTo(User, {
    foreignKey: "user_id",
});

module.exports = { User, Post };

const { DataTypes, Model } = require("sequelize");
const sequelize = require("../sequelize.js");

class Post extends Model {}
Post.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        content: {
            type: DataTypes.TEXT,
        },

        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "Post",
        tableName: "posts",
        timestamps: false,
    },
);

module.exports = Post;

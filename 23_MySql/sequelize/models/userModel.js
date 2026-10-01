const { DataTypes, Model } = require("sequelize");
const sequelize = require("../sequelize.js");

class User extends Model {}
User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },

        age: {
            type: DataTypes.INTEGER,
        },

        status: {
            type: DataTypes.STRING(20),
            defaultValue: "active",
        },

        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        modelName: "User",
        tableName: "users",
        timestamps: false,
    },
);

module.exports = User;

const User = require("../models/User");

// ==================================================
// CREATE USER
// ==================================================
// "POST /api/users" : Creates a new user in MongoDB.
const createUser = async (req, res, next) => {
    try {
        const user = await User.create(req.body);

        // or
        // const user = new User(req.body);
        // await user.save();

        // 201 = resource successfully created
        res.status(201).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

// ==================================================
// GET ALL USERS
// ==================================================
// "GET /api/users" : Retrieves all users from MongoDB.
const getUsers = async (req, res, next) => {
    try {
        const users = await User.find();

        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error) {
        next(error);
    }
};

// ==================================================
// GET ONE USER
// ==================================================
// "GET /api/users/:id" :  Retrieves one user using their MongoDB _id.
const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        // If no document was found, return 404.
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

// ==================================================
// UPDATE USER
// ==================================================
// "PATCH /api/users/:id" :  Updates an existing user.
const updateUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,

            // Fields that should be updated.
            req.body,

            {
                // Return the UPDATED document instead of the old document.
                new: true,

                // Run our schema validators while updating.
                runValidators: true,
            },
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

// ==================================================
// DELETE USER
// ==================================================
// "DELETE /api/users/:id" :  Deletes a user from MongoDB.
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

// ==================================================
// EXPORT CONTROLLERS
// ==================================================
module.exports = {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
};

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const { findByEmail, createUser, updateUserById, delUser, getAllUsers, removePasswordFieldFromArray } = require("./service");
const { downloadContents, fetchDataUtils } = require("../utils");
exports.registerUser = async (req, res) => {
    try {
        const {
            phoneNo,
            name,
            password,
            address,
            email,
        } = req.body;
        const existingUser = await findByEmail({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                message: "User with this email already exists",
            });
        } else {
            const passwordHash = await bcrypt.hash(password, 12);
            const data = {
                phoneNo,
                name,
                password: passwordHash,
                address,
                email: email.toLowerCase(),
            };
            const addedUser = await createUser(data);
            const { password: excludedPassword, ...newAddedUser } = addedUser.toObject();
            console.log(addedUser, " addedUser ", newAddedUser)
            return res
                .status(200)
                .json({ user: newAddedUser, message: "User added successfully." });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An unexpected error occurred. Please try again later.",
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await findByEmail({ email: email.toLowerCase() });
        if (!user) {
            return res
                .status(400)
                .json({ message: "No User found with this email." });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Invalid password." });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h",
            }
        );
        const withoutPasswordUser = { ...user.toObject() };
        delete withoutPasswordUser.password;
        return res.status(200).json({
            user: withoutPasswordUser,
            token,
            message: "User successfully logged in.",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An unexpected error occurred. Please try again later.",
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { name, email, address } = req.body;
        const user = await findByEmail({ email: email.toLowerCase() });

        if (!user) {
            return res
                .status(400)
                .json({ message: "No user found with this phone number." });
        }
        const data = {
            name,
            address
        };
        const updatedUser = await updateUserById(user._id, data);
        const withoutPasswordUser = { ...updatedUser.toObject() };
        delete withoutPasswordUser.password;
        return res.status(200).json({
            user: withoutPasswordUser,
            message: "Your information has been successfully updated.",
        });
    } catch (error) {
        console.error("Error updating user:", error);
        return res
            .status(500)
            .json({ message: "An error occurred while updating user information." });
    }
};

exports.deleteUser = async (req, res) => { 
    const { id } = req.params;
    console.log("id", id)
    try {
        const deletedUser = await delUser(id);
        if (!deletedUser) {
            return res.status(404).send("User not found");
        }
        res.status(200).send("User deleted successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to delete the user");
    }
}

exports.getUsers = async (req, res) => {
    try {
        const users = await getAllUsers();
        const usersWithoutPassword = await removePasswordFieldFromArray(users);
        res.status(200).json(usersWithoutPassword);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to retrieve user data. Please try again later.",
        });
    }
};

// Problem 1: Asynchronous Operations
exports.download = async (req, res) => {
    try {
        const urlsToDownload = [
            'https://api.github.com/repos/octocat/hello-world',
            'https://www.lipsum.com/feed/html',
            'https://jsonplaceholder.typicode.com/posts/1',
        ];

        const downloadedContents = await downloadContents(urlsToDownload);

        console.log('Downloaded contents:', downloadedContents);
        res.status(200).json({ message: "Successful." });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({
            message: "Error occurred."
        });
    }
}

// Problem 2: Error Handling
exports.fetchData = async (req, res) => {
    const apiEndpoint = 'https://jsonplaceholder.typicode.com/posts/1';

    try {
        const data = await fetchDataUtils(apiEndpoint);
        console.log('Data received:', data);
        res.status(200).json({ message: 'Data received successfully', data });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Error occurred while fetching data', error: error.message });
    }
}


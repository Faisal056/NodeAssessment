const User = require("./model");

exports.findByEmail = async (email) => {
    try {
      const user = await User.findOne(email);
      return user; 
    } catch (error) {
      throw error;
    }
};

exports.createUser = async (data) => {
    try {
      const user = new User(data);
      return await user.save();
    } catch (error) {
      throw error;
    }
};

exports.updateUserById = async (id, data) => {
    try {
        const user = await User.findByIdAndUpdate(id, data, {
            new: true,
        });
        return user;
    } catch (error) {
        console.error('Failed to update user by ID:', error);
        throw error;
    }
};

exports.delUser = async (id) => {
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    } catch (error) {
        throw error;
    }
};  

exports.getAllUsers = async () => {
    try {
        const users = await User.find()
        return users;
    } catch (error) {
        throw error;
    }
};

exports.removePasswordFieldFromArray = async (users) => {
    try {
        return users.map((user) => {
            const userObject = user.toObject();
            delete userObject.password;
            return userObject;
        });
    } catch (error) {
        throw error
    }
}
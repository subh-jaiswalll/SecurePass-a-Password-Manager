const crypto = require("crypto");
const mongoose = require("mongoose");
const Password = require("../models/passwordModel.js");

const {
  encryptPassword,
  decryptPassword,
} = require("../services/passwordEncryption.js");

const savePassword = async (req, res) => {
  try {
    const { title, username, website, password } = req.body;

    const userId = req.user.id;

    // Encrypt password
    const encryptedData = encryptPassword(password);

    // Save in MongoDB
    const savedPassword = await Password.create({
      userId: userId,

      title: title,

      username: username,

      website: website,

      encryptedPassword: encryptedData.encryptedPassword,

      iv: encryptedData.iv,

      authTag: encryptedData.authTag,
    });

    return res.status(201).json({
      success: true,
      message: "Password saved successfully",

      data: {
        id: savedPassword._id,
        title: savedPassword.title,
        username: savedPassword.username,
        website: savedPassword.website,
      },
    });
  } catch (error) {
    console.log("Save Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error saving password",
    });
  }
};

const getAllPasswords = async (req, res) => {
  try {
    const passwords = await Password.find({
      userId: req.user.id,
    });

    const result = [];

    for (let item of passwords) {
      const decryptedPassword = decryptPassword(
        item.encryptedPassword,
        item.iv,
        item.authTag,
      );

      result.push({
        id: item._id,
        title: item.title,
        username: item.username,
        website: item.website,
        password: decryptedPassword,
      });
    }

    return res.status(200).json({
      success: true,
      count: result.length,
      passwords: result,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getPasswordById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid password ID",
      });
    }

    const password = await Password.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!password) {
      return res.status(404).json({
        success: false,
        message: "Password not found",
      });
    }

    const decryptedPassword = decryptPassword(
      password.encryptedPassword,
      password.iv,
      password.authTag,
    );

    return res.status(200).json({
      success: true,
      password: {
        id: password._id,
        title: password.title,
        username: password.username,
        password: decryptedPassword,
        website: password.website,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { id } = req.params;

    const { title, username, password, website } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid password ID",
      });
    }

    const existingPassword = await Password.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!existingPassword) {
      return res.status(404).json({
        success: false,
        message: "Password not found",
      });
    }

    // Update normal fields
    if (title !== undefined) {
      existingPassword.title = title;
    }

    if (username !== undefined) {
      existingPassword.username = username;
    }

    if (website !== undefined) {
      existingPassword.website = website;
    }

    // Encrypt only if a new password is provided
    if (password !== undefined && password !== "") {
      const encryptedData = encryptPassword(password);

      existingPassword.encryptedPassword = encryptedData.encryptedPassword;

      existingPassword.iv = encryptedData.iv;

      existingPassword.authTag = encryptedData.authTag;
    }

    await existingPassword.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deletePassword = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid password ID",
      });
    }

    const deletedPassword = await Password.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!deletedPassword) {
      return res.status(404).json({
        success: false,
        message: "Password not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const generatePassword = async (req, res) => {
  try {
    const { length, type } = req.body;

    const passwordLength = length || 16;
    const passwordType = type || "mixed";

    if (
      !Number.isInteger(passwordLength) ||
      passwordLength < 8 ||
      passwordLength > 64
    ) {
      return res.status(400).json({
        success: false,
        message: "Password length must be between 8 and 64",
      });
    }

    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=";

    let characters = "";
    let requiredGroups = [];

    if (passwordType === "digits") {
      characters = numbers;
      requiredGroups = [numbers];
    } else if (passwordType === "alphabets") {
      characters = uppercase + lowercase;
      requiredGroups = [uppercase, lowercase];
    } else if (passwordType === "alphanumeric") {
      characters = uppercase + lowercase + numbers;
      requiredGroups = [uppercase, lowercase, numbers];
    } else if (passwordType === "symbols") {
      characters = symbols;
      requiredGroups = [symbols];
    } else if (passwordType === "mixed") {
      characters = uppercase + lowercase + numbers + symbols;
      requiredGroups = [uppercase, lowercase, numbers, symbols];
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid password type",
      });
    }

    if (passwordLength < requiredGroups.length) {
      return res.status(400).json({
        success: false,
        message: "Password length is too short for selected type",
      });
    }

    let password = "";

    // Add at least one character from every required group
    for (let group of requiredGroups) {
      const randomIndex = crypto.randomInt(group.length);

      password += group[randomIndex];
    }

    // Generate remaining characters
    for (let i = password.length; i < passwordLength; i++) {
      const randomIndex = crypto.randomInt(characters.length);

      password += characters[randomIndex];
    }

    // Shuffle password
    const passwordArray = password.split("");

    for (let i = passwordArray.length - 1; i > 0; i--) {
      const j = crypto.randomInt(i + 1);

      const temp = passwordArray[i];

      passwordArray[i] = passwordArray[j];

      passwordArray[j] = temp;
    }

    password = passwordArray.join("");

    return res.status(200).json({
      success: true,
      message: "Password generated successfully",
      password,
      length: passwordLength,
      type: passwordType,
    });
  } catch (err) {
    console.log("Generate Password Error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const regeneratePassword = async (req, res) => {
    try {

        const { id } = req.params;
        const { length, type } = req.body;

        // Validate password ID
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid password ID"
            });
        }

        // Find existing password belonging to logged-in user
        const existingPassword = await Password.findOne({
            _id: id,
            userId: req.user.id
        });

        if (!existingPassword) {
            return res.status(404).json({
                success: false,
                message: "Password not found"
            });
        }

        // Default values
        const passwordLength = length || 16;
        const passwordType = type || "mixed";

        // Validate length
        if (
            !Number.isInteger(passwordLength) ||
            passwordLength < 8 ||
            passwordLength > 64
        ) {
            return res.status(400).json({
                success: false,
                message: "Password length must be between 8 and 64"
            });
        }

        // Character groups
        const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lowercase = "abcdefghijklmnopqrstuvwxyz";
        const numbers = "0123456789";
        const symbols = "!@#$%^&*()_+-=";

        let characters = "";
        let requiredGroups = [];

        // Select password type
        if (passwordType === "digits") {

            characters = numbers;
            requiredGroups = [numbers];

        } else if (passwordType === "alphabets") {

            characters = uppercase + lowercase;
            requiredGroups = [uppercase, lowercase];

        } else if (passwordType === "alphanumeric") {

            characters = uppercase + lowercase + numbers;
            requiredGroups = [uppercase, lowercase, numbers];

        } else if (passwordType === "symbols") {

            characters = symbols;
            requiredGroups = [symbols];

        } else if (passwordType === "mixed") {

            characters = uppercase + lowercase + numbers + symbols;

            requiredGroups = [
                uppercase,
                lowercase,
                numbers,
                symbols
            ];

        } else {

            return res.status(400).json({
                success: false,
                message: "Invalid password type"
            });

        }

        // Generate password
        let newPassword = "";

        // Ensure required character groups
        for (let group of requiredGroups) {

            const randomIndex = crypto.randomInt(group.length);

            newPassword += group[randomIndex];

        }

        // Generate remaining characters
        for (let i = newPassword.length; i < passwordLength; i++) {

            const randomIndex = crypto.randomInt(characters.length);

            newPassword += characters[randomIndex];

        }

        // Shuffle password
        const passwordArray = newPassword.split("");

        for (let i = passwordArray.length - 1; i > 0; i--) {

            const j = crypto.randomInt(i + 1);

            const temp = passwordArray[i];

            passwordArray[i] = passwordArray[j];

            passwordArray[j] = temp;

        }

        newPassword = passwordArray.join("");

        // Encrypt new password
        const encryptedData = encryptPassword(newPassword);

        // Update existing password
        existingPassword.encryptedPassword =
            encryptedData.encryptedPassword;

        existingPassword.iv = encryptedData.iv;

        existingPassword.authTag = encryptedData.authTag;

        await existingPassword.save();

        return res.status(200).json({
            success: true,
            message: "Password regenerated successfully",
            password: newPassword,
            length: passwordLength,
            type: passwordType
        });

    } catch (err) {

        console.log("Regenerate Password Error:", err);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
};

module.exports = {
  savePassword,
  getAllPasswords,
  getPasswordById,
  updatePassword,
  deletePassword,
  generatePassword,
  regeneratePassword,
};

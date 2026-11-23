
const mongoose = require("mongoose");

const { Schema } = mongoose;

const passwordSchema = new Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    title: {
        type: String,
        required: true
    },

    username: {
        type: String,
        required: true
    },

    website: {
        type: String
    },

    encryptedPassword: {
        type: String,
        required: true
    },

    iv: {
        type: String,
        required: true
    },

    authTag: {
        type: String,
        required: true
    }

}, { timestamps: true });

const passwordModel = mongoose.model("Password", passwordSchema);

module.exports = passwordModel;

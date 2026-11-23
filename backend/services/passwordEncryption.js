
const crypto = require("crypto");

const algorithm = "aes-256-gcm";

const secretKey = Buffer.from(
    process.env.PASSWORD_ENCRYPTION_KEY,
    "hex"
);

if (secretKey.length !== 32) {
    throw new Error("Encryption key must be 32 bytes");
}

// Encrypt password
const encryptPassword = (password) => {

    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv(
        algorithm,
        secretKey,
        iv
    );

    let encrypted = cipher.update(
        password,
        "utf8",
        "hex"
    );

    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return {
        encryptedPassword: encrypted,
        iv: iv.toString("hex"),
        authTag: authTag.toString("hex")
    };
};

// Decrypt password
const decryptPassword = (
    encryptedPassword,
    iv,
    authTag
) => {

    const decipher = crypto.createDecipheriv(
        algorithm,
        secretKey,
        Buffer.from(iv, "hex")
    );

    decipher.setAuthTag(
        Buffer.from(authTag, "hex")
    );

    let decrypted = decipher.update(
        encryptedPassword,
        "hex",
        "utf8"
    );

    decrypted += decipher.final("utf8");

    return decrypted;
};

module.exports = {
    encryptPassword,
    decryptPassword
};

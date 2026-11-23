const express = require("express");

const router = express.Router();

const {
  savePassword,
  getAllPasswords,
  getPasswordById,
  updatePassword,
  deletePassword,
  generatePassword,
  regeneratePassword,
} = require("../controllers/passwordController");

const authMiddleware = require("../middlewares/authMiddleware.js");

router.use(authMiddleware);

router.post("/generate", generatePassword);

router.post("/regenerate/:id", regeneratePassword);

router.post("/", savePassword);

router.get("/", getAllPasswords);

router.get("/:id", getPasswordById);

router.put("/:id", updatePassword);

router.delete("/:id", deletePassword);

module.exports = router;

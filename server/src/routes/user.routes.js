const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth.middleware");
const User = require("../models/User");

// @route   GET api/v1/me
// @desc    Get current user profile
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    res.json({ result: "success", user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/v1/me
// @desc    Update current user profile
// @access  Private
router.put(
  "/",
  [
    auth,
    [
      check("name", "Name is required").not().isEmpty(),
      check("email", "Please include a valid email").isEmail(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email } = req.body;

    // Build user object
    const userFields = {};
    if (name) userFields.name = name;
    if (email) userFields.email = email;

    try {
      let user = await User.findById(req.user.id);

      if (!user) return res.status(404).json({ msg: "User not found" });

      // Check if email is being updated and if it's already taken
      if (email && email !== user.email) {
        let userExists = await User.findOne({ email });
        if (userExists) {
          return res.status(400).json({ msg: "Email already in use" });
        }
      }

      user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: userFields },
        { new: true, runValidators: true },
      ).select("-passwordHash");

      res.json({ result: "success", user });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  },
);

module.exports = router;

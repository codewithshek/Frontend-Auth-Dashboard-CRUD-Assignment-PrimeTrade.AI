const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth.middleware");
const Task = require("../models/Task");

// @route   GET api/v1/tasks
// @desc    Get all users tasks
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = { userId: req.user.id };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const tasks = await Task.find(query).sort({ date: -1 });
    res.json({ result: "success", count: tasks.length, tasks });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/v1/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ msg: "Task not found" });

    // Make sure user owns task
    if (task.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    res.json({ result: "success", task });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Task not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   POST api/v1/tasks
// @desc    Create a new task
// @access  Private
router.post(
  "/",
  [auth, [check("title", "Title is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, status, priority } = req.body;

    try {
      const newTask = new Task({
        title,
        description,
        status,
        priority,
        userId: req.user.id,
      });

      const task = await newTask.save();
      res.json({ result: "success", task });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  },
);

// @route   PUT api/v1/tasks/:id
// @desc    Update task
// @access  Private
router.put("/:id", auth, async (req, res) => {
  const { title, description, status, priority } = req.body;

  // Build task object
  const taskFields = {};
  if (title) taskFields.title = title;
  if (description) taskFields.description = description;
  if (status) taskFields.status = status;
  if (priority) taskFields.priority = priority;

  try {
    let task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ msg: "Task not found" });

    // Make sure user owns task
    if (task.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: taskFields },
      { new: true },
    );

    res.json({ result: "success", task });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Task not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/v1/tasks/:id
// @desc    Delete task
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ msg: "Task not found" });

    // Make sure user owns task
    if (task.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ result: "success", msg: "Task removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Task not found" });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;

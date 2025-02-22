import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/kanbanDB");

const taskSchema = new mongoose.Schema({
  title: String,
  status: String, // "todo", "inProgress", "done"
  userID: String,
});

const Task = mongoose.model("Task", taskSchema);

// Get all tasks for a user
app.get("/tasks/:userID", async (req, res) => {
  const tasks = await Task.find({ userID: req.params.userID });
  res.json(tasks);
});

// Add a task
app.post("/tasks", async (req, res) => {
  const newTask = new Task(req.body);
  await newTask.save();
  res.json(newTask);
});

// Update task status
app.patch("/tasks/:id", async (req, res) => {
  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedTask);
});

// Delete a task
app.delete("/tasks/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Task deleted" });
});

app.listen(5000, () => console.log("Server running on port 5000"));

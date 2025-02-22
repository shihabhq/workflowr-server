import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { configDotenv } from "dotenv";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5ok9c.mongodb.net/DB?retryWrites=true&w=majority&appName=Cluster0`;

mongoose
  .connect(uri)
  .then((res) => console.log("connected to db"))
  .catch((e) => console.log("Connection failed"));

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

//add new user
app.post("/users", async (req, res) => {
  const { name, email, role } = req.body;
  if (!name && !email && !role) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "user already exists" });
    }

    const user = new User({ name, email, role });
    await user.save();
    res.status(201).send({ message: "successfully created" });
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
});

// Add a task
app.post("/tasks", async (req, res) => {
  const newTask = new Task(req.body);
  await newTask.save();
  res.json(newTask);
});

// Update task status
app.patch("/tasks/:id", async (req, res) => {
  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updatedTask);
});

// Delete a task
app.delete("/tasks/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Task deleted" });
});

app.listen(5000, () => console.log("Server running on port 5000"));

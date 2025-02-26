import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { configDotenv } from "dotenv";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5ok9c.mongodb.net/Workflowr?retryWrites=true&w=majority&appName=Cluster0`;

mongoose
  .connect(uri)
  .then((res) => console.log("connected to db"))
  .catch((e) => console.log("Connection failed"));

const taskSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  tasks: [
    {
      id: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String },
      column: {
        type: String,
        enum: ["todo", "in-progress", "done"],
        required: true,
      },
    },
  ],
});

const Task = mongoose.model("Task", taskSchema);

//will create a new user object
app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  if (!name && !email) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await Task.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: "user already exists" });
    }

    const task = new Task({ email, name, tasks: [] });
    await task.save();

    res.status(201).send({ message: "successfully created" });
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
});

//get the tasks
app.get("/tasks/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const tasks = await Task.findOne({ email });

    return res.json(tasks.tasks);
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
});

//add a task
app.patch("/tasks/:email", async (req, res) => {
  const { email } = req.params;
  const newTask = req.body;

  if (!email) {
    return res.status(400).send({ message: "email is required" });
  }

  try {
    const updatedTask = await Task.findOneAndUpdate(
      { email },
      { $push: { tasks: { ...newTask } } },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).send({ message: "User not found" });
    }

    res.status(200).send(updatedTask.tasks);
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
});

//will put the whole user
app.put("/tasks/:email", async (req, res) => {
  const { email } = req.params;
  const tasks = req.body;

  if (!email || !tasks) {
    return res.status(400).send({ message: "all fields are required" });
  }

  try {
    await Task.findOneAndUpdate({ email }, { $set: { tasks: [...tasks] } });
    res.status(200).send({ message: "updated successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
});

app.delete("/tasks/:email/:id", async (req, res) => {
  const { email, id } = req.params;

  if (!email || !id) {
    return res.status(400).send({ message: "all fields are required" });
  }

  try {
    const updatedUser = await Task.updateOne(
      { email },
      { $pull: { tasks: { id: id } } }
    );

    if (updatedUser.nModified === 0) {
      return res.status(404).send({ message: "Task not found" });
    }
    res.status(200).send({ message: "Task successfully deleted" });
  } catch (error) {
    res.status(500).send({ message: "Internal server error" });
  }
});

//update the user data
app.patch("/tasks/:email/:id", async (req, res) => {
  const { email, id } = req.params;
  const taskObj = req.body;

  if (!email || !id) {
    return res.status(400).send({ message: "All fields are required" });
  }
  const updatedTaskArray = Object.entries(taskObj);
  const key = updatedTaskArray[0][0];
  const value = updatedTaskArray[0][1];

  const updatedObj = { [`tasks.$.${[key]}`]: value };

  try {
    const updatedTask = await Task.findOneAndUpdate(
      { email, "tasks.id": id },
      {
        $set: updatedObj,
      },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).send({ message: "User or task not found" });
    }

    res.status(200).send({ message: "Task updated successfully" });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).send({ message: "Error updating task" });
  }
});

app.get("/", (req, res) => {
  res.send("hi");
});

app.listen(5000, () => {
  console.log("server is listening");
});

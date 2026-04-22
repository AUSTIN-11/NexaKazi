import Project from "../models/Project.js";

// CREATE
export const createProject = async (req, res) => {
  try {
    const project = await Project.create({
      ...req.body,
      user: req.user.id
    });

    res.json(project);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// GET ALL
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id })
      .populate("client");

    res.json(projects);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// UPDATE STATUS (for drag & drop)
export const updateProjectStatus = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.json(project);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// DELETE
export const deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json("Deleted");
  } catch (err) {
    res.status(500).json(err.message);
  }
};

import Project from '../models/Project.js';

export const getProjects = async (req, res) => {
  try {
    const { status } = req.query; 
    
    // If a specific status is provided, filter by it; otherwise, fetch everything
    const filter = status ? { status } : {};
    const projects = await Project.find(filter).sort({ createdAt: -1 }); // Newest first

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching projects.',
      error: error.message
    });
  }
};

export const createProject = async (req, res) => {
  try {
    const { title, pi, duration, grantValue, outcome, status } = req.body;

    const newProject = await Project.create({
      title,
      pi,
      duration,
      grantValue,
      outcome,
      status
    });

    res.status(201).json({
      success: true,
      message: 'Research project added successfully!',
      data: newProject
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create project validation error.',
      error: error.message
    });
  }
};
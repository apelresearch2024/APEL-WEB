import Application from "../models/Application.js";

export const submitApplication = async (req, res) => {
  try {
    const { fullName, email, contact, position, statement } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a resume file in PDF format.' });
    }

    const newApplication = await Application.create({
      fullName,
      email,
      contact,
      position,
      statement,
      resumePath: req.file.path
    });

    res.status(201).json({
      success: true,
      message: 'Application data and resume portfolio submitted successfully!',
      data: newApplication
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error processing application submission.',
      error: error.message
    });
  }
};
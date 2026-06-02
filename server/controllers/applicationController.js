export const submitApplication = async (req, res) => {
  try {
    // Ensure you are destructuring 'vacancyId', not 'position'
    const { fullName, email, contact, vacancyId, statement } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a resume file in PDF format.' });
    }

    const newApplication = await Application.create({
      fullName,
      email,
      contact,
      vacancyId, // Make sure this key matches your Mongoose Model
      statement,
      resumePath: req.file.path
    });

    res.status(201).json({
      success: true,
      message: 'Application data and resume portfolio submitted successfully!',
      data: newApplication
    });

  } catch (error) {
    // Log the error so you can see the validation details in Render logs
    console.error("Submission Error:", error); 
    res.status(500).json({
      success: false,
      message: 'Server error processing application submission.',
      error: error.message
    });
  }
};
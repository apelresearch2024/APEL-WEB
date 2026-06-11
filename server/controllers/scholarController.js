import Scholar from '../models/Scholar.js';


export const getScholars = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    
    const scholars = await Scholar.find(filter).sort({ joinedYear: -1 });

    res.status(200).json({
      success: true,
      count: scholars.length,
      data: scholars
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching scholars.',
      error: error.message
    });
  }
};

export const createScholar = async (req, res) => {
  try {
    const { name, role, email, researchTopic, imageUrl, linkedinUrl, joinedYear } = req.body;

    const newScholar = await Scholar.create({
      name,
      role: role || 'Ph.D. Scholar',
      email,
      researchTopic,
      imageUrl: imageUrl || '',
      linkedinUrl: linkedinUrl || '',
      joinedYear: joinedYear ? Number(joinedYear) : new Date().getFullYear()
    });

    res.status(201).json({
      success: true,
      message: 'Scholar profile created successfully!',
      data: newScholar
    });
  } catch (error) {
    console.error('Mongoose Creation Error Details:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A scholar with this email address already exists.'
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create scholar profile.'
    });
  }
};
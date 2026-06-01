
import Achievement from '../models/Achievement.js';

export const getAchievements = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    
    const achievements = await Achievement.find(filter).sort({ year: -1 }); // Newest years first

    res.status(200).json({
      success: true,
      count: achievements.length,
      data: achievements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching achievements.',
      error: error.message
    });
  }
};

export const createAchievement = async (req, res) => {
  try {
    const { category, title, meta, year } = req.body;

    const newAchievement = await Achievement.create({
      category,
      title,
      meta,
      year
    });

    res.status(201).json({
      success: true,
      message: 'Achievement logged successfully!',
      data: newAchievement
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create achievement entry.',
      error: error.message
    });
  }
};
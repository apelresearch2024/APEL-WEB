import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';

// Route Imports
import authRouter from './routes/authRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import vacancyRoutes from './routes/vacancyRoutes.js';
import apelScholarsRouter from './routes/scholarRoutes.js';
import apelProjectsRouter from './routes/projectRoutes.js';
import apelAchievementsRouter from './routes/acheivementRoutes.js';
import publicationRoutes from './routes/publicationRoutes.js';
import hiringRouter from './routes/hiring.js';
import photoRoutes from './routes/photoRoutes.js';
import { initDriveService } from './config/driveService.js';
import Admin from './models/Admin.js';
// Environment Configuration Initialization
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to your persistent, non-pausing MongoDB Atlas layer
connectDB().then(async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const defaultEmail = process.env.EMAIL_USER || 'apel.research2024@gmail.com';
      const defaultPassword = process.env.ADMIN_PASSWORD || 'APEL@2024';
      
      await Admin.create({
        email: defaultEmail,
        password: defaultPassword
      });
      console.log(`📡 [Seed Engine]: Admin collection initialized successfully with: ${defaultEmail}`);
    }
  } catch (seedError) {
    console.error('⚠️ [Seed Engine Failure]: Could not check or provision admin credentials:', seedError.message);
  }
});
initDriveService();
const app = express();

// ==========================================
// 1. GLOBAL SECURITY & PERFORMANCE LAYER
// ==========================================


app.use(helmet());


app.use(compression());

const allowedOrigins = [
  'http://localhost:5173',                 
  'http://localhost:3000',                  
  process.env.FRONTEND_URL,
  'https://apel-web.vercel.app'  
].filter(Boolean);
app.use(cors({
  origin: function (origin, callback) {

    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Origin is allowed
    } else {
      callback(new Error('Blocked by CORS policy: Unauthorized Origin'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// ==========================================
// 2. RATE LIMITER CONFIGURATIONS
// ==========================================

// Global API Limiter (For standard data fetching)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Max 500 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests originating. Please try again after 15 minutes."
  }
});

// Tight Auth Limiter (Stop brute force attempts cold)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Strict limit: Only 5 login attempts allowed per 15-minute window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many failed login attempts. Login has been temporarily restricted for 15 minutes."
  }
});

// Apply the global limiter safely to standard endpoints
app.use('/api/', globalLimiter);

// ==========================================
// 3. TARGETED ROUTE HANDLERS
// ==========================================

// --- LOGIN ROUTE (Protected with strict authLimiter middleware) ---
app.use('/api/auth', authLimiter, authRouter);

// --- MOUNT ROUTE PLUGINS ---
app.use('/api/scholars', apelScholarsRouter);
app.use('/api/projects', apelProjectsRouter);
app.use('/api/achievements', apelAchievementsRouter);
app.use('/api/announcements', announcementRoutes);
app.use('/api/vacancies', vacancyRoutes);
app.use('/api/publications', publicationRoutes);
app.use('/api', hiringRouter);
app.use('/api/photos', photoRoutes);

app.get('/', (req, res) => {
  res.send('IIT Roorkee - APEL Lab Central Engine API Cluster Running.');
});

// ==========================================
// 4. GLOBAL FAULT ISOLATION (Error Handling)
// ==========================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Routing Error.' });
});

// Render handles dynamic environment assignment automatically
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Central Backend Engine Active on port ${PORT}`);
});
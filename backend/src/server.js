const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

require('dotenv').config();

const { sequelize, Admin, Quiz, Question } = require('./models');
const { Op } = require('sequelize');
const { initializeSocket } = require('./services/socket');
const { runAutoMigrations } = require('./services/schemaMigration');

// Routes
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const analyticsRoutes = require('./routes/analytics');
const exportRoutes = require('./routes/export');
const brandingRoutes = require('./routes/branding');

const app = express();
app.set('trust proxy', 1); // Trust first proxy for Azure App Service / Cloudflare / Nginx
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "https://quiz.mscprpcem.tech",
      "https://verify.mscprpcem.tech",
      "https://portal.mscprpcem.tech",
      "https://www.mscprpcem.tech"
    ];

const corsOriginFn = (origin, callback) => {
  if (!origin) return callback(null, true);

  const cleanOrigin = origin.replace(/\/+$/, '');

  // Exact configured origins
  if (allowedOrigins.includes(cleanOrigin) || allowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  try {
    const parsed = new URL(origin);
    const host = parsed.hostname.toLowerCase();

    // Localhost / 127.0.0.1 for development
    if (host === 'localhost' || host === '127.0.0.1') {
      return callback(null, true);
    }

    // Official MSC & university domains and subdomains
    if (
      host === 'mscprpcem.tech' || host.endsWith('.mscprpcem.tech') ||
      host === 'prpcem.ac.in' || host.endsWith('.prpcem.ac.in') ||
      host === 'microsoftclub.tech' || host.endsWith('.microsoftclub.tech')
    ) {
      return callback(null, true);
    }

    // Azure cloud domains (App Service & Static Web Apps)
    if (host.endsWith('.azurewebsites.net') || host.endsWith('.azurestaticapps.net')) {
      return callback(null, true);
    }

    // Private LAN IPs for local mobile/device testing
    if (/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(host)) {
      return callback(null, true);
    }
  } catch (e) {}

  // Safe fail-closed without throwing 500 uncaught error
  callback(null, false);
};

// =======================
// Socket.IO
// =======================

const io = new Server(server, {
  transports: ["websocket", "polling"],
  cors: {
    origin: corsOriginFn,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  }
});

// =======================
// Security
// =======================

// 1. Trust Reverse Proxy (Azure App Service / Cloudflare / Nginx)
app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

const corsOptions = {
  origin: corsOriginFn,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "X-API-Key",
    "x-api-key",
    "Cache-Control",
    "Pragma"
  ],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =======================
// Static Files
// =======================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "uploads"))
);

app.use(
  "/assets/email",
  express.static(path.join(__dirname, "assets", "email"))
);

// =======================
// Rate Limiters (with Clean IP Generator for Proxies)
// =======================

const cleanIpGenerator = (req) => {
  const rawIp = req.ip || (req.headers && req.headers['x-forwarded-for']) || (req.socket && req.socket.remoteAddress) || '127.0.0.1';
  const firstIp = String(rawIp).split(',')[0].trim();
  return firstIp.replace(/:\d+$/, '') || '127.0.0.1';
};

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600, // 600 requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: cleanIpGenerator,
  validate: false,
  message: {
    error: "Too many requests. Please try again later."
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // 50 attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: cleanIpGenerator,
  validate: false,
  message: {
    error: "Too many authentication attempts. Please try again after 15 minutes."
  }
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

app.use("/api", generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/sso-login", authLimiter);
app.use("/api/student/login", authLimiter);
app.use("/api/student/register", authLimiter);
app.use("/api/student/send-otp", authLimiter);
app.use("/api/student/verify-otp", authLimiter);
app.use("/api/student/forgot-password", authLimiter);
app.use("/api/student/reset-password", authLimiter);

// =======================
// Routes
// =======================

const scheduledQuizRoutes = require('./routes/scheduledQuiz');
const studentSyncRoutes = require('./routes/studentSync');
const ssoRoutes = require('./routes/sso');
const emailDispatchRoutes = require('./routes/emailDispatch');
const eventsApiRoutes = require('./routes/eventsApi');
const userDirectoryRoutes = require('./routes/userDirectory');
const subscribersRoutes = require('./routes/subscribers');
const gitApiRoutes = require('./routes/gitApi');

app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/scheduled-quizzes", scheduledQuizRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/branding", brandingRoutes);
app.use("/api/student", studentSyncRoutes);
app.use("/api/student-sync", studentSyncRoutes);
app.use("/api/admin/email-dispatch", emailDispatchRoutes);
app.use("/api/admin/users", userDirectoryRoutes);
app.use("/api/users-directory", userDirectoryRoutes);
app.use("/api/events", eventsApiRoutes);
app.use("/api/v1/events", eventsApiRoutes);
app.use("/api/subscribers", subscribersRoutes);
app.use("/api/git", gitApiRoutes);
app.use("/api/admin/git", gitApiRoutes);
app.use("/oauth", ssoRoutes);

// =======================
// Root
// =======================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MSC Quiz Platform API Running"
  });
});

// =======================
// Error Handler
// =======================

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

// =======================
// Socket Initialization
// =======================

initializeSocket(io);

// =======================
// Start Server
// =======================

async function startServer() {
  try {

    // Test PostgreSQL Connection
    await sequelize.authenticate();
    console.log("✅ Database Connected");

    // Auto-migrate schema and initialize high-concurrency indexes safely
    await runAutoMigrations(sequelize);

    // Purge legacy .edu administrator accounts
    try {
      const deletedEduAdmins = await Admin.destroy({
        where: {
          email: { [Op.like]: '%.edu%' }
        }
      });
      if (deletedEduAdmins > 0) {
        console.log(`🧹 Purged ${deletedEduAdmins} legacy .edu administrator account(s).`);
      }
    } catch (cleanErr) {
      console.warn("Notice during .edu admin cleanup:", cleanErr.message);
    }

    // Seed initial admin only on clean database installation
    const adminCount = await Admin.count();
    if (adminCount === 0) {
      const initialEmail = process.env.ADMIN_EMAIL || "admin@mscprpcem.tech";
      let initialPassword = process.env.ADMIN_PASSWORD;
      if (!initialPassword) {
        if (process.env.NODE_ENV === 'production') {
          initialPassword = require('crypto').randomBytes(16).toString('hex') + '!Aa1';
          console.warn(`⚠️ [SECURITY] Initial admin seeded with auto-generated secure password: ${initialPassword}`);
        } else {
          initialPassword = "Admin@123";
        }
      }
      const initialName = process.env.ADMIN_NAME || "MSC Admin";
      await Admin.create({
        name: initialName,
        email: initialEmail,
        password: initialPassword,
        role: "admin"
      });
      console.log(`✅ Initial Admin Account Initialized: ${initialEmail}`);
    }

    // Seed Starter Quizzes if none exist
    const quizCount = await Quiz.count();
    if (quizCount === 0) {
      console.log("🌱 Seeding starter quiz data...");
      
      const now = new Date();
      const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Quiz 1: DBMS Challenge
      const dbmsQuiz = await Quiz.create({
        title: "Database Management Systems (DBMS) Challenge",
        event_name: "MSC DBMS Championship 2026",
        subject: "DBMS",
        join_code: "DBMS01",
        description: "Master SQL queries, Normalization (1NF to BCNF), ACID transaction properties, Indexing B-Trees, and Relational Algebra.",
        status: "waiting_lobby",
        mode: "LIVE",
        scheduled_start: now,
        scheduled_end: oneDayLater,
        time_limit: 30
      });

      await Question.bulkCreate([
        {
          quiz_id: dbmsQuiz.id,
          question: "Which SQL command is used to retrieve data from a relational database table?",
          option_a: "UPDATE",
          option_b: "SELECT",
          option_c: "INSERT",
          option_d: "DELETE",
          correct_answer: "B",
          timer: 30,
          marks: 500,
          order_index: 1
        },
        {
          quiz_id: dbmsQuiz.id,
          question: "In database normalization, which Normal Form eliminates partial dependencies on a composite primary key?",
          option_a: "1NF (First Normal Form)",
          option_b: "2NF (Second Normal Form)",
          option_c: "3NF (Third Normal Form)",
          option_d: "BCNF (Boyce-Codd Normal Form)",
          correct_answer: "B",
          timer: 30,
          marks: 500,
          order_index: 2
        },
        {
          quiz_id: dbmsQuiz.id,
          question: "Which ACID property guarantees that once a transaction completes successfully, changes are permanently saved even if the system crashes?",
          option_a: "Atomicity",
          option_b: "Consistency",
          option_c: "Isolation",
          option_d: "Durability",
          correct_answer: "D",
          timer: 30,
          marks: 500,
          order_index: 3
        },
        {
          quiz_id: dbmsQuiz.id,
          question: "Which type of SQL JOIN returns all records from the left table and matching records from the right table?",
          option_a: "INNER JOIN",
          option_b: "LEFT (OUTER) JOIN",
          option_c: "RIGHT (OUTER) JOIN",
          option_d: "CROSS JOIN",
          correct_answer: "B",
          timer: 30,
          marks: 500,
          order_index: 4
        },
        {
          quiz_id: dbmsQuiz.id,
          question: "What is the primary data structure commonly used by relational databases for table indexing?",
          option_a: "Binary Search Tree",
          option_b: "B-Tree / B+ Tree",
          option_c: "Linked List",
          option_d: "Min-Heap",
          correct_answer: "B",
          timer: 30,
          marks: 500,
          order_index: 5
        }
      ]);

      // Quiz 2: Azure Cloud & AI Fundamentals
      const cloudQuiz = await Quiz.create({
        title: "Microsoft Azure & Cloud Fundamentals",
        event_name: "MSC Cloud Tech Summit 2026",
        subject: "Cloud",
        join_code: "AZU202",
        description: "Explore core Azure services, virtual networks, cloud computing models (IaaS, PaaS, SaaS), and AZ-900 essentials.",
        status: "waiting_lobby",
        mode: "LIVE",
        scheduled_start: now,
        scheduled_end: oneDayLater,
        time_limit: 30
      });

      await Question.bulkCreate([
        {
          quiz_id: cloudQuiz.id,
          question: "Which cloud service model provides maximum user control over the operating system, storage, and networking?",
          option_a: "Software as a Service (SaaS)",
          option_b: "Infrastructure as a Service (IaaS)",
          option_c: "Platform as a Service (PaaS)",
          option_d: "Function as a Service (FaaS)",
          correct_answer: "B",
          timer: 30,
          marks: 500,
          order_index: 1
        },
        {
          quiz_id: cloudQuiz.id,
          question: "Which Azure service provides a serverless compute engine to run event-driven code without managing servers?",
          option_a: "Azure Virtual Machines",
          option_b: "Azure Functions",
          option_c: "Azure Blob Storage",
          option_d: "Azure ExpressRoute",
          correct_answer: "B",
          timer: 30,
          marks: 500,
          order_index: 2
        },
        {
          quiz_id: cloudQuiz.id,
          question: "Which feature in Azure allows distributing network traffic across multiple virtual machines to ensure high availability?",
          option_a: "Azure Load Balancer",
          option_b: "Azure Key Vault",
          option_c: "Azure Cosmos DB",
          option_d: "Azure Policy",
          correct_answer: "A",
          timer: 30,
          marks: 500,
          order_index: 3
        },
        {
          quiz_id: cloudQuiz.id,
          question: "In cloud computing, what does 'Elasticity' mean?",
          option_a: "The ability to dynamically scale resources up or down based on demand",
          option_b: "The ability to run exclusively on Linux servers",
          option_c: "Storing data only in local cache memory",
          option_d: "Connecting to a database without authentication",
          correct_answer: "A",
          timer: 30,
          marks: 500,
          order_index: 4
        },
        {
          quiz_id: cloudQuiz.id,
          question: "Which Azure storage tier is optimal for storing data that is rarely accessed and can tolerate retrieval latency of several hours?",
          option_a: "Hot Access Tier",
          option_b: "Archive Access Tier",
          option_c: "Cool Access Tier",
          option_d: "Premium Solid State Tier",
          correct_answer: "B",
          timer: 30,
          marks: 500,
          order_index: 5
        }
      ]);

      console.log("✅ Starter quiz data seeded successfully!");
    }


    server.listen(PORT, () => {

      console.log("=================================");
      console.log(`🚀 Server Running`);
      console.log(`Port : ${PORT}`);
      console.log(`Environment : ${process.env.NODE_ENV}`);
      console.log("=================================");

    });

  } catch (err) {

    console.error("❌ Server Startup Failed");

    console.error(err);

    process.exit(1);

  }
}

startServer();
import dotenv from "dotenv";
// Load environment variables from .env file to process.env 
dotenv.config();

// Define required variables and custom messages
const requiredEnvVars = [
  { name: "PORT", message: "PORT is missing. Please specify a server port (e.g., 5000)." },
  { name: "MONGODB_URI", message: "MONGODB_URI is missing. Please provide a MongoDB connection string." },
  { name: "JWT_SECRET", message: "JWT_SECRET is missing. Please provide a secret key for JWT authentication." },
  { name: "NODE_ENV", message: "NODE_ENV is missing. Please specify the environment (e.g., development, production)." }
];

let missingVars = false;

// Check each variable
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar.name]) {
    console.error(`❌ Environment Error: ${envVar.message}`);
    missingVars = true;
  }
}

// Exit if any required variable is missing
if (missingVars) {
  console.error("Stopping application due to missing environment configuration.");
  process.exit(1);
}

const config = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV
};

export default config;
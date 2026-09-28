import app from "./src/app.js";
import config from "./config/config.js";
import connectDB from "./config/db.js";

const PORT = config.PORT;

// Wait for database connection before starting the server
await connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT},http://localhost:${PORT}`);
});
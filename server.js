import mongoose from "mongoose";

import app from "./app.js";

const { DB_HOST, PORT } = process.env;

mongoose
  .connect(DB_HOST)
  .then(() => {
    console.log("Successfully connected to database..");
    app.listen(PORT, () => {
      console.log(`\nServer is running. Use our API on host:\n http://localhost:${PORT}\n`);
      console.log(`Swagger documentation link: \n http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((error) => {
    console.log(error.message);
    process.exit(1);
  });

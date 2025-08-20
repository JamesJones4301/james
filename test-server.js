const express = require("express");
const app = express();

app.use(express.json());

app.get("/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

app.get("/", (req, res) => {
  res.send("Hello World! Server is running.");
});

const PORT = process.env.PORT || 8080; // use PORT from Railway
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


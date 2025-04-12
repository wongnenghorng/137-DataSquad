const express = require("express");
const app = express();
const cors = require("cors");

const port = process.env.PORT || 3001;
app.use(express.json()); // ✅ Important!

const contractRoute = require("./src/routes/contract"); // ✅ correct
app.use(cors());

app.use("/contract", contractRoute);

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

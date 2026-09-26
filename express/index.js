const express = require("express");

const app = express();
const port = 3000;

app.get("/", (_request, response) => {
  response.send("Hello from Express!");
});

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
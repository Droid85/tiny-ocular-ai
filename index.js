const express = require('express');
const app = express();
const PORT = 5000;

app.get('/', (req, res) => {
  res.send('Hello from Express.');
});

app.get('/about', (req, res) => {
  res.json({
    message: "This is about page",
    status: "success"
  });
});

app.listen(PORT, () => {
  console.log(`Server run on http://localhost:${PORT}`);
});

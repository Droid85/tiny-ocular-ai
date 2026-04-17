const express = require('express');
const path = require('path');
const app = express();
const PORT = 5000;

const buildPath = path.join(__dirname, '..', 'frontend', 'tinyocularai-app', 'dist');

app.use(express.static(path.resolve(__dirname, buildPath)));

app.get('/', (req, res) => {
  res.sendFile(
    path.resolve(__dirname, buildPath, 'index.html')
  )
})

app.listen(PORT, () => {
  console.log(`Server run on http://localhost:${PORT}`);
});

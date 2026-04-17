const express = require('express');
const path = require('path');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const app = express();
const PORT = 5000;

const buildPath = path.join(__dirname, '..', 'frontend', 'tinyocularai-app', 'dist');
const prisma = new PrismaClient();
const upload = multer();

app.use(express.static(path.resolve(__dirname, buildPath)));

app.get('/', (req, res) => {
  res.sendFile(
    path.resolve(__dirname, buildPath, 'index.html')
  )
})

app.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    const { camName, modelData, type } = req.body;
    
    const savedPhoto = await prisma.photo.create({
      data: {
        camName,
        type,
        photo: req.file.buffer,
        modelData: JSON.parse(modelData),
      }
    });

    res.status(200).json({ success: true, id: savedPhoto.id });
  } catch (error) {
    console.error(error);
    res.status(500).send('Saving error!');
  }
});

app.listen(PORT, () => {
  console.log(`Server run on http://localhost:${PORT}`);
});

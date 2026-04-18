const express = require('express');
const path = require('path');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const config = require('./prisma.config.js');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

const PORT = 5000;
const prisma = new PrismaClient(config);
const upload = multer();

const buildPath = path.join(__dirname, '..', 'frontend', 'tinyocularai-app', 'dist');
app.use(express.static(buildPath));

app.get('/api/photos', async (req, res) => {
  const photos = await prisma.photo.findMany({
    orderBy: { date: 'desc' },
    take: 50
  });
  
  const lightPhotos = photos.map(p => ({ ...p, photo: p.id }));
  res.json(lightPhotos);
});

app.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    const { camName, modelData, type } = req.body;
    
    const savedPhoto = await prisma.photo.create({
      data: {
        camName,
        type,
        photo: req.file.buffer,
        modelData: typeof modelData === 'string' ? JSON.parse(modelData) : modelData,
      }
    });

    res.status(200).json({ success: true, id: savedPhoto.id });

    io.emit('new-photo', {
        id: savedPhoto.id,
        camName: savedPhoto.camName,
        type: savedPhoto.type,
        date: savedPhoto.date,
        modelData: savedPhoto.modelData,
        photo: savedPhoto.id
    });

  } catch (error) {
    console.error('Load error: ', error);
    if (!res.headersSent) {
        res.status(500).send('Saving error!');
    }
  }
});

app.get('/photo/:id', async (req, res) => {
  try {
    const photo = await prisma.photo.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (photo && photo.photo) {
      res.contentType('image/jpeg');
      res.send(photo.photo);
    } else {
      res.status(404).send('Not found');
    }
  } catch (e) {
    res.status(500).send('Error');
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve(buildPath, 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
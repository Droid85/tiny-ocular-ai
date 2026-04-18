const express = require('express');
const path = require('path');
const multer = require('multer');
const http = require('http');
const { Server } = require('socket.io');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

const Photo = sequelize.define('Photo', {
  camName: { type: DataTypes.STRING, allowNull: false },
  photo: { type: DataTypes.BLOB, allowNull: false },
  modelData: { type: DataTypes.JSONB, allowNull: true },
  type: { type: DataTypes.STRING, allowNull: true },
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://204.168.245.104:3000",
    methods: ["GET", "POST"]
   }
});

const PORT = 5000;
const upload = multer();

// const buildPath = path.join(__dirname, '..', 'frontend', 'tinyocularai-app', 'dist');

app.use(cors());

// app.use(express.static(buildPath));

app.get('/api/photos', async (req, res) => {
  try {
    const photos = await Photo.findAll({
      order: [['createdAt', 'DESC']],
      limit: 50,
      attributes: ['id', 'camName', 'type', 'modelData', 'createdAt']
    });

    const result = photos.map(p => ({
      ...p.toJSON(),
      photo: p.id,
      date: p.createdAt
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send('No file uploaded');

    const { camName, modelData, type } = req.body;
    
    const savedPhoto = await Photo.create({
      camName: camName || 'Unknown Cam',
      type: type || 'default',
      photo: req.file.buffer,
      modelData: typeof modelData === 'string' ? JSON.parse(modelData) : modelData,
    });

    res.status(200).json({ success: true, id: savedPhoto.id });

    io.emit('new-photo', {
      id: savedPhoto.id,
      camName: savedPhoto.camName,
      type: savedPhoto.type,
      date: savedPhoto.createdAt,
      modelData: savedPhoto.modelData,
      photo: savedPhoto.id
    });

  } catch (error) {
    console.error('Upload Error:', error);
    if (!res.headersSent) {
      res.status(500).send('Database saving error');
    }
  }
});

app.get('/photo/:id', async (req, res) => {
  try {
    const photo = await Photo.findByPk(req.params.id);
    if (photo && photo.photo) {
      res.contentType('image/jpeg');
      res.send(photo.photo);
    } else {
      res.status(404).send('Not found');
    }
  } catch (e) {
    res.status(500).send('Server error');
  }
});

// app.use((req, res) => {
//   res.sendFile(path.resolve(buildPath, 'index.html'));
// });

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    
    server.listen(PORT, () => {
      console.log(`🚀 Server ready on http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error('Failed to start server:', e);
  }
};

start();
<template>
  <div class="container">
    <h1>ESP32-CAM Statistics data</h1>
    <div class="gallery">
      <div v-for="photo in photos" :key="photo.id" class="photo-card">
        <div class="image-wrapper">
          <img :src="`http://204.168.245.104:5000/photo/${photo.photo}`" :alt="photo.camName" loading="lazy">
        </div>
        <div class="info">
          <span class="cam-name">{{ photo.camName }}</span>
          <span class="date">{{ new Date(photo.date).toLocaleString() }}</span>
          <div class="type-badge">{{ photo.type }}</div>
          <pre class="model-data">{{ JSON.stringify(photo.modelData, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { io, Socket } from 'socket.io-client';

interface Photo {
  id: number;
  camName: string;
  photo: number;
  date: string;
  modelData: any;
  type: string;
}

const photos = ref<Photo[]>([]);
let socket: Socket | null = null;

const fetchInitialPhotos = async () => {
  try {
    const response = await fetch('http://204.168.245.104:5000/api/photos');
    photos.value = await response.json();
  } catch (err) {
    console.error("Load data error: ", err);
  }
};

onMounted(() => {
  fetchInitialPhotos();

  socket = io('http://204.168.245.104:5000'); 

  socket.on('new-photo', (data: Photo) => {
    console.log('New event: ', data);
    photos.value.unshift(data);
    
    if (photos.value.length > 50) {
      photos.value.pop();
    }
  });
});

onUnmounted(() => {
  if (socket) socket.disconnect();
});
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: sans-serif;
}

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.photo-card {
  border: 1px solid #ddd;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.photo-card:hover {
  transform: translateY(-5px);
}

.image-wrapper img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.info {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cam-name {
  font-weight: bold;
  font-size: 1.1em;
}

.date {
  color: #666;
  font-size: 0.9em;
}

.type-badge {
  background: #e0f2f1;
  color: #00796b;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  align-self: flex-start;
}

.model-data {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 6px;
  font-size: 0.85em;
  overflow-x: auto;
}
</style>
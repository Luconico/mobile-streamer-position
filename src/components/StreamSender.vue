<template>
    <div>
        <video ref="videoElement" autoplay></video>
        <button @click="startCapturing">Iniciar Captura</button>
    </div>
</template>
  
<script lang="ts" setup>
import { ref, onUnmounted, Ref } from 'vue';

const videoElement: Ref<HTMLVideoElement | null> = ref(null);

async function startCapturing(): Promise<void> {
    try {
        const stream: MediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoElement.value) {
            videoElement.value.srcObject = stream;
        }
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
    }
}

onUnmounted(() => {
    const tracks: MediaStreamTrack[] = (videoElement.value?.srcObject as MediaStream)?.getTracks();
    if (tracks) {
        tracks.forEach(track => track.stop());
    }
});
</script>
<template>
    <div>
        <video ref="videoElement" autoplay muted></video>
        <button @click="startCapturing">Iniciar Captura</button>
        <button v-if="state.isRecording" @click="stopRecording">Detener Captura</button>
        <select v-model="selectedCamera">
            <option v-for="camera in cameras" :key="camera.deviceId" :value="camera.deviceId">
                {{ camera.label || `Cámara ${camera.deviceId}` }}
            </option>
        </select>

        <select v-model="selectedMicrophone">
            <option v-for="microphone in microphones" :key="microphone.deviceId" :value="microphone.deviceId">
                {{ microphone.label || `Micrófono ${microphone.deviceId}` }}
            </option>
        </select>
    </div>
</template>
  
<script lang="ts" setup>
import { ref, onUnmounted, Ref, reactive, onMounted } from 'vue';
import { socketService } from '../services/socket-service';


const cameras: any = ref([]);
const microphones: any = ref([]);
const selectedCamera = ref('');
const selectedMicrophone = ref('');

const videoElement: Ref<HTMLVideoElement | null> = ref(null);
const state = reactive({
    isRecording: false,
    mediaRecorder: null as MediaRecorder | null
});


async function startCapturing(): Promise<void> {
    try {
        const constraints = {
            video: { deviceId: selectedCamera.value ? { exact: selectedCamera.value } : undefined },
            audio: { deviceId: selectedMicrophone.value ? { exact: selectedMicrophone.value } : undefined },
        };

        const stream: MediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoElement.value) {
            videoElement.value.srcObject = stream;
            startRecording(stream);
        }
    } catch (error) {
        console.error('Error start capturing:', error);
    }
}

function startRecording(stream: MediaStream) {
    const options = { mimeType: 'video/webm; codecs="vp8,opus"' };
    state.mediaRecorder = new MediaRecorder(stream, options);
    state.mediaRecorder.ondataavailable = handleDataAvailable;
    state.mediaRecorder.start(1000);
    state.isRecording = true;
}

function handleDataAvailable(event: BlobEvent) {
    if (event.data.size > 0) {
        socketService.emit('streamData', event.data);
    }
}

function stopRecording() {
    if (state.mediaRecorder) {
        state.mediaRecorder.stop();
        state.isRecording = false;
    }
}

onMounted(async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    cameras.value = devices.filter(device => device.kind === 'videoinput');
    microphones.value = devices.filter(device => device.kind === 'audioinput');
});

onUnmounted(() => {
    stopRecording();
    const tracks: MediaStreamTrack[] = (videoElement.value?.srcObject as MediaStream)?.getTracks();
    if (tracks) {
        tracks.forEach(track => track.stop());
    }
});
</script>
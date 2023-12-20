<template>
    <div>
        <input v-model="state.targetId" placeholder="ID del destinatario">
        <video ref="localVideo" autoPlay='true' muted='true' playsInline='true'></video>
        <button @click="startCall">Iniciar Llamada</button>
    </div>
</template>
  
<script setup lang='ts'>
import { ref, onMounted, reactive } from 'vue';
import { socketService } from '../services/socket-service';

const localVideo = ref<HTMLVideoElement | null>(null);
let peerConnection: RTCPeerConnection;
const state = reactive({ targetId: '' });

onMounted(async () => {
    try {
        // For desktop await navigator.mediaDevices.getDisplayMedia({ video: true })
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideo.value) {
            localVideo.value.srcObject = stream;
        }
        setupPeerConnection(stream);
    } catch (error) {
        console.error('Error al acceder a los dispositivos:', error);
        alert('Error al acceder a los dispositivos' + error);
    }
});

function setupPeerConnection(stream: MediaStream) {
    peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
    });

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socketService.emit('iceCandidate', { candidate: event.candidate, target: state.targetId });
        }
    };
}

function startCall() {
    peerConnection.createOffer()
        .then(offer => peerConnection.setLocalDescription(offer))
        .then(() => {
            socketService.emit('offer', { sdp: peerConnection.localDescription, target: state.targetId });
        });
}

function handleAnswer({ sdp }: { sdp: RTCSessionDescriptionInit }) {
    const remoteDesc = new RTCSessionDescription(sdp);
    peerConnection.setRemoteDescription(remoteDesc);
}

socketService.on('answer', handleAnswer);
</script>
<template>
    <div>
        <video ref="remoteVideo" autoplay></video>
        <input v-model="state.targetId" placeholder="ID del emisor">
    </div>
</template>
  
<script setup lang='ts'>
import { ref, onMounted, reactive } from 'vue';
import { socketService } from '../services/socket-service';
const state = reactive({ targetId: '' });

const remoteVideo = ref<HTMLVideoElement | null>(null);
let peerConnection: RTCPeerConnection;

onMounted(() => {
    setupPeerConnection();
});

function setupPeerConnection() {
    peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peerConnection.ontrack = event => {
        if (remoteVideo.value) {
            remoteVideo.value.srcObject = event.streams[0];
        }
    };

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socketService.emit('iceCandidate', { candidate: event.candidate, target: state.targetId });
        }
    };
}

function handleOffer({ sdp }: { sdp: RTCSessionDescriptionInit; sender: string }) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
    peerConnection.createAnswer()
        .then(answer => peerConnection.setLocalDescription(answer))
        .then(() => {
            socketService.emit('answer', { sdp: peerConnection.localDescription, target: state.targetId });
        });
}

function handleIceCandidate({ candidate }: { candidate: RTCIceCandidateInit }) {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
}

socketService.on('offer', handleOffer);
socketService.on('iceCandidate', handleIceCandidate);
</script>
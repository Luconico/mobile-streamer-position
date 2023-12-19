<template>
    <div>
        <video ref="videoPlayer" autoplay controls></video>
    </div>
</template>
  
<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { socketService } from '../services/socket-service';

const videoPlayer = ref<HTMLVideoElement | null>(null);
let mediaSource: MediaSource | null = null;
let sourceBuffer: SourceBuffer | null = null;
let queue: Uint8Array[] = [];

onMounted(() => {
    if (videoPlayer.value) {
        mediaSource = new MediaSource();
        videoPlayer.value.src = URL.createObjectURL(mediaSource);
        mediaSource.addEventListener('sourceopen', sourceOpen);
    }

    socketService.on('streamData', (data) => {
        const arrayBuffer = new Uint8Array(data);
        if (sourceBuffer && !sourceBuffer.updating && mediaSource && mediaSource.readyState === 'open') {
            sourceBuffer.appendBuffer(arrayBuffer);
        } else {
            queue.push(arrayBuffer);
        }
    });
});

function sourceOpen() {
    if (!mediaSource) return;

    sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8,opus"');
    sourceBuffer.addEventListener('updateend', () => {
        if (queue.length > 0 && sourceBuffer && !sourceBuffer.updating && mediaSource && mediaSource.readyState === 'open') {
            const buffer = queue.shift();
            if (buffer) {
                sourceBuffer.appendBuffer(buffer);
            } else {
                console.error('Buffer is empty');
            }
        }
    });
}

onUnmounted(() => {
    if (mediaSource && mediaSource.readyState === 'open') {
        mediaSource.endOfStream();
    }
    mediaSource = null;
    sourceBuffer = null;
});
</script>
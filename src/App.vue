<script setup lang="ts">
import StreamSender from './components/StreamSender.vue';
import StreamReceiver from './components/StreamReceiver.vue';

// import WebRTCSender from './components/WebRTCSender.vue';
// import WebRTCReceiver from './components/WebRTCReceiver.vue';
</script>

<template>
  <div>
        <StreamSender />
    </div>
    <div>
        <StreamReceiver />
    </div>
  <!-- <div>
    <WebRTCSender />
  </div>
  <div>
    <WebRTCReceiver />
  </div> -->
</template>

<style scoped></style>


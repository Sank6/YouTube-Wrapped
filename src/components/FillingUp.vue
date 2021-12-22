<template>
  <div id="water" ref="water">
    <div class="fill" ref="fill">
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="300px" height="300px" viewBox="0 0 300 300" enable-background="new 0 0 300 300" xml:space="preserve">
        <!-- eslint-disable-next-line max-len -->
        <path :fill="colour" id="waveShape" d="M300,300V2.5c0,0-0.6-0.1-1.1-0.1c0,0-25.5-2.3-40.5-2.4c-15,0-40.6,2.4-40.6,2.4c-12.3,1.1-30.3,1.8-31.9,1.9c-2-0.1-19.7-0.8-32-1.9c0,0-25.8-2.3-40.8-2.4c-15,0-40.8,2.4-40.8,2.4c-12.3,1.1-30.4,1.8-32,1.9c-2-0.1-20-0.8-32.2-1.9c0,0-3.1-0.3-8.1-0.7V300H300z"/>
      </svg>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FillingUp',
  props: {
    colour: String,
  },
  data() {
    return { filled: 0 };
  },
  mounted() {
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const sx = Math.ceil(vw / 150);
    const sy = Math.ceil(vh / 150);
    const { water } = this.$refs as Record<string, HTMLElement>;
    water.style.transform = `translate3d(0, 0, 0) translate(-50%, -50%) scale(${sx}, ${sy})`;
  },
  methods: {
    fill(percent: number) {
      const { water, fill } = this.$refs as Record<string, HTMLElement>;
      this.filled = percent;
      fill.style.transform = `translate(0, ${((100 - this.filled) / 100) * water.clientHeight}px)`;
      if (percent > 0) water.style.pointerEvents = 'all';
    },
  },
});
</script>

<style scoped>
#water {
  width: 150px;
  height: 150px;
  overflow: hidden;
  backface-visibility: hidden;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(0, 0, 0) translate(-50%, -50%);
  pointer-events: none;
}
#water .fill {
  transform: translate(0, 151px);
  transition: all cubic-bezier(0.2, 0.6, 0.8, 0.4) 0.4s;
}
#water #waveShape {
  animation-name: waveAction;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  animation-duration: 0.5s;
  width: 300px;
  height: 150px;
}
@keyframes waveAction {
  0% {
    transform: translate(-151px, 0);
  }
  100% {
    transform: translate(0, 0);
  }
}
</style>

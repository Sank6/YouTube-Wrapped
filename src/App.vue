<template>
  <div>
    <div id="play-button" ref="playbtn" @click="play" :class="zoom ? 'zoomed' : null">
      <svg width="10" height="10" fill="white">
        <path d="M0 0 L10 5 L0 10 Z" />
      </svg>
    </div>
    <Load ref="load" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Load from './components/Load.vue';

export default defineComponent({
  name: 'App',
  data() {
    return {
      zoom: false,
    };
  },
  components: {
    Load,
  },
  methods: {
    play() {
      this.zoom = true;
      setTimeout(() => {
        const playbtn = this.$refs.playbtn as HTMLElement;
        playbtn.style.display = 'none';
        document.body.style.background = '#FFFFFF';
        const load = this.$refs.load as (typeof Load);
        load.load();
      }, 500);
    },
  },
});
</script>

<style>
body {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #212121;
  background-color: #212121;
  margin: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

#play-button {
  width: 600px;
  height: 350px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  padding: 0 15px;
  background: #ff0000;
  color: #ffffff;
  border-radius: 50% / 11%;
  transition: 1s ease-in-out all;
}

#play-button::before {
  content: "";
  position: absolute;
  top: 9%;
  bottom: 8.75%;
  right: -4%;
  left: -4%;
  background: inherit;
  border-radius: 5% / 50%;
}

#play-button:hover:not(.zoomed) {
  cursor: pointer;
}

.zoomed {
  transform: scale(50) !important;
}

#play-button svg {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) scale(10);
  border: none;
  outline: none;
}
</style>

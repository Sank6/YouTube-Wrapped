<template>
  <div id="error" ref="error">
    <h2>{{ name }} 😢</h2>
    <p>{{ message }}</p>
    <button onclick="window.location.reload()">Go back</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Error',
  props: {
    name: String,
    message: String,
  },
  methods: {
    show() {
      const error = this.$refs.error as HTMLElement;
      error.style.display = 'block';
      setTimeout(() => {
        error.style.transform = 'translate(0, 0)';
      }, 100);
    },
  },
});
</script>

<style scoped>
#error {
  display: none;
  width: 700px;
  height: 375px;
  position: absolute;
  top: 0;
  transform: translate(0, 100vw);
  margin: 0;
  border: 0;
  background-color: #ff0000;
  color: #ffffff;
  transition: transform 400ms ease, display 0s;
}

h2 {
  margin-top: 100px;
  font-weight: 300;
}

p {
  margin: 30px 0;
}
</style>

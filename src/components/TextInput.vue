<template>
  <input
    ref="input"
    type="text"
    :placeholder="prompt"
    v-model="value"
    @input="$emit('input', $event.target.value)"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TextInput',
  props: {
    prompt: String,
  },
  data() {
    return {
      value: '',
    };
  },
  methods: {
    flash() {
      const input = this.$refs.input as HTMLElement;
      input.style.borderColor = '#ff0000';
      input.style.transform = 'scale(1.1)';
      setTimeout(() => {
        input.style.borderColor = '#212121';
        input.style.transform = 'scale(1)';
      }, 400);
    },
  },
});
</script>

<style scoped>
input {
  width: 370px;
  display: block;
  font-size: 1em;
  padding: 15px 10px;
  margin: 10px;
  border: 3px solid #212121;
  outline: none;
  border-radius: 5px;
  transition: 400ms ease-in-out all;
}

input:hover,
input:focus {
  transform: scale(1.1);
}
</style>

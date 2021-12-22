<template>
  <div>
    <button id="filebtn" @click="openFile">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="#FFF"
      >
        <path fill="none" d="M0 0h24v24H0z" />
        <path
          d="M3 21a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2H20a1 1 0 0 1 1
      1v3h-2V7h-7.414l-2-2H4v11.998L5.5 11h17l-2.31 9.243a1 1 0 0
      1-.97.757H3zm16.938-8H7.062l-1.5 6h12.876l1.5-6z"
        />
      </svg>
      Load watch history
    </button>
    <input id="file" ref="file" type="file" @change="load" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FileInput',
  props: {
    apikey: String,
  },
  methods: {
    openFile() {
      if (this.apikey === '') {
        this.$emit('empty');
      } else {
        const { file } = this.$refs as Record<string, HTMLElement>;
        file.click();
      }
    },
    load(event: Event) {
      const { files } = event.target as HTMLInputElement;
      if (files !== null && files.length > 0) {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const { result } = e.target as FileReader;
          if (result) this.$emit('load', String(result));
        };
        reader.readAsText(file);
      }
    },
  },
});
</script>

<style>
#file {
  visibility: hidden;
}

#filebtn svg {
  vertical-align: middle;
  margin-right: 5px;
}

button {
  width: 300px;
  content: "Load Watch History";
  display: block;
  width: 370px;
  font-size: 1em;
  padding: 15px 10px;
  position: absolute;
  left: 50%;
  transform: translate(-50%, 0);
  background: #212121;
  border: 3px solid #212121;
  color: #ffffff;
  outline: none;
  border-radius: 5px;
  box-sizing: unset;
  transition: 300ms ease-in-out all;
}

button:hover {
  cursor: pointer;
  transform: translate(-50%, 0) scale(1.1);
}
</style>

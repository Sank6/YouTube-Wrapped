<template>
    <div id="stats" ref="stats">
      <div id="minutes" ref="minutes">
        <h2>
          You have watched
          <span class="stats-number">{{ videosWatchedDisplay }}</span>
          videos in {{ year }} 🎉
        </h2>
        <h3>
          That's <span>{{ minutes }}</span> minutes of YouTube!
        </h3>
        <button @click="topChannels">View your top channels 👉</button>
      </div>
      <div id="channels" ref="channels">
        <h2>
          Your Top Channels
        </h2>
        <div class="channels">
          <table>
            <thead>
              <tr>
                <th>Channel</th>
                <th>Videos</th>
                <th>Minutes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(channel, index) in mostWatched" v-bind:key="index">
                <td>
                  <a :href="channel.url" target="_blank">
                    {{ channel.name }}
                  </a>
                </td>
                <td>{{ channel.videos }}</td>
                <td>{{ channel.minutes }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button>Share 🔗</button>
      </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Stats',
  props: {
    year: Number,
    videosWatched: Number,
    secondsWatched: Number,
    mostWatched: Array,
  },
  data() {
    return {
      videosWatchedDisplay: 0,
      minutes: 0,
    };
  },
  methods: {
    show() {
      const stats = this.$refs.stats as HTMLElement;
      stats.style.display = 'block';
      setTimeout(() => {
        stats.style.transform = 'translate(0, 0)';
      }, 100);
    },
    topChannels() {
      const minutes = this.$refs.minutes as HTMLElement;
      const channels = this.$refs.channels as HTMLElement;
      minutes.style.transform = 'translate(0, 0) scale(0.7)';
      minutes.style.opacity = '0';
      setTimeout(() => {
        minutes.style.display = 'none';
        setTimeout(() => {
          channels.style.transition = 'transform 400ms ease';
          channels.style.transform = 'translate(0, 0)';
        }, 200);
      }, 200);
    },
  },
  mounted() {
    setInterval(() => {
      if (this.secondsWatched && this.videosWatched) {
        const newMin = Math.floor(this.secondsWatched / 60);
        if (newMin > this.minutes) this.minutes += Math.ceil((newMin - this.minutes) / 50);
        if (this.videosWatched > this.videosWatchedDisplay) {
          this.videosWatchedDisplay += Math.ceil(
            (this.videosWatched - this.videosWatchedDisplay) / 100,
          );
        }
      }
    }, 1);
  },
});
</script>

<style scoped>
#stats {
  display: none;
  width: 700px;
  height: 375px;
  position: absolute;
  top: 0;
  transform: translate(0, 100vh) scale(1);
  margin: 0;
  border: 0;
  background-color: #212121;
  color: #ffffff;
  opacity: 1;
  transition: transform 400ms ease;
}

#minutes {
  transition: transform 400ms ease, opacity 400ms ease;
  transform: translate(0, 0);
}

#channels {
  transition: transform 400ms ease;
  transform: translate(100vw, 0);
}

a {
  color: #ffffff;
}

h2 {
  margin-top: 100px;
  font-weight: 300;
}

#channels h2 {
  margin-top: 20px !important;
}

h3 {
  font-weight: 300;
  margin: 30px 0;
}

span {
  font-weight: 600;
  color: #ff0000;
}

button {
  background-color: #ffffff;
  color: #212121;
}

table {
  border-collapse: collapse;
  width: 70%;
  margin: auto auto 20px auto;
}

table td, table th {
  padding: 8px;
}

table tr:nth-child(odd) {
  background-color: #2c2c2c;
}

table tr:nth-child(even) {
  background-color: #2f2f2f;
}

table tr:hover {
  background-color: #313131;
}

table th {
  padding-top: 12px;
  padding-bottom: 12px;
  background-color: #ff0000;
}
</style>

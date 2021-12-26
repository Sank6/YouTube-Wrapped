s<template>
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
        <p class="small">Top tags:
          <span id="tags" v-for="(tag, i) in mostTags.map(({tag, count}) => tag)" v-bind:key="i">
            <span class="tag">{{ tag }}</span>
          </span>
        </p>
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
        <button @click="genImage">Download 🔗</button>
      </div>
      <div id="hidden">
        <canvas id="canvas" ref="canvas" width="500" height="500"></canvas>
      </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Canvas, resolveImage } = require('canvas-constructor');

export default defineComponent({
  name: 'Stats',
  props: {
    year: Number,
    videosWatched: Number,
    secondsWatched: Number,
    mostWatched: Array,
    mostTags: Array,
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
    async genImage() {
      const canvas = document.getElementById('canvas');
      const icon = await resolveImage('./icon.png'); // https://via.placeholder.com/50x50
      const tagsToPrint = (this.mostTags as {tag: string; count: number;}[]).map(({ tag }) => tag).join(', ');
      let drawing = new Canvas(canvas)
        .setColor('#212121')
        .printRectangle(0, 0, 500, 500)
        .printImage(icon, 25, 25, 75, 75)
        .setColor('#6f6f6f')
        .setTextFont('20px Verdana')
        .printText(`${this.year} Wrapped`, 125, 70)
        .setColor('#ff0000')
        .printRoundedRectangle(295, 60, 200, 5, 5)
        .setColor('#ffffff')
        .printText('Minutes Watched', 25, 150)
        .printText('Videos Watched', 25, 250)
        .printText('Top tags', 25, 350)
        .setTextFont('bold 25px Verdana')
        .printText('Top Channels', 230, 150)
        .setColor('#ff0000')
        .setTextFont('bold 40px Verdana')
        .printText(this.minutes.toLocaleString(), 25, 210)
        .printText((this.videosWatched as number).toLocaleString(), 25, 310)
        .setColor('#6f6f6f')
        .setTextAlign('center')
        .setTextFont('14px Verdana')
        .printText('Sank6/YouTube-Wrapped', 250, 480)
        .setTextAlign('left')
        .printWrappedText(tagsToPrint, 25, 380, 200)
        .setTextFont('16px Verdana');
      if (this.mostWatched) {
        for (let i = 0; i < this.mostWatched.length; i += 1) {
          const channel = this.mostWatched[i] as {
            name: string;
            url: string;
            videos: number;
            minutes: number;
          };
          drawing = drawing
            .setColor('#ffffff')
            .printText(channel.name, 230, 200 + i * 50)
            .setColor('#4f4f4f')
            .printText(`${channel.videos} videos, ${channel.minutes} minutes`, 230, 220 + i * 50);
        }
      }
      const url = drawing.toDataURL('image/png');
      this.download(url, 'youtube-wrapped.png');
    },
    download(uri: string, name: string) {
      const link = document.createElement('a');
      link.download = name;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  },
  mounted() {
    setInterval(() => {
      if (this.secondsWatched && this.videosWatched) {
        const newMin = Math.floor(this.secondsWatched / 60);
        if (newMin > this.minutes) this.minutes += Math.ceil((newMin - this.minutes) / 50);
        if (this.videosWatched > this.videosWatchedDisplay) {
          this.videosWatchedDisplay += Math.ceil(
            (this.videosWatched - this.videosWatchedDisplay) / 50,
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

span:not(:last-child):after {
    content: ", ";
    color: white;
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

#hidden {
  display: none;
}
</style>

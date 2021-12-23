<template>
  <div id="container">
    <div id="content" ref="content">
      <TextInput id="apikey" ref="key" prompt="Google API Key" @input="loadkey" />
      <FileInputButton ref="button" :apikey="apikey" @empty="flashkey" @load="getInfo" />
      <a
        ref="help"
        href="https://github.com/Sank6/YouTube-Wrapped/wiki"
        target="_blank"
        >help?</a
      >
      <FillingUp ref="water" :colour="colour" />
      <Stats ref="stats" id="stats" v-bind="stats" />
      <ErrorComponent ref="error" v-bind="error" />
    </div>
  </div>
</template>

<script lang="ts">
import axios, { AxiosResponse } from 'axios';
import { defineComponent } from 'vue';
import TextInput from './TextInput.vue';
import FileInputButton from './FileInputButton.vue';
import FillingUp from './FillingUp.vue';
import Stats from './Stats.vue';
import ErrorComponent from './Error.vue';

interface IEntry {
  header: string;
  title: string;
  titleUrl: string;
  subtitles: [{ name: string; url: string }];
  time: string;
  products: string[];
  activityControls: string[];
}

export default defineComponent({
  name: 'Load',
  data() {
    return {
      zoom: false,
      apikey: '',
      colour: '#212121',
      stats: {
        year: new Date().getFullYear(),
        videosWatched: 0,
        secondsWatched: 0,
        mostWatched: [] as unknown[],
        mostTags: [] as { tag: string; count: number;}[],
      },
      error: {
        name: '',
        message: '',
      },
    };
  },
  components: {
    TextInput,
    FileInputButton,
    FillingUp,
    Stats,
    ErrorComponent,
  },
  methods: {
    load() {
      const content = this.$refs.content as HTMLElement;
      setTimeout(() => {
        content.style.transform = 'translate(-50%, -50%) scale(1)';
      }, 100);
    },
    play() {
      this.zoom = true;
    },
    loadkey(key: string | InputEvent) {
      if (typeof key === 'string') {
        this.apikey = key;
      }
    },
    flashkey() {
      const key = this.$refs.key as typeof TextInput;
      key.flash();
    },
    getDuration(duration: string): number {
      const time = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
      if (time) {
        const hours = parseInt(time[1], 10) || 0;
        const minutes = parseInt(time[2], 10) || 0;
        const seconds = parseInt(time[3], 10) || 0;
        return hours * 3600 + minutes * 60 + seconds;
      }
      return 0;
    },
    async getInfo(stringData: string, json: boolean) {
      try {
        const beginningOfYear = new Date(new Date().getFullYear(), 0, 1);
        const urls: string[] = [];

        if (json) {
          const entries: Array<IEntry> = JSON.parse(stringData).filter((entry: IEntry) => {
            const date = new Date(entry.time);
            return date > beginningOfYear;
          });
          const chunks = entries.reduce((acc, entry, index) => {
            const chunkIndex = Math.floor(index / 50);
            if (!acc[chunkIndex]) acc[chunkIndex] = [];
            acc[chunkIndex].push(entry);
            return acc;
          }, [] as Array<IEntry[]>);
          for (const chunk of chunks) {
            const entryIDs = chunk.map((content) => content.titleUrl?.split('=')[1]);
            const url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${entryIDs.join(
              encodeURIComponent(','),
            )}&key=${this.apikey}`;
            urls.push(url);
          }
        } else {
          const regexp = /<a href="https:\/\/www\.youtube\.com\/watch\?v=(.+?)".+?<\/a><br>.+?<\/a><br>(.+?GMT)<\/div>/g;
          let matches: [string, Date][] = [...stringData.matchAll(regexp)]
            .map((match) => [match[1], new Date(match[2])]);
          matches = matches.filter(([, date]) => date >= beginningOfYear);
          const chunks = matches.reduce((acc, entry, index) => {
            const chunkIndex = Math.floor(index / 50);
            if (!acc[chunkIndex]) acc[chunkIndex] = [];
            acc[chunkIndex].push(entry);
            return acc;
          }, [] as Array<[string, Date][]>);
          for (const chunk of chunks) {
            const entryIDs = chunk.map((content) => content[0]);
            const url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${entryIDs.join(
              encodeURIComponent(','),
            )}&key=${this.apikey}`;
            urls.push(url);
          }
        }

        const urlChunks = urls.reduce((acc, url, index) => {
          const chunkIndex = Math.floor(index / 20);
          if (!acc[chunkIndex]) acc[chunkIndex] = [];
          acc[chunkIndex].push(url);
          return acc;
        }, [] as string[][]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let responses: AxiosResponse<any, any>[] = [];
        let index = 0;
        for (const urlChunk of urlChunks) {
          const temp = await Promise.all(
            urlChunk.map((url) => axios.get(url, { responseType: 'json' })),
          );
          responses = responses.concat(temp);
          index += 1;
          const water = this.$refs.water as typeof FillingUp;
          water.fill(Math.floor((index / urlChunks.length) * 100) + 5);
        }

        const channels: { [key: string]: [number, number, string] } = {}; // { channel: [videos, seconds, url] }
        const tags: { [key: string]: number } = {}; // { tag: videos }
        for (const response of responses) {
          const {
            data: { items },
          } = response;
          for (const item of items) {
            if (item.kind === 'youtube#video') this.stats.videosWatched += 1;
            if (item.snippet.tags) {
              for (const tag of item.snippet.tags) {
                if (!Object.prototype.hasOwnProperty.call(tags, tag)) tags[tag] = 1;
                tags[tag] += 1;
              }
            }
            const duration = this.getDuration(item.contentDetails.duration);
            this.stats.secondsWatched += duration;

            if (Object.hasOwnProperty.call(channels, item.snippet.channelTitle)) {
              channels[item.snippet.channelTitle][0] += 1;
              channels[item.snippet.channelTitle][1] += duration;
            } else channels[item.snippet.channelTitle] = [1, duration, `https://www.youtube.com/channel/${item.snippet.channelId}`];
          }
        }

        if (this.stats.videosWatched === 0) throw new Error('Invalid watch-history.json. No videos found.');

        let mostWatched = Object.entries(channels).sort((a, b) => b[1][0] - a[1][0]);
        mostWatched = mostWatched.slice(0, 5);
        console.log(Object.entries(tags));// , Object.entries(tags).sort((a, b) => b[1] - a[1]));
        let mostTags = Object.entries(tags)
          .sort((a, b) => b[1] - a[1])
          .map(([tag, count]) => ({ tag, count }));
        mostTags = mostTags.slice(0, 5);
        const changed = mostWatched.map(([channel, [videosWatchedInChannel, seconds, url]]) => ({
          name: channel,
          videos: videosWatchedInChannel,
          minutes: Math.floor(seconds / 60),
          url,
        }));
        this.stats.mostWatched = changed;
        this.stats.mostTags = mostTags;
        const { key, button, help, water, content } = this.$refs as {
          key: typeof TextInput;
          button: typeof FileInputButton;
          help: HTMLElement;
          water: typeof FillingUp;
          content: HTMLElement;
        };
        key.$el.style.display = 'none';
        button.$el.style.display = 'none';
        help.style.display = 'none';
        water.$el.style.display = 'none';
        content.style.background = '#212121';
        document.body.style.background = '#212121';
        const stats = this.$refs.stats as typeof Stats;
        stats.show();
      } catch (error) {
        const water = this.$refs.water as typeof FillingUp;
        this.colour = '#FF0000';
        water.fill(105);
        let { name } = error as Error;
        const { message } = error as Error; // 😠 eslint yourself
        if (message === 'Request failed with status code 400') name = 'Invalid API key';
        if (message === 'Request failed with status code 403') name = 'Rate limit exceeded';
        if (message === 'Request failed with status code 404') name = 'Invalid watch-history.json';
        if (message === 'Request failed with status code 500') name = 'Internal server error';
        this.error = { name, message };
        setTimeout(() => {
          const e = this.$refs.error as typeof ErrorComponent;
          e.show();
        }, 400);
      }
    },
  },
});
</script>

<style scoped>
#content {
  width: 700px;
  height: 375px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) scale(0);
  margin: 0;
  border: 0;
  transition: transform 500ms ease;
  background-color: #ffffff;
}

#apikey {
  margin: 100px auto 20px auto;
}

a {
  color: #212121;
  display: block;
  margin-top: 50px;
}
</style>

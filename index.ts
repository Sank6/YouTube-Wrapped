import { promises as fs } from "fs";
import { join } from "path";
import axios from "axios";
import boxen from "boxen";
import prompts from "prompts";
import table from "table";
import * as progress from "cli-progress";

interface IEntry {
  header: string;
  title: string;
  titleUrl: string;
  subtitles: [{ name: string, url: string }];
  time: string;
  products: string[];
  activityControls: string[];
}

function getDuration(duration: string): number {
  let time = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (time) {
    let hours = parseInt(time[1]) || 0;
    let minutes = parseInt(time[2]) || 0;
    let seconds = parseInt(time[3]) || 0;
    return hours * 3600 + minutes * 60 + seconds;;
  } else return 0;
}

(async () => {
  const response = await prompts({
    type: "text",
    name: "apikey",
    message: "Enter your API key:",
  });
  const API_KEY = response.apikey;

  // read file watch-history.json
  fs.readFile(join(process.cwd(), "watch-history.json"), "utf8")
    .then(async (watchHistory) => {
      const beginningOfYear = new Date(new Date().getFullYear(), 0, 1);

      // Filter videos watched to the beginning of the year
      let entries: Array<IEntry> = JSON.parse(watchHistory);
      entries = entries.filter((entry) => {
        const date = new Date(entry.time);
        return date > beginningOfYear;
      });

      // Group into chunks (for API requests)
      const chunks = entries.reduce((acc, entry, index) => {
        const chunkIndex = Math.floor(index / 50);
        if (!acc[chunkIndex]) acc[chunkIndex] = [];
        acc[chunkIndex].push(entry);
        return acc;
      }, [] as Array<IEntry[]>);

      let urls: string[] = [];
      for (const chunk of chunks) {
        let entryIDs = chunk.map(({ titleUrl }) => titleUrl?.split("=")[1]);
        let url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${entryIDs.join(
          encodeURIComponent(",")
        )}&key=${API_KEY}`;
        urls.push(url);
      }

      // chunk urls
      const urlChunks = urls.reduce((acc, url, index) => {
        const chunkIndex = Math.floor(index / 20);
        if (!acc[chunkIndex]) acc[chunkIndex] = [];
        acc[chunkIndex].push(url);
        return acc;
      }, [] as string[][]);

      
      const bar = new progress.Bar(
        { clearOnComplete: true },
        progress.Presets.shades_classic
      );
      let index = 0;
      let responses: any[] = [];
      for (const urlChunk of urlChunks) {
        let temp = await Promise.all(urlChunk.map((url) => axios.get(url, { responseType: "json" })));
        responses = responses.concat(temp);
        if (index == 0) bar.start(urlChunks.length - 1, 0);
        else bar.update(index);
        index++;
      }
      

      let totalTime = 0;
      let videos = 0;
      let channels: { [key: string]: number[] } = {}; // { channel: [videosWatched, secondsWatched] }
      for (let response of responses) {
        let { data: { items } } = response;

        // Updates

        for (const item of items) {
          if (item.kind == "youtube#video") videos++;
          else console.log(item.kind);

          let duration = getDuration(item.contentDetails.duration);
          totalTime += duration;

          if (Object.hasOwnProperty.call(channels, item.snippet.channelTitle)) {
            channels[item.snippet.channelTitle][0]++;
            channels[item.snippet.channelTitle][1] += duration;
          } else channels[item.snippet.channelTitle] = [1, duration];
        }
      }
      bar.stop();
      
      let mostWatched = Object.entries(channels).sort((a, b) => b[1][0] - a[1][0]);
      let mostWatchedChannels = mostWatched.slice(0, 5);
      let i = 1;
      let headers: string[][] = [["Channel Name", "Videos Watched", "Minutes Watched"]];
      let data = headers.concat(mostWatchedChannels.map(([channel, [videos, seconds]]) => [`${i++}. \u001b[4m\u001b[1m${channel}\u001b[0m`, String(videos), String(Math.floor(seconds / 60))]));
      let mostWatchedChannelsTable = table.table(data, {});

      // Format output
      let output = "";
      output += `✨ You have watched \u001b[1m\u001b[36m${videos} YouTube videos\u001b[0m in ${new Date().getFullYear()}.\n`;
      output += `🤯 That's \u001b[1m\u001b[31;1m${Math.floor(totalTime / 60)} minutes\u001b[0m!\n`;
      output += `📺 Your most watched channels were:\n`;
      output += mostWatchedChannelsTable;
      
      console.log(boxen(output, { padding: 2, borderColor: "red", borderStyle: "round", title: "Youtube Wrapped", titleAlignment: "center" }));
    })
    .catch((err: Error) => {
      if (err.message == "Request failed with status code 400") console.log("🚫 Invalid API key");
      else if (err.message.includes("ENOENT")) console.log("🚫 Make sure you have a \u001b[4mwatch-history.json\u001b[0m file in this folder");
      else console.error(err);
    });
})();

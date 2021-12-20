import { promises as fs } from "fs";
import path from "path";
import axios from "axios";
import progress from "cli-progress";

// You can replace this if you want
const API_KEY = "AIzaSyCH3sV_U3fQwkITnPBxKqkcLzCZbaN1D74";

interface IEntry {
  header: string;
  title: string;
  titleUrl: string;
  subtitles: [name: string, url: string];
  time: string;
  products: string[];
  activityControls: string[];
}

// read file watch-history.json
fs.readFile(path.join(__dirname, "watch-history.json"), "utf8")
  .then(async (watchHistory) => {
    const beginningOfYear = new Date(new Date().getFullYear(), 0, 1);

    let entries: Array<IEntry> = JSON.parse(watchHistory);
    entries = entries.filter((entry) => {
      const date = new Date(entry.time);
      return date > beginningOfYear;
    });
    // chunk entries into groups of 20
    const chunks = entries.reduce((acc, entry, index) => {
      const chunkIndex = Math.floor(index / 50);
      if (!acc[chunkIndex]) acc[chunkIndex] = [];
      acc[chunkIndex].push(entry);
      return acc;
    }, [] as Array<IEntry[]>);

    let totalTime = 0;
    const bar = new progress.Bar({ clearOnComplete: true }, progress.Presets.shades_classic);
    bar.start(chunks.length-1, 0);
    let index = 0;
    for (const chunk of chunks) {
      let entryIDs = chunk.map(({ titleUrl }) => titleUrl?.split("=")[1]);
      let url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${entryIDs.join(
        encodeURIComponent(",")
      )}&key=${API_KEY}`;
      bar.update(index);
      index++;
      let {
        data: { items },
      } = await axios.get(url, { responseType: "json" });
      items.forEach((item: any) => {
        let duration = item.contentDetails.duration;
        let time = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        if (time) {
          let hours = parseInt(time[1]) || 0;
          let minutes = parseInt(time[2]) || 0;
          let seconds = parseInt(time[3]) || 0;
          totalTime += hours * 3600 + minutes * 60 + seconds;
        }
      });
    }
    bar.stop();
    let minutes = Math.floor(totalTime / 60);
    

    console.log(`✨ You have watched \u001b[1m\u001b[36m${entries.length} YouTube videos\u001b[0m in ${new Date().getFullYear()}.\n🤯 That's \u001b[1m\u001b[31;1m${minutes} minutes\u001b[0m!`);
  })
  .catch((err) => {
    console.error(err);
    console.error(
      "Make sure you have a watch-history.json file in the same folder as this script."
    );
  });

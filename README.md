# Youtube Wrapped
Spotify Wrapped but for youtube. (Because Rewind sucked).

# Running from source
1. Clone the repository:
```bash
git clone git@github.com:Sank6/Youtube-Wrapped.git
```
2. Install the dependencies:
```bash
cd Youtube-Wrapped
npm install
```

3. Request your data from Google using [Google Takeout](https://takeout.google.com/).

4. From your takeout, go to `YouTube and YouTube Music/history` and paste the `watch-history.json` file in this folder.

5. Run the script:
```bash
npm run start
```

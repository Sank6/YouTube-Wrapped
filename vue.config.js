module.exports = {
  pages: {
    index: {
      entry: 'src/home/main.ts',
      template: 'public/index.html',
      title: 'YouTube Wrapped',
      chunks: ['chunk-vendors', 'chunk-common', 'index'],
    },
    load: {
      entry: 'src/load/main.ts',
      template: 'public/index.html',
      title: 'YouTube Wrapped',
      chunks: ['chunk-vendors', 'chunk-common', 'load'],
    },
  },
};

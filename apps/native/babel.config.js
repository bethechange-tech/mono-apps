module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
          root: ['./'],
          alias: {
            '@': './src',
            '@/navigation': './src/navigation',
            '@assets': './assets',
            '@/app': './src/app',
          }
        }
      ],
      'react-native-reanimated/plugin'
    ]
  };
};
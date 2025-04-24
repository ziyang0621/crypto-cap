const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // 添加SVG支持
  config.module.rules.push({
    test: /\.svg$/,
    use: ['@svgr/webpack', 'url-loader'],
  });

  // 添加图像和其他资产的支持
  config.module.rules.push({
    test: /\.(gif|jpe?g|png|ttf|woff|woff2|eot)$/,
    use: {
      loader: 'file-loader',
      options: {
        name: '[name].[ext]',
      },
    },
  });

  // 解决Victory组件的问题
  config.resolve.alias = {
    ...config.resolve.alias,
    'victory-native': 'victory',
    'react-native-svg': 'react-native-svg-web',
  };

  return config;
};

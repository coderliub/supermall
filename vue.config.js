module.exports = {
  lintOnSave: false, // 关闭eslint校验
    configureWebpack: {
      resolve: {
        alias: {
          'assets': '@/assets',
          'common': '@/common',
          'components': '@/components',
          'network': '@/network',
          'views': '@/views',

        }
      }
    }
}


const webpack = require('webpack')
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
    transpileDependencies: true,
    configureWebpack: {
        plugins: [
            new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer']
            })
        ],
        resolve: {
            fallback: {
                crypto: false,
                fs: false,
                http: false,
                assert: false,
                process: false,
                util: false,
                url:false,
                path: false,
                stream: false,
                "zlib": false,
                "https" : false
            }
        }
    }
})

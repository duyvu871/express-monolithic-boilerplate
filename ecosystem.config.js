module.exports = {
    apps: [
        {
            name: 'app',
            script: 'set PORT=3000&&start:product&&worker:product',
            watch: '.',
            env: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
            },
        },
    ],
}
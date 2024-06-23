module.exports = {
    apps: [
        {
            name: 'app',
            script: 'set PORT=3000&&npm run start',
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
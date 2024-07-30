module.exports = {
    apps: [
        {
            name: 'connected-brain',
            script: 'NODE_ENV=production PORT=3001 npm run start:all',
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
module.exports = {
    apps: [
        {
            name: 'connected-brain',
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
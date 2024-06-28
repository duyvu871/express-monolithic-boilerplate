import path from 'path';

const AppConfig = {
    app_port: process.env.PORT || 3000,
    app_host: process.env.HOST || 'localhost',
    app_env: process.env.NODE_ENV || 'development',
    app_root: path.resolve(__dirname, '../../'),
    app_secret: process.env.APP_SECRET || 'secret',
    path: {
        public: path.resolve(__dirname, '../../public'),
    },
    api: {
        prefix: '/api/v1',
        test: '/test',
        api_test: '/api/v1/test',
    },
    app_info: {
        name: 'Sync youtube playlist to spotify playlist',
        version: '1.0.0',
        description: 'develop by Express API Boilerplate',
    },
    env: {

    }
}

export default AppConfig;
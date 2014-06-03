var app_config = {
    nodejs_runtime: {
        uid: 502,
        gid: 20
    },
    mongodb_uri: 'mongodb://localhost/focustaobao',

    mongodb_options: {
        server: {
            socketOptions: {
                keepAlive: 1
            },
            poolSize: 20
        },
        user: 'root',
        pwd: ''
    },

    session_config: {
        cookie_secret: 'XhatkhkbmnvRUtvxt677jmZbxre012MVDqss71',
        mongo_uri: 'mongodb://localhost/sessions'
    },

    cookie_config: {
        maxAge: 10 * 60 * 1000
    },

    taobao_api: {
//        app_key: "21769413",
        app_key: "21585630",
//        app_secret: "d8c1e2aaf8eea8a7729f8a29d51dffad"
        app_secret: "bd3c64cd44a648594f85f2417673dbef"
    },

    memcache_cfg: {
        host: "127.0.0.1:11222",
        option: {
            maxKeySize: 500,
            maxExpiration: 60 * 60 * 24,
            maxValue: 1024 * 1024,
            poolSize: 10,
            reconnect: 60 * 1000 * 30,
            timeout: 2000,
            retries: 2,
            retry: 5000,
            idle: 3000
        }
    }
}

module.exports = app_config;
var path = require('path');

var rootPath = path.normalize(__dirname + '/..');

module.exports = {
    development: {
        db: 'mongodb://localhost/taobaofocus_dev',
        root: rootPath,
        taobao:{
//            app_key: "21769413",
            app_key: "21585630",
//        app_secret: "d8c1e2aaf8eea8a7729f8a29d51dffad"
            app_secret: "bd3c64cd44a648594f85f2417673dbef"
        },
        security:{
          runtime:{
              uid: 502,
              gid: 20
          }
        },
        session: {
            secret: 'XhatkhkbmnvRUtvxt677jmZbxre012MVDqss71',
            store: {
                db: 'focustaobao',
                host: "localhost",
                port: 6379,
                ttl: 60 * 10
            }
        },
        mongoose: {
            options: {
                server: {
                    socketOptions: {
                        keepAlive: 1
                    },
                    poolSize: 20
                },
                user: 'root',
                pwd: ''
            }
        },
        memcached: {
            server: "127.0.0.1:11222",
            config: {
                "maxKeySize": 500,
                "maxExpiration": 60 * 60 * 24,
                "maxValue": 1024 * 1024,
                "poolSize": 10,
                "reconnect": 60 * 1000 * 30,
                "timeout": 2000,
                "retries": 2,
                "retry": 5000,
                "idle": 3000
            }
        },
        redis: {

        },
        app: {
            name: 'taobaofocus'
        },
        facebook: {
            clientID: "APP_ID",
            clientSecret: "APP_SECRET",
            callbackURL: "http://localhost:3000/auth/facebook/callback"
        },
        twitter: {
            clientID: "CONSUMER_KEY",
            clientSecret: "CONSUMER_SECRET",
            callbackURL: "http://localhost:3000/auth/twitter/callback"
        },
        github: {
            clientID: 'APP_ID',
            clientSecret: 'APP_SECRET',
            callbackURL: 'http://localhost:3000/auth/github/callback'
        },
        google: {
            clientID: "APP_ID",
            clientSecret: "APP_SECRET",
            callbackURL: "http://localhost:3000/auth/google/callback"
        },
        linkedin: {
            clientID: "CONSUMER_KEY",
            clientSecret: "CONSUMER_SECRET",
            callbackURL: "http://localhost:3000/auth/linkedin/callback"
        }
    },
    test: {
        db: 'mongodb://localhost/tabaofocus_test',
        root: rootPath,
        app: {
            name: 'Nodejs Express Mongoose Demo'
        },
        facebook: {
            clientID: "APP_ID",
            clientSecret: "APP_SECRET",
            callbackURL: "http://localhost:3000/auth/facebook/callback"
        },
        twitter: {
            clientID: "CONSUMER_KEY",
            clientSecret: "CONSUMER_SECRET",
            callbackURL: "http://localhost:3000/auth/twitter/callback"
        },
        github: {
            clientID: 'APP_ID',
            clientSecret: 'APP_SECRET',
            callbackURL: 'http://localhost:3000/auth/github/callback'
        },
        google: {
            clientID: "APP_ID",
            clientSecret: "APP_SECRET",
            callbackURL: "http://localhost:3000/auth/google/callback"
        },
        linkedin: {
            clientID: "CONSUMER_KEY",
            clientSecret: "CONSUMER_SECRET",
            callbackURL: "http://localhost:3000/auth/linkedin/callback"
        }
    },
    production: {
    }
}

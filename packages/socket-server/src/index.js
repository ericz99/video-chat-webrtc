import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';

import config from './config';

(async () => {
    const app = express();
    app.use(cors());

    if (process.env.NODE_ENV !== 'development') {
        // # set static path
        app.use(
            express.static(path.join(__dirname, '..', '..', '/web', '/build'))
        );

        // # set index.html
        app.get('*', (req, res) => {
            return res.sendFile(
                path.join(__dirname, '..', '..', '/web', '/build', 'index.html')
            );
        });
    }

    // # create server
    const server = http
        .createServer(app)
        .listen(
            config.PORT,
            console.log(`Server is listening on port ${config.PORT}`)
        );

    // # get all loaders
    await require('./loaders').default(server);
})();

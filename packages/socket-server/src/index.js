import express from 'express';
import http from 'http';
import cors from 'cors';

import config from './config';

(async () => {
    const app = express();
    app.use(cors());

    app.get('/', (req, res) => {
        res.send('ok');
    });

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

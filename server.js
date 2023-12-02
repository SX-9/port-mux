const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const whitelist_port = process.env.WHITELIST_PORT?.split(',') || [];
const whitelist_host = process.env.WHITELIST_HOST?.split(',') || [];
const port = 3000;
const defaultHost = process.env.DEFAULT_HOST || 'localhost';

app.setMaxListeners(Infinity);
app.set('trust proxy', true);
let last = {
    port: 80,
    host: defaultHost,
    prot: 'http',
};
app.use('/', (req, res) => {
    console.log(`> Input ${req.ip} ${req.method} ${req.url}`);

    const referer = new URL(req.headers.referer || 'http://localhost:80');
    const refererParams = new URLSearchParams(referer.search);
    const port = req.query.port || refererParams.get('port') || last.port;
    const host = req.query.host || refererParams.get('host') || last.host;
    const prot = req.query.prot || refererParams.get('prot') || last.prot;
    const target = `${prot}://${host}:${port}`;
    last = {port,host,prot};

    debugger
    if (whitelist_port.length > 0 && !whitelist_port.includes(port.toString())) {
        console.log("> Forbidden", port);
        res.status(403).send('Forbidden');
        return;
    }
    if (whitelist_host.length > 0 && !whitelist_host.includes(host)) {
        console.log("> Forbidden", host);
        res.status(403).send('Forbidden');
        return;
    }

    const proxy = createProxyMiddleware({
        logLevel: 'silent',
        target,
        changeOrigin: true,
        ws: true,
    });
    proxy(req, res);
    console.log("> Output", target);
});

app.listen(port, () => {
    console.log(`OK ${port}`);
});

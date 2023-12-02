const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const whitelist_port = process.env.WHITELIST_PORT?.split(',') || [];
const whitelist_host = process.env.WHITELIST_HOST?.split(',') || [];
const port = process.env.PORT || 3000;
const defaultHost = process.env.DEFAULT_HOST || 'localhost';

console.log(`+++ Whitelisted Ports ${whitelist_port}`);
console.log(`+++ Whitelisted Hosts ${whitelist_host}`);
console.log(`+++ Default Host ${defaultHost}`);

app.setMaxListeners(Infinity);
app.set('trust proxy', true);
let last = {
    port: 80,
    host: defaultHost,
    prot: 'http',
};
app.use('/', (req, res) => {
    if ('dash' in req.query) return res.sendFile("dashboard.html", { root: __dirname });
    console.log(`>>> ${req.ip} ${req.method} ${req.url}`);

    const referer = new URL(req.headers.referer || 'http://localhost:80');
    const refererParams = new URLSearchParams(referer.search);
    const port = req.query.port || refererParams.get('port') || last.port;
    const host = req.query.host || refererParams.get('host') || last.host;
    const prot = req.query.prot || refererParams.get('prot') || last.prot;
    const target = `${prot}://${host}:${port}`;
    last = {port,host,prot};

    debugger
    if (whitelist_port.length > 0 && !whitelist_port.includes(port.toString())) {
        console.log("XXX Forbidden Port", port);
        res.status(403).send('Forbidden');
        return;
    }
    if (whitelist_host.length > 0 && !whitelist_host.includes(host)) {
        console.log("XXX Forbidden Host", host);
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
    console.log("<<< ", target);
});

app.listen(port, () => {
    console.log(`=== Started On Port ${port}`);
});

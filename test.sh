export PORT=4090
export DEFAULT_HOST="192.168.1.42"
export WHITELIST_HOST="192.168.1.42,100.65.134.31"
export WHITELIST_PORT="80,8500"
node --inspect --trace-warnings server.js 2>/dev/null

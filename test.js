const http = require("http");
const hostname = "localhost";
const port = "3001";
const server = http.createServer((req, res) =>{
    res.statusCode = 200;
    res.setHeader("Content-type", "text/plain");
    return res.end("Hello World");
});

server.listen(port, hostname, () => {
    console.log("Server started on port " + port);
});
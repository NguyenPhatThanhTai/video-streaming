const express = require("express");
const app = express();
const fs = require("fs");
var request = require('request');

app.get("/", function(req, res) {
    res.send("Running");
});

app.get("/video", function(req, res) {
    // var fileUrl = 'https://ia601402.us.archive.org/35/items/KSCNMD-S2-09-720/Kobayashi-san%20Chi%20no%20Maid%20Dragon%20S2%20-%2009.720.ia.mp4';
    var fileUrl = req.query.url;

    var range = req.headers.range;
    var positions, start, end, total, chunksize;

    // HEAD request for file metadata
    request({
        url: fileUrl,
        method: 'HEAD'
    }, function(error, response, body) {
        setResponseHeaders(response.headers);
        pipeToResponse();
    });

    function setResponseHeaders(headers) {
        positions = range.replace(/bytes=/, "").split("-");
        start = parseInt(positions[0], 10);
        total = headers['content-length'];
        end = positions[1] ? parseInt(positions[1], 10) : total - 1;
        chunksize = end - start + 1;

        res.writeHead(206, {
            "Content-Range": "bytes " + start + "-" + end + "/" + total,
            "Accept-Ranges": "bytes",
            "Content-Length": chunksize,
            "Content-Type": "video/mp4"
        });
    }

    function pipeToResponse() {
        var options = {
            url: fileUrl,
            headers: {
                range: "bytes=" + start + "-" + end,
                connection: 'keep-alive'
            }
        };

        request(options).pipe(res);
    }
});

app.listen(process.env.PORT || 8000, function() {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
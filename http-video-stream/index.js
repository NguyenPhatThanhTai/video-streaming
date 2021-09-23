const express = require("express");
const app = express();
const fs = require("fs");
var request = require('request');

app.get("/", function(req, res) {
    res.send("Running");
});

app.get("/video", function(req, res) {
    // // Ensure there is a range given for the video
    // const range = req.headers.range;
    // if (!range) {
    //     res.status(400).send("Requires Range header");
    // }

    // // get video stats (about 61MB)
    // const videoPath = "http://ia800300.us.archive.org/1/items/night_of_the_living_dead/night_of_the_living_dead_512kb.mp4";
    // const videoSize = fs.statSync("http://ia800300.us.archive.org/1/items/night_of_the_living_dead/night_of_the_living_dead_512kb.mp4").size;

    // // Parse Range
    // // Example: "bytes=32324-"
    // const CHUNK_SIZE = 10 ** 6; // 1MB
    // const start = Number(range.replace(/\D/g, ""));
    // const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // // Create headers
    // const contentLength = end - start + 1;
    // const headers = {
    //     "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    //     "Accept-Ranges": "bytes",
    //     "Content-Length": contentLength,
    //     "Content-Type": "video/mp4",
    // };

    // // HTTP Status 206 for Partial Content
    // res.writeHead(206, headers);

    // // create video read stream for this particular chunk
    // const videoStream = fs.createReadStream(videoPath, { start, end });

    // // Stream the video chunk to the client
    // videoStream.pipe(res);

    var fileUrl = 'https://ia601402.us.archive.org/35/items/KSCNMD-S2-09-720/Kobayashi-san%20Chi%20no%20Maid%20Dragon%20S2%20-%2009.720.ia.mp4';

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
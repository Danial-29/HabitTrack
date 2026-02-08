import fs from 'fs';
import https from 'https';

const url = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzIxN2FjYjMwODAxYjQ0YThiZTI3ZDEwMmRmZjE2YjhmEgsSBxDl8-GYrggYAZIBIwoKcHJvamVjdF9pZBIVQhMzNjIxMzU2MjU1MTg2OTA2Njgz&filename=&opi=96797242";
const file = fs.createWriteStream("temp_stitch_design.html");

https.get(url, function (response) {
    response.pipe(file);
    file.on('finish', function () {
        file.close(() => console.log("Download completed."));
    });
}).on('error', function (err) {
    fs.unlink("temp_stitch_design.html");
    console.error("Error downloading file:", err.message);
});

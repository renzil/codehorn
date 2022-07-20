const { exec } = require('child_process');
const fs = require('fs');

fs.mkdirSync('public');

const testFolder = 'src/partials/';
const files = fs.readdirSync(testFolder).map(file => testFolder + file);
const partials = files.reduce((prev, current, index) => prev + `${index === 0 ? '' : ' '}-p ` + current, "");

console.log("partials", partials);

const callback = (err, stdout, stderr) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(stdout);
}
exec(`node_modules/.bin/mustache ${partials} src/data.json src/index.mustache public/index.html `, callback);
exec(`node_modules/.bin/mustache src/data.json src/404.mustache public/404.html `, callback);
exec(`node_modules/.bin/tailwind -i src/main.css -o public/bundle.css`, callback);
exec(`node_modules/.bin/rollup -c`, callback);
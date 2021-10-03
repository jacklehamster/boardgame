const express 	= require('express');
const serve   	= require('express-static');
const fs 		= require('fs');
const colors 	= require('colors');
const url 		= require('url');
const path 		= require('path');
const archiver 	= require('archiver');

const PORT = 3000;
 
const app = express();
 
app.get('/', (req, res, next) => {
	res.writeHead(200, {'Content-Type': 'text/html'});

	const queryObject = url.parse(req.url,true).query;
	const isRelease = "release" in queryObject;

	Promise.all([
		fs.promises.readFile(`${__dirname}/public/index.html`),
	]).then(([html]) => {
		res.write(html);
		res.end();
	}).then(() => zipPublic("public", "game.zip"))
	.then(() => {
		const NwBuilder = require('nw-builder');
		const nw = new NwBuilder({
		    files: './public/**/**', // use the glob format
		    platforms: isRelease ? ['win', 'osx64', 'linux'] : [ 'osx64' ],
		    flavor: "normal",
//			    macIcns: "",
		});

		nw.on('log',  console.log);

		nw.build().then(function () {
		   console.log('all done!');
		}).catch(function (error) {
		    console.error(error);
		});
//			echo `sudo codesign --force --deep --verbose --sign "Vincent Le Quang" Eva.app`;
	});
});

app.use(serve(`${__dirname}/public`));

function tabToSpaces(string) {
	return string.split("\t").join("    ");
}

function listFiles(root, path) {
	return fs.promises.readdir(`${root}${path}`).then(files => {
		return Promise.all(files.map(filename => {
			if (fs.lstatSync(`${root}${path}/${filename}`).isDirectory()) {
				return listFiles(root, `${path}/${filename}`).then(result => {
					return {
						[filename] : result,
					};
				});
			} else {
				return filename;
			}

			// return fs.lstatSync(`${root}${path}/${filename}`).isDirectory()
			// 	? listFiles(root, `${path}/${filename}`)
			// 	: `${path}/${filename}`;
		}))
	});
}

function zipPublic(source, out) {
	const archive = archiver('zip', { zlib: { level: 9 }});
	const stream = fs.createWriteStream(out);

	return new Promise((resolve, reject) => {
		archive
		  .directory(source, false)
		  .on('error', err => reject(err))
		  .pipe(stream);

		stream.on('close', () => resolve());
		archive.finalize();
	});
}


const server = app.listen(PORT, () => {
	console.log('Server is running at %s', colors.green(server.address().port));
});

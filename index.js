const
// Modules
GIFEncoder = require('gifencoder'),
{ createCanvas, loadImage } = require('canvas'),
fs = require('fs'),
path = require('path'),
sizeOf = require('image-size'),
{ ExifImage } = require('exif');
cliProgress = require('cli-progress');
    // Methods
    readdir = dir => new Promise((resolve, reject) => fs.readdir(dir, (err, files) => err ? reject(err) : resolve(files))),
    readFile = filePath => new Promise((resolve, reject) => fs.readFile(filePath, (err, data) => err ? reject(err) : resolve(data))),
    getExif = filePath => new Promise((resolve, reject) => new ExifImage({ image: filePath }, (err, data) => err ? reject(err) : resolve(data))),
    imgDate = async filePath => new Date((await getExif(filePath)).exif.DateTimeOriginal.replace(':', '-').replace(':', '-')),
    // Constants
    maxSeparation = 5000,
    dir = './img';

readdir(dir)
    .then(files => files.map(file => path.join(dir, file)))
    .then(files => Promise.all(files.map(async image => ({ image, date: await imgDate(image) }))))
    .then(images => {
        const
            gifs = [],
            currFrames = [];

        for (let i = 0; i < images.length; i++) {
            const
                image = images[i],
                nextImage = images[i + 1];
            currFrames.push(image);
            if (!nextImage || nextImage.date - image.date > maxSeparation) {
                gifs.push(createGif(currFrames.map(image => image.image), `${image.date.getTime()}.gif`))
                currFrames.length = 0;
            }
        }
        return Promise.all(gifs);
    })
    .catch(console.error);

async function createGif(images = [], name = 'test.gif', delay = 200, width = 1280, height = 720) {
    const
        bar = new cliProgress.SingleBar({
            format: `${name} |{bar}| {percentage}% || Frames {value}/{total}`,
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
            hideCursor: true
        }),
        loadedImages = await Promise.all(images.map(async image => ({
            img: await loadImage(image),
            dim: sizeOf(image),
        }))),
        encoder = new GIFEncoder(width, height),
        canvas = createCanvas(width, height),
        ctx = canvas.getContext('2d');

    encoder.createReadStream().pipe(fs.createWriteStream(path.join('output', name)));
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(delay);
    encoder.setQuality(10);
    bar.start(loadedImages.length, 0, { speed: "N/A" });
    for (const { img, dim } of loadedImages) {
        ctx.drawImage(img, 0, 0, dim.width, dim.height, 0, 0, canvas.width, canvas.height);
        encoder.addFrame(ctx);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        bar.increment();
    }
    encoder.finish();
    bar.stop();
}

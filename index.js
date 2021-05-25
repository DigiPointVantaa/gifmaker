const GIFEncoder = require('gifencoder');
const { createCanvas, Canvas, Image } = require('canvas');
const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size')
const { ExifImage } = require('exif')

fs.readdir('./img', (err, files) => {
    if (err) console.error(err);
    else {
        createGif(files);
    }
})

function getImage(path) {
    return new Promise((resolve, reject) => {


        resolve({
            imgPath: path.join('img', image),
            img: new Image,
            dim: sizeOf(imgPath),
            exif:
            new ExifImage({ image: imgPath }, (reject, data) => {})
        })

        img.src = fs.readFileSync(imgPath)
    });
}

function createGif(images = [], name = 'test.gif', width = 320, height = 240) {
    const encoder = new GIFEncoder(width, height);
    // stream the results as they are available into myanimated.gif
    encoder.createReadStream().pipe(fs.createWriteStream(path.join('output', name)));

    encoder.start();
    encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
    encoder.setDelay(500);  // frame delay in ms
    encoder.setQuality(10); // image quality. 10 is default.

    const canvas = createCanvas(320, 240);
    const ctx = canvas.getContext('2d');
    // use node-canvas

    for (const image of images) {
        const
            imgPath = path.join('img', image),
            img = new Image,
            dim = sizeOf(imgPath),
            exif = new ExifImage({ image: imgPath }, console.log)

        img.src = fs.readFileSync(imgPath)
        ctx.drawImage(img, 0, 0, dim.width, dim.height, 0, 0, canvas.width, canvas.height)
        encoder.addFrame(ctx);
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    encoder.finish();
}

import path from 'path';
import fs from 'fs';
import { PNG } from 'pngjs';
import ensureDirectory from '../utils/ensure-directory';


const DEFAULT_THUMBNAIL_WIDTH  = 240;
const DEFAULT_THUMBNAIL_HEIGHT = 130;

function cubicInterpolation (t, t2, t3, f) {
    const C = [
        0 - 1 * t + 2 * t2 - 1 * t3,
        2 + 0 * t - 5 * t2 + 3 * t3,
        0 + 1 * t + 4 * t2 - 3 * t3,
        0 + 0 * t - 1 * t2 + 1 * t3
    ];

    return 0.5 * (C[0] * f[0] + C[1] * f[1] + C[2] * f[2] + C[3] * f[3]);
}

function getSubpixel (img, y, x, channel) {
    if (y >= img.height || x >= img.width || y < 0 || x < 0)
        return 0;

    return img.data[y * img.width * 4 + x * 4 + channel];
}

function setSubpixel (img, y, x, channel, color) {
    if (y >= img.height || x >= img.width || y < 0 || x < 0)
        return;

    if (color > 255)
        color = 255;
    else if (color < 0)
        color = 0;

    img.data[y * img.width * 4 + x * 4 + channel] = color;
}

function scale (src, width, height) {
    var dst = new PNG({ width, height });

    const cx = src.width / width;
    const cy = src.height / height;

    const interpolated = [0, 0, 0, 0];

    for (let i = 0; i < height; ++i) {
        const targetY = cy * i;
        const sourceY = Math.floor(targetY);

        const dy  = targetY - sourceY;
        const dy2 = dy * dy;
        const dy3 = dy2 * dy;

        for (let j = 0; j < width; ++j) {
            const targetX = cx * j;
            const sourceX = Math.floor(targetX);

            const dx  = targetX - sourceX;
            const dx2 = dx * dx;
            const dx3 = dx2 * dx;

            for (let k = 0; k < 3; ++k) {
                for (let ii = 0, interpolY = sourceY - 1; ii < 4; ++ii, ++interpolY) {
                    const pixels = [
                        getSubpixel(src, interpolY, sourceX - 1, k),
                        getSubpixel(src, interpolY, sourceX, k),
                        getSubpixel(src, interpolY, sourceX + 1, k),
                        getSubpixel(src, interpolY, sourceX + 2, k)
                    ];

                    interpolated[ii] = cubicInterpolation(dx, dx2, dx3, pixels);
                }

                setSubpixel(dst, i, j, k, cubicInterpolation(dy, dy2, dy3, interpolated));
            }

            setSubpixel(dst, i, j, 3, 255);
        }
    }

    return dst;
}


function generate (src, dst, width, height) {
    return new Promise(resolve => {
        fs.createReadStream(src)
            .pipe(new PNG())
            .on('parsed', function () {
                const dstImage = scale(this, width, height);

                dstImage.pack().pipe(fs.createWriteStream(dst)).on('end', resolve);
            });
    });
}

function getThumbnailPath (imagePath) {
    var imageName = path.basename(imagePath);
    var imageDir  = path.dirname(imagePath);

    return path.join(imageDir, 'thumbnails', imageName);
}

/**
 * Creates a thumbnail image from the specified PNG image file.
 * @function
 * @async
 * @name generateThumbnail
 * @param {string} sourcePath - Specifies the path to the source image in PNG format.
 * @param {string} thumbnailPath - Specifies the path to the resulting thumbnail image.
 *                                 Defaults to '<sourcePathDirectory>/thumbnails/<sourcePathFileName>'
 * @param {number} width - Specifies the width of the thumbnail image, in pixels (default is 240).
 * @param {number} height - Specifies the height of the thumbnail image, in pixels (default is 130).
 */
export default async function (sourcePath,
                               thumbnailPath = getThumbnailPath(sourcePath),
                               width = DEFAULT_THUMBNAIL_WIDTH,
                               height = DEFAULT_THUMBNAIL_HEIGHT) {
    if (!ensureDirectory(thumbnailPath))
        return;

    await generate(sourcePath, thumbnailPath, width, height);
}

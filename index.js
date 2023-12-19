const express = require('express');
const sharp = require('sharp');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const app = express();
const port = 12901;

// 保存先のディレクトリを作成
const outputDirectory = path.join(__dirname, 'output');
const zipDirectory = path.join(__dirname, 'zip');
fs.mkdirSync(outputDirectory, { recursive: true });
fs.mkdirSync(zipDirectory, { recursive: true });

// Multerの設定
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ルートエンドポイント
app.post('/convert', upload.array('images'), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send('No images uploaded.');
        }

        const convertedImages = [];

        // ファイルが1つの場合
        if (req.files.length === 1) {
            const inputBuffer = req.files[0].buffer;
            const outputBuffer = await sharp(inputBuffer).toFormat('webp').toBuffer();
            res.type("webp")
            res.send(outputBuffer)
            return
        } else {
            // ファイルが複数の場合
            await Promise.all(
                req.files.map(async (file, index) => {
                    const inputBuffer = file.buffer;
                    const outputBuffer = await sharp(inputBuffer).toFormat('webp').toBuffer();
                    convertedImages.push(outputBuffer);
                })
            );
        }

        if (req.files.length > 1) {
            const zip = new AdmZip();
            convertedImages.forEach((image, index) => {
                zip.addFile(`${index + 1}.webp`, image);
            });

            const zipFilePath = path.join(zipDirectory, 'converted_images.zip');
            res.send(await zip.toBufferPromise())
        } else {
            // ファイルが1つの場合は直接ファイルをダウンロード
            res.download(convertedImages[0].path, 'image.webp', (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                }

                // ファイルを削除
                fs.unlinkSync(convertedImages[0].path);
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/pages/index.html")
}).get("/script.js", (req, res) => {
    res.sendFile(__dirname + "/pages/script.js")
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

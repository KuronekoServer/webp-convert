const express = require('express');
const sharp = require('sharp');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const app = express();
const port = 54356;

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
      const outputFilePath = path.join(outputDirectory, 'image.webp');
      fs.writeFileSync(outputFilePath, outputBuffer);
      convertedImages.push({ name: 'image.webp', path: outputFilePath });
    } else {
      // ファイルが複数の場合
      await Promise.all(
        req.files.map(async (file, index) => {
          const inputBuffer = file.buffer;
          const outputBuffer = await sharp(inputBuffer).toFormat('webp').toBuffer();
          const outputFilePath = path.join(outputDirectory, `image_${index}.webp`);
          fs.writeFileSync(outputFilePath, outputBuffer);
          convertedImages.push({ name: `image_${index}.webp`, path: outputFilePath });
        })
      );
    }

    if (req.files.length > 1) {
      const zip = new AdmZip();
      convertedImages.forEach((image) => {
        zip.addFile(image.name, fs.readFileSync(image.path));
      });

      const zipFilePath = path.join(zipDirectory, 'converted_images.zip');
      zip.writeZip(zipFilePath);

      // ダウンロードリンクを提供
      res.download(zipFilePath, 'converted_images.zip', (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Internal Server Error');
        }

        // ファイルを削除
        fs.unlinkSync(zipFilePath);
        convertedImages.forEach((image) => {
          fs.unlinkSync(image.path);
        });
      });
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
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

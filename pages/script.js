const resultDiv = document.getElementById('result');
const imageList = document.getElementById('imageList');
const onsend = async () => {
    const images = document.getElementById('images').files;

    if (images.length <= 0) {
        alert("ファイルを選択してください")
        return
    }

    document.getElementById('images').disabled = true;
    document.getElementById("uploadSubmit").disabled = true;
    document.getElementById("uploadSubmit").textContent = "変換中....";

    const batchFormData = new FormData()
    for (let j = 0; j < images.length; j++) {
        const file = images[j];
        batchFormData.append('images', file);
    }

    const response = await fetch('/convert', {
        method: 'POST',
        body: batchFormData,
    });

    if (response.ok) {
        const link = document.createElement('a');
        if (images.length >= 2) {
            link.download = "converted.zip"
        } else {
            link.download = "converted.webp"
        }
        link.href = URL.createObjectURL(await response.blob());
        link.click();
        URL.revokeObjectURL(link.href)
    } else {
        alert('An error occurred during conversion.');
    }
    document.getElementById('images').disabled = false;
    document.getElementById("uploadSubmit").disabled = false;
    document.getElementById("uploadSubmit").textContent = "WebPに変換する";
};
function displayConvertedImages(images) {
    imageList.innerHTML = '';
    images.forEach((imagePath) => {
        const listItem = document.createElement('li');
        const image = document.createElement('img');
        image.src = imagePath;
        listItem.appendChild(image);
        imageList.appendChild(listItem);
    });
    resultDiv.style.display = 'block';
}
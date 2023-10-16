document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('uploadForm');
  const resultDiv = document.getElementById('result');
  const imageList = document.getElementById('imageList');

  uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(uploadForm);
    const response = await fetch('/convert', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      displayConvertedImages(data.convertedImages);
    } else {
      alert('An error occurred during conversion.');
    }
  });

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
});

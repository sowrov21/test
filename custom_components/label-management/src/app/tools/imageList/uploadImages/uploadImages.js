import { removeNoImagesFoundOnMLModalStyle } from '../../machineLearningModal/views/initiateMachineLearning/style';
import { addSingleImageToList, addImageFromMultiUploadToList, getImageIdByName, removeAllImages } from '../imageList';
import { onImageLoad } from './drawImageOnCanvas';
import { APIClient } from '../../../utils/fetch';
import UploadProgressUI from '../../../utils/uploadProgress';

// potential to undo and validate in the drag and drop logic,
// depending on what is being used for upload datasets
function isFormatValid(imageMetadata) {
  return imageMetadata.type.includes('image/');
}

function canUpload(imageMetadata) {
  return isFormatValid(imageMetadata) && getImageIdByName(imageMetadata.name) === null;
}

function onMultiFileLoad(imageMetadata, isfirstImage, e) {
  const image = new Image();
  image.src = e.target.result;
  if (isfirstImage) {
    image.onload = onImageLoad;
  }
  addImageFromMultiUploadToList(imageMetadata, image, isfirstImage);
  removeNoImagesFoundOnMLModalStyle();
}

function uploadMultipleImages(uploadData) {
  for (let i = 0; i < uploadData.files.length; i += 1) {
    if (canUpload(uploadData.files[i])) {
      const reader = new FileReader();
      const isfirstImage = i === 0;
      reader.onload = onMultiFileLoad.bind(this, uploadData.files[i], isfirstImage);
      reader.readAsDataURL(uploadData.files[i]);
    }
  }
}

function onSingleFileLoad(imageMetadata, e, url = '', imgId = null, taskItemId = null) {
  const image = new Image();
  image.src = e.target.result;
  image.onload = onImageLoad;
  addSingleImageToList(imageMetadata, image, url, imgId, taskItemId);
  removeNoImagesFoundOnMLModalStyle();
}

function uploadSingleImage(uploadData) {
  if (canUpload(uploadData.files[0])) {
    const reader = new FileReader();
    reader.onload = onSingleFileLoad.bind(this, uploadData.files[0]);
    reader.readAsDataURL(uploadData.files[0]);
  }
}

// onerror?
async function uploadImages(uploadData) {
  // await uploadImagesFromBlobUrl();
  if (uploadData.files && uploadData.files.length > 0) {
    if (uploadData.files.length === 1) {
      uploadSingleImage(uploadData);
    } else {
      uploadMultipleImages(uploadData);
    }
  }
}
// ========= blob upload start ===========
function uploadSingleImageFromBlobUrl(uploadFiles, url = '', imgId = null, taskItemId = null) {
  if (canUpload(uploadFiles)) {
    const reader = new FileReader();
    // reader.onload = onSingleFileLoad.bind(this, uploadFiles[0], url, imgId);
    reader.onload = (e) => {
      onSingleFileLoad(uploadFiles, e, url, imgId, taskItemId);
    };
    reader.readAsDataURL(uploadFiles);
  }
}
function onMultiFileLoadFromBlobUrl(imageMetadata, isfirstImage, e, url = '', imgId = null, taskItemId = null) {
  const image = new Image();
  image.src = e.target.result;
  if (isfirstImage) {
    image.onload = onImageLoad;
  }
  addImageFromMultiUploadToList(imageMetadata, image, isfirstImage, url, imgId, taskItemId);
  removeNoImagesFoundOnMLModalStyle();
}
function uploadMultipleImagesFromBlobUrl(uploadFiles) {
  for (let i = 0; i < uploadFiles.length; i += 1) {
    if (canUpload(uploadFiles[i].file)) {
      const reader = new FileReader();
      const isfirstImage = i === 0;
      // reader.onload = onMultiFileLoadFromBlobUrl.bind(this, isfirstImage, uploadFiles[i].file,
      //   uploadFiles[i].url, uploadFiles[i].imageId);
      reader.onload = (e) => {
        onMultiFileLoadFromBlobUrl(
          uploadFiles[i].file,
          isfirstImage,
          e,
          uploadFiles[i].url,
          uploadFiles[i].imageId,
          uploadFiles[i].taskItemId,
        );
      };
      reader.readAsDataURL(uploadFiles[i].file);
    }
  }
}
// async function uploadImagesFromBlobUrl() {
//   try {
//     // const blobUrls = ['https://xpertcapture.blob.core.windows.net/x1111/XpertPredict_Images/1753081700193-Emami-7-in-1-100ml-600x674.jpg',
//     //  'https://xpertcapture.blob.core.windows.net/x1111/ffprofileimage/TSO00099_ZABED_ALI.jpg'];
//     removeAllImages();
//     const token = localStorage.getItem('token');
//     const taskId = localStorage.getItem('taskId');
//     const tid = encodeURIComponent(parseInt(taskId, 10));

//     const data = await APIClient(`tasks/getTaskWithItems/${tid}`, {}, 'POST', token);

//     if (data.status_code === 200 && data.data) {
//       const blobUrls = data.data.task_items.map((item) => item.img_url);
//       const files = await Promise.all(
//         blobUrls.map(async (url, index) => {
//           const response = await fetch(url);
//           const blob = await response.blob();
//           const filename = url.split('/').pop() || `image_${index}.jpg`;
//           return new File([blob], filename, { type: blob.type });
//         }),
//       );

//       if (files.length === 1) {
//         uploadSingleImageFromBlobUrl(files);
//       } else {
//         uploadMultipleImagesFromBlobUrl(files);
//       }
//     } else {
//       console.error('Failed to fetch remote image(s):', data);
//     }
//   } catch (err) {
//     console.error('Error fetching remote image(s):', err);
//   }
// }
async function uploadImagesFromBlobUrl() {
  try {
    removeAllImages();
    const token = localStorage.getItem('token');
    const taskId = localStorage.getItem('taskId');
    const tid = encodeURIComponent(parseInt(taskId, 10));

    const data = await APIClient(`tasks/getTaskWithItems/${tid}`, {}, 'POST', token);

    if (data.status_code === 200 && data.data) {
      localStorage.setItem('client_id', data.data.client_id || '');
      localStorage.setItem('assigned_to', data.data.assigned_to || '');
      const taskItems = data.data.task_items;

      const total = taskItems.length;
      let completed = 0;

      // Fetch blobs and retain metadata (url, id)
      const fetchPromises = taskItems.map(async (item, index) => {
        const response = await fetch(item.img_url);
        const blob = await response.blob();
        const filename = item.img_url.split('/').pop() || `image_${index}.jpg`;

        completed += 1;
        UploadProgressUI.update(completed, total, 'images');

        const file = new File([blob], filename, { type: blob.type });

        return {
          file,
          url: item.img_url,
          imageId: item.img_id, // Use the correct key based on your API
          taskItemId: item.id,
        };
      });

      const filesWithMetadata = await Promise.all(fetchPromises);
      UploadProgressUI.hide();

      if (filesWithMetadata.length === 1) {
        const { file, url, imageId, taskItemId } = filesWithMetadata[0];
        uploadSingleImageFromBlobUrl(file, url, imageId, taskItemId);
      } else {
        uploadMultipleImagesFromBlobUrl(filesWithMetadata);
        // where each item has { file, url, imageId, taskItemId }
      }
    } else {
      console.error('Failed to fetch remote image(s):', data);
    }
  } catch (err) {
    console.error('Error fetching remote image(s):', err);
    UploadProgressUI.show('Upload failed.');
    UploadProgressUI.hide(3000);
  }
}

// ========= blob upload end ===========

// export { uploadImages as default };
export { uploadImages, uploadImagesFromBlobUrl };

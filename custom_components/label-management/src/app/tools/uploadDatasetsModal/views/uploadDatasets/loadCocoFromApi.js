// loadCocoFromApi.js
import { APIClient } from '../../../../utils/fetch';
import Snackbar from '../../../../utils/snackbarHelper';
// import initialiseImageListFunctionality
// from '../../../imageList/init';// './tools/imageList/init';
// import { uploadImagesFromBlobUrl } from '../../../../tools/imageList/uploadImages/uploadImages';
import injectCocoSilently from './injectCocoSilently'; // adjust path as needed
import datasetObjectManager from './datasetObjectManagers/COCOJSONDatasetObjectManager';
import { setFinalObjectAssembler, drawShapesAndImages } from './drawShapesAndImages';
import { IMAGE_FILES_OBJECT, ACTIVE_ANNOTATION_FILE } from '../../consts';
import { updateCurrentImageIdsNew } from '../../../imageList/imageList';
import { setCurrentImageId } from '../../../state';

// import { setFormatState } from '../../state';
// import { initialiseUploadDatasetsModal } from '../viewManager';

function isBoundingBox(segmentation, bbox) {
  if (segmentation.length === 8) {
    const [left, top, width, height] = bbox;
    if (segmentation[0] === left && segmentation[1] === top
      && segmentation[2] === (left + width) && segmentation[3] === top
      && segmentation[4] === (left + width) && segmentation[5] === (top + height)
      && segmentation[6] === left && segmentation[7] === (top + height)) {
      return true;
    }
  }
  return false;
}

function assembleNewFinalShape(annotationData, datasetObject, imageName, shapes) {
  const shapeObj = {
    type: null, coordinates: {}, imageName, annots_id: null,
  };
  shapeObj.annots_id = annotationData.annots_id;
  const { categories } = datasetObject[ACTIVE_ANNOTATION_FILE].body.annotationData;
  for (let i = 0; i < categories.length; i += 1) {
    if (annotationData.category_id === categories[i].id) {
      shapeObj.coordinates.class = categories[i].name.toString();
      break;
    }
  }
  if (isBoundingBox(annotationData.segmentation[0], annotationData.bbox)) {
    shapeObj.coordinates.bbox = annotationData.bbox;
    shapeObj.type = 'boundingBox';
    shapes.boundingBoxes.push(shapeObj);
  } else {
    shapeObj.coordinates.points = annotationData.segmentation[0];
    shapeObj.type = 'polygon';
    shapes.polygons.push(shapeObj);
  }
}

function addShapeToShapesArray(imageId, annotations, shapes, datasetObject, imageName) {
  for (let i = 0; i < annotations.length; i += 1) {
    if (imageId === annotations[i].image_id) {
      assembleNewFinalShape(annotations[i], datasetObject, imageName, shapes);
    }
  }
}
function getShapes(datasetObject, validImages) {
  const shapes = { boundingBoxes: [], polygons: [] };
  const { annotations, images } = datasetObject[ACTIVE_ANNOTATION_FILE].body.annotationData;
  validImages.forEach((validImage) => {
    for (let i = 0; i < images.length; i += 1) {
      const imageName = validImage.body.fileMetaData.name;
      if (imageName === images[i].file_name) {
        addShapeToShapesArray(images[i].id, annotations, shapes, datasetObject, imageName);
      }
    }
  });
  return shapes;
}
function getImages(imageFiles) {
  const images = [];
  Object.keys(imageFiles).forEach((key) => {
    if (!imageFiles[key].error) {
      images.push(imageFiles[key]);
    }
  });
  return images;
}
function assembleFromDatasetManager() {
  const finalObject = { images: [], shapes: [] };
  const datasetObject = datasetObjectManager.getDatasetObject();
  finalObject.images = getImages(datasetObject[IMAGE_FILES_OBJECT]);
  finalObject.shapes = getShapes(datasetObject, finalObject.images);
  return finalObject;
}
async function loadCocoFromApi(opts = {}) {
  const {
    endpoint = '',
    payload = {},
    method = 'POST',
    token = localStorage.getItem('token'),
    annotationFileName = 'remoteTaskCOCO.json',
    fetchImages = true,
  } = opts;

  try {
    const response = await APIClient(endpoint, payload, method, token);
    // console.log('=====: API Response :=======', response);
    // APIClient in your code often returns an object where `response.data` is the body.
    // Some endpoints wrap further into response.data.data — handle common variants:
    let cocoData = null;
    // if (!response || response.data) throw new Error('No response from API');
    if (!response || !response.data) {
      Snackbar.hide();
      localStorage.setItem('opType', 'create');
      return;
    }
    localStorage.setItem('opType', 'edit');

    // variant A: response.data contains the COCO object directly
    if (response.data && (response.data.images || response.data.annotations)) {
      cocoData = response.data;
    } else {
      // nothing matched — try common nested fallback
      cocoData = response.data || null;
    }

    if (!cocoData) {
      throw new Error('COCO dataset not found in API response');
    }
    // Optionally, you may want to validate cocoData.images / annotations presence here.
    // Call injectCocoSilently (which populates IMAGE_FILES_OBJECT and annotation file)
    await injectCocoSilently(cocoData, {
      annotationFileName,
      fetchImages,
    });
    // initialiseUploadDatasetsModal();
    // ✅ Populate imageList.js images[] like local upload does
    /*
    const datasetObject = datasetObjectManager.getDatasetObject();
    const imagesObj = datasetObject[IMAGE_FILES_OBJECT];
    const imageKeys = Object.keys(imagesObj);

    imageKeys.forEach((key, index) => {
      const { fileMetaData, dataUrl } = imagesObj[key].body;
      const imageElement = new Image();
      imageElement.src = dataUrl;
      addImageFromMultiUploadToList(fileMetaData, imageElement, index === 0);
    }); */
    Snackbar.show('Preparing Data to Draw..', 'loading');
    setFinalObjectAssembler(assembleFromDatasetManager);
    // initialiseImageListFunctionality();
    // setFormatState('COCO JSON');
    // updateCurrentImageIdsNew(cocoData.images[0].id);
    // setCurrentImageId(cocoData.images[0].id);
    updateCurrentImageIdsNew(0, 1);
    setCurrentImageId(0);
    Snackbar.show('Drawing..', 'loading');
    await drawShapesAndImages();
    // updateCurrentImageIdsNew(0, 1);
    // setCurrentImageId(0);
    window.switchImage(0);
    Snackbar.show('Finished');
    setTimeout(() => {
      Snackbar.hide();
    }, 200);

    // Return the manager state so the caller can inspect it if needed
    // return datasetObjectManager.getDatasetObject();
  } catch (err) {
    console.error('Failed to load/ inject COCO dataset:', err);
    throw err; // rethrow or return a clean error object depending on your app pattern
  }
}
export default loadCocoFromApi;

import { Toast, Alert } from '../../../utils/toastHelper';
import { APIClient } from '../../../utils/fetch';
import { getImageProperties } from '../../imageList/uploadImages/drawImageOnCanvas';
import { getAllImageData, resetAllImageStatus } from '../../imageList/imageList';
import { getAllExistingShapes } from '../../../canvas/objects/allShapes/allShapes';
import { getLabelOptions } from '../../labelList/labelOptions';
import { getCurrentImageId } from '../../state';
import {
  getRoundingValue,
  roundNumberToDecimalPlaces,
  adjustIncorrectBoundingBoxCoordinates,
  adjustIncorrectPolygonPointCoordinates,
} from '../sharedUtils/adjustShapeCoordinates';
import Snackbar from '../../../utils/snackbarHelper';

const decimalPlaces = 2;

function getJSONFileName() {
  const currentDate = new Date();
  return `visionai-${currentDate.getDay()}-${currentDate.getMonth()}-${currentDate.getFullYear()}.json`;
}

function generateTempDownloadableJSONElement(json) {
  const pom = document.createElement('a');
  const bb = new Blob([JSON.stringify(json)], { type: 'application/json' });
  pom.setAttribute('href', window.URL.createObjectURL(bb));
  pom.setAttribute('download', getJSONFileName());
  pom.dataset.downloadurl = ['application/json', pom.download, pom.href].join(':');
  pom.draggable = true;
  pom.classList.add('dragout');
  return pom;
}

function calculatePolygonArea(coordinatesArg) {
  const coordinates = [...coordinatesArg];
  if (coordinatesArg[0] !== coordinatesArg[coordinatesArg.length - 2]
    || coordinatesArg[1] !== coordinatesArg[coordinatesArg.length - 1]) {
    coordinates.push(coordinates[0]);
    coordinates.push(coordinates[1]);
  }
  let area = 0;
  for (let i = 0; i < coordinates.length - 2; i += 2) {
    area += coordinates[i] * coordinates[i + 3] - coordinates[i + 2] * coordinates[i + 1];
  }
  return area / 2;
}

function parsePolygonProperties(polygon, imageDimensions) {
  const properties = { segmentation: [], bbox: [], area: 0 };
  let minX = 999999999999;
  let minY = 999999999999;
  let maxX = 0;
  let maxY = 0;
  const pointsArray = [];
  polygon.points.forEach((point) => {
    const {
      pointX, pointY,
    } = adjustIncorrectPolygonPointCoordinates(point, imageDimensions, decimalPlaces);
    pointsArray.push(pointX);
    pointsArray.push(pointY);
    if (pointX < minX) { minX = pointX; }
    if (pointY < minY) { minY = pointY; }
    if (pointX > maxX) { maxX = pointX; }
    if (pointY > maxY) { maxY = pointY; }
  });
  properties.segmentation = [pointsArray];
  const roundingValue = getRoundingValue(decimalPlaces);
  const bboxWidth = roundNumberToDecimalPlaces(maxX - minX, roundingValue);
  const bboxHeight = roundNumberToDecimalPlaces(maxY - minY, roundingValue);
  properties.bbox.push(minX);
  properties.bbox.push(minY);
  properties.bbox.push(bboxWidth);
  properties.bbox.push(bboxHeight);
  properties.area = roundNumberToDecimalPlaces(calculatePolygonArea(pointsArray), roundingValue);
  return properties;
}

function parseBoundingBoxProperties(boundingBox, imageDimensions) {
  const properties = { segmentation: [], bbox: [], area: 0 };
  const {
    left, top, width, height,
  } = adjustIncorrectBoundingBoxCoordinates(boundingBox, imageDimensions, decimalPlaces);
  const roundingValue = getRoundingValue(decimalPlaces);
  const rightCoordinate = roundNumberToDecimalPlaces(left + width, roundingValue);
  const bottomCoordinate = roundNumberToDecimalPlaces(top + height, roundingValue);
  const pointsArray = [];
  pointsArray.push(left);
  pointsArray.push(top);
  pointsArray.push(rightCoordinate);
  pointsArray.push(top);
  pointsArray.push(rightCoordinate);
  pointsArray.push(bottomCoordinate);
  pointsArray.push(left);
  pointsArray.push(bottomCoordinate);
  properties.segmentation = [pointsArray];
  properties.bbox.push(left);
  properties.bbox.push(top);
  properties.bbox.push(width);
  properties.bbox.push(height);
  properties.area = roundNumberToDecimalPlaces(width * height, roundingValue);
  return properties;
}

function getCategoryIdByLabelText(categories, text) {
  return categories[text];
}

function parseShapeProperties(shape, imageDimensions) {
  if (shape.shapeName === 'polygon') {
    return parsePolygonProperties(shape, imageDimensions);
  }
  if (shape.shapeName === 'bndBox') {
    return parseBoundingBoxProperties(shape, imageDimensions);
  }
  return { segmentation: [], bbox: [], area: 0 };
}

function parseImageShapeData(shape, imageId, shapeId, imageDimensions, categories) {
  const parsedImageShapeData = {};
  parsedImageShapeData.id = shapeId;
  parsedImageShapeData.image_id = imageId;
  parsedImageShapeData.category_id = getCategoryIdByLabelText(categories, shape.shapeLabelText);
  const shapeProperties = parseShapeProperties(shape, imageDimensions);
  parsedImageShapeData.segmentation = shapeProperties.segmentation;
  parsedImageShapeData.area = shapeProperties.area;
  parsedImageShapeData.bbox = shapeProperties.bbox;
  parsedImageShapeData.isCrowd = 0;
  return parsedImageShapeData;
}
function parseImageShapeDataToSaveInDB(shape, shapeId, image, categories, clientId) {
  const parsedImageShapeData = {};
  parsedImageShapeData.id = (shape.annots_id) ? shape.annots_id : 0;
  // parsedImageShapeData.image_id = imageId;
  parsedImageShapeData.task_items_id = image.taskItemId || null;
  parsedImageShapeData.image_id = image.imgId || null;
  parsedImageShapeData.file_name = image.name || null;
  parsedImageShapeData.img_url = image.url || '';
  // console.log('parseImageShapeDataToSaveInDB', categories);
  parsedImageShapeData.category_id = getCategoryIdByLabelText(categories, shape.shapeLabelText);
  parsedImageShapeData.category_name = shape.shapeLabelText;
  const shapeProperties = parseShapeProperties(shape, image.imageDimensions);
  parsedImageShapeData.segmentation = JSON.stringify(shapeProperties.segmentation);
  parsedImageShapeData.area = shapeProperties.area;
  parsedImageShapeData.bbox = JSON.stringify(shapeProperties.bbox);
  // parsedImageShapeData.isCrowd = 0;
  // parsedImageShapeData.is_labeled = image.isLabeled || false;
  parsedImageShapeData.is_crowd = 0;
  parsedImageShapeData.is_labeled = image.isLabeled ? 1 : 0;
  parsedImageShapeData.task_id = parseInt(localStorage.getItem('taskId'), 10);
  parsedImageShapeData.assigned_to = parseInt(localStorage.getItem('assigned_to'), 10);
  parsedImageShapeData.client_id = clientId;
  parsedImageShapeData.shape_name = shape.shapeName;

  // client_id
  return parsedImageShapeData;
}
// All formats:

// column_name = ['filename', 'width', 'height',
// 'class', 'xmin', 'ymin', 'xmax', 'ymax']
// what happens when there are no shapes in an image

function parseImageData(image, imageId) {
  const parsedImageData = {};
  parsedImageData.id = imageId;
  parsedImageData.width = image.imageDimensions.originalWidth;
  parsedImageData.height = image.imageDimensions.originalHeight;
  parsedImageData.file_name = image.name;
  parsedImageData.license = 1;
  parsedImageData.date_captured = '';
  parsedImageData.blobUrl = image.url || '';
  parsedImageData.dbImgId = image.imgId || null;
  parsedImageData.isLabeled = image.isLabeled || false;
  parsedImageData.taskId = parseInt(localStorage.getItem('taskId'), 10);
  return parsedImageData;
}

function parseLabelData(label, labelId) {
  const parsedLabelData = {};
  parsedLabelData.id = labelId;
  parsedLabelData.name = label.text;
  // parsedLabelData.supercategory = 'none';
  parsedLabelData.supercategory = label.client_id || 'none';
  parsedLabelData.product_id = label.id || 'none';
  return parsedLabelData;
}

function getImageAndAnnotationData(allImageProperties, categoriesObject) {
  const imageAndAnnotationData = { images: [], annotations: [] };
  let imageId = 0;
  let shapeId = 0;
  allImageProperties.forEach((image) => {
    if (image.imageDimensions) {
      imageAndAnnotationData.images.push(parseImageData(image, imageId));
      Object.keys(image.shapes).forEach((key) => {
        const shape = image.shapes[key].shapeRef;
        imageAndAnnotationData.annotations.push(parseImageShapeData(shape, imageId,
          shapeId, image.imageDimensions, categoriesObject));
        shapeId += 1;
      });
      imageId += 1;
    }
  });
  return imageAndAnnotationData;
}
function getImageAndAnnotationDataToSaveInDB(allImageProperties, categoriesObject) {
  const imageAndAnnotationData = { images: [], annotations: [] };
  let imageId = 0;
  let shapeId = 0;
  const clientId = parseInt(localStorage.getItem('client_id'), 10);
  allImageProperties.forEach((image) => {
    // if (image.imageDimensions && image.hasChanged) {
    if (image.hasChanged) {
      imageAndAnnotationData.images.push(parseImageData(image, imageId));
      const shapeKeys = Object.keys(image.shapes || {});
      if (shapeKeys.length > 0) {
        shapeKeys.forEach((key) => {
          const shape = image.shapes[key].shapeRef;
          imageAndAnnotationData.annotations.push(
            parseImageShapeDataToSaveInDB(shape, shapeId, image, categoriesObject, clientId),
          );
          shapeId += 1;
        });
      } else { // no shape
        const parsedImageShapeData = {};
        parsedImageShapeData.id = 0;
        parsedImageShapeData.image_id = image.imgId || null;
        parsedImageShapeData.task_items_id = image.taskItemId || null;
        parsedImageShapeData.file_name = image.name || null;
        parsedImageShapeData.img_url = image.url || '';
        parsedImageShapeData.category_id = 0;
        parsedImageShapeData.category_name = '';
        parsedImageShapeData.segmentation = '';
        parsedImageShapeData.area = 0.0;
        parsedImageShapeData.bbox = '';
        parsedImageShapeData.is_crowd = 0;
        parsedImageShapeData.is_labeled = image.isLabeled ? 1 : 0;
        parsedImageShapeData.task_id = parseInt(localStorage.getItem('taskId'), 10);
        parsedImageShapeData.assigned_to = parseInt(localStorage.getItem('assigned_to'), 10);
        parsedImageShapeData.client_id = clientId;
        parsedImageShapeData.shape_name = '';
        imageAndAnnotationData.annotations.push(parsedImageShapeData);
      }
      imageId += 1;
    }
  });
  return imageAndAnnotationData;
}
async function getCategoriesData() {
  const categoriesData = { categoriesArray: [], categoriesObject: {} };
  const labels = await getLabelOptions();
  let labelId = 0;
  for (let i = labels.length - 1; i >= 0; i -= 1) {
    const label = labels[i];
    categoriesData.categoriesArray.push(parseLabelData(label, labelId));
    categoriesData.categoriesObject[label.text] = labelId;
    labelId += 1;
  }
  return categoriesData;
}
async function getCategoriesDataToSaveInDB() {
  const categoriesData = { categoriesArray: [], categoriesObject: {} };
  const labels = await getLabelOptions();
  // let labelId = 0;
  for (let i = labels.length - 1; i >= 0; i -= 1) {
    const label = labels[i];
    categoriesData.categoriesArray.push(parseLabelData(label, label.id));// labelId));
    categoriesData.categoriesObject[label.text] = label.id;// labelId;
    // labelId += 1;
  }
  return categoriesData;
}

function saveCurrentImageDetails(allImageProperties) {
  const currentlySelectedImageId = getCurrentImageId();
  const currentlySelectedImageProperties = getImageProperties();
  const imageDimensions = {};
  imageDimensions.scaleX = currentlySelectedImageProperties.scaleX;
  imageDimensions.scaleY = currentlySelectedImageProperties.scaleY;
  imageDimensions.originalWidth = currentlySelectedImageProperties.originalWidth;
  imageDimensions.originalHeight = currentlySelectedImageProperties.originalHeight;
  allImageProperties[currentlySelectedImageId].imageDimensions = imageDimensions;
  allImageProperties[currentlySelectedImageId].shapes = getAllExistingShapes();
}

async function downloadCOCOJSON() {
  const marshalledObject = {};
  const allImageProperties = getAllImageData();
  saveCurrentImageDetails(allImageProperties);
  const categoriesData = await getCategoriesData();
  const imageAndAnnotationData = getImageAndAnnotationData(allImageProperties,
    categoriesData.categoriesObject);
  marshalledObject.images = imageAndAnnotationData.images;
  marshalledObject.annotations = imageAndAnnotationData.annotations;
  marshalledObject.licenses = [{ id: 1, name: 'Unknown', url: '' }];
  marshalledObject.categories = categoriesData.categoriesArray;
  const downloadableElement = generateTempDownloadableJSONElement(marshalledObject);
  downloadableElement.click();
}
async function saveCOCOJSONToDB() {
  // const marshalledObject = {};
  Snackbar.show('Preparing files for save...', 'loading');
  const allImageProperties = getAllImageData();
  saveCurrentImageDetails(allImageProperties);
  const categoriesData = await getCategoriesDataToSaveInDB();
  const imageAndAnnotationData = getImageAndAnnotationDataToSaveInDB(allImageProperties,
    categoriesData.categoriesObject);
  // marshalledObject.images = imageAndAnnotationData.images;
  // marshalledObject.annotations = imageAndAnnotationData.annotations;
  // marshalledObject.licenses = [{ id: 1, name: 'Unknown', url: '' }];
  // marshalledObject.categories = categoriesData.categoriesArray;
  // const downloadableElement = generateTempDownloadableJSONElement(marshalledObject);
  // downloadableElement.click();
  if (imageAndAnnotationData.annotations && imageAndAnnotationData.annotations.length === 0) {
    Toast.fire({ icon: 'warning', title: 'No Changes found' });
    Snackbar.hide();
    return;
  }
  const token = localStorage.getItem('token');
  // const taskId = localStorage.getItem('taskId');
  Snackbar.show('Saving your files...', 'loading');
  const response = await APIClient('image_annotations/upsertMany', imageAndAnnotationData.annotations, 'POST', token);
  if (!response.success) {
    Alert.error(response.data || 'Unexpected server error.');
    // console.log(response.message);
    // console.log(response.data);
  } else if (response.success) {
    resetAllImageStatus();
    Toast.fire({ icon: 'success', title: response.message || 'Success' });
    // console.log(response.message);
  }
  Snackbar.hide();
}
function getTaggedItemIds(allImageProperties) {
  const annotationTaskItemsIds = [];
  allImageProperties.forEach((image) => {
    const shapeKeys = Object.keys(image.shapes || {});
    if (shapeKeys.length > 0) {
      annotationTaskItemsIds.push(image.taskItemId);
    }
  });
  return annotationTaskItemsIds;
}
async function approveAnnotationToDB() {
  // get all tagged task ids
  // then send to api to update
  const allImageProperties = getAllImageData();
  saveCurrentImageDetails(allImageProperties);
  const taskItemIds = getTaggedItemIds(allImageProperties) || [];
  if (taskItemIds.length === 0) {
    Toast.fire({ icon: 'info', title: 'No Images are Labelled' });
    return;
  }
  const token = localStorage.getItem('token');
  const payload = {
    task_ids: taskItemIds,
    action: 'approve',
  };
  Snackbar.show('Please wait. Approving...', 'loading');
  const response = await APIClient('tasks/manageTaskVerification', payload, 'POST', token);
  if (!response.success) {
    Alert.error(response.data || 'Unexpected server error.');
    Snackbar.hide();
  } else if (response.success) {
    resetAllImageStatus();
    Toast.fire({ icon: 'success', title: response.message || 'Success' });
    Snackbar.hide();
  }
}
// export { downloadCOCOJSON as default };
export { downloadCOCOJSON, saveCOCOJSONToDB, approveAnnotationToDB };

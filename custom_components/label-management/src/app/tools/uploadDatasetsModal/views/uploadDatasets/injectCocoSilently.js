// injectCocoSilently.js
import datasetObjectManager from './datasetObjectManagers/COCOJSONDatasetObjectManager';

async function injectCocoSilently(cocoData, opts = {}) {
  const annotationFileName = opts.annotationFileName || 'inMemoryCOCO.json';
  const fetchImages = opts.fetchImages !== false; // default true
  const concurrentFetch = opts.concurrentFetch || 6;

  // helper: convert blob -> dataURL
  function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  // helper: fetch single image and produce { dataUrl, type, size } or fallback { dataUrl: null }
  async function fetchImage(url) {
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) throw new Error(`fetch failed ${res.status}`);
      const blob = await res.blob();
      const dataUrl = await blobToDataURL(blob);
      return { dataUrl, type: blob.type || 'image/jpeg', size: blob.size, blob };
    } catch (err) {
      // fetch failed (CORS, network...). Return null dataUrl so we use remote URL fallback.
      return { dataUrl: null, type: null, size: 0, blob: null, error: err };
    }
  }

  // throttle fetches to avoid spamming
  async function fetchImagesThrottled(images, concurrency) {
    const results = [];
    const queue = images.slice(); // copy
    const workers = Array(Math.min(concurrency, images.length)).fill(null).map(async () => {
      while (queue.length) {
        const img = queue.shift();
        /* eslint-disable no-await-in-loop */
        const res = await fetchImage(img.blobUrl || img.img_url);
        results.push({ img, res });
      }
    });
    await Promise.all(workers);
    return results;
  }

  // 1) Prepare images
  const imagesArr = (cocoData.images || []).map((i) => ({ ...i }));
  let fetchedResults = [];
  if (fetchImages && imagesArr.length > 0) {
    fetchedResults = await fetchImagesThrottled(imagesArr, concurrentFetch);
  } else {
    // mark as no-fetch: create placeholder results
    fetchedResults = imagesArr.map((img) => ({ img, res: { dataUrl: null } }));
  }

  // 2) Add each image into datasetObjectManager as imageFileObj
  /* eslint-disable no-restricted-syntax */
  for (const { img, res } of fetchedResults) {
    const fileMeta = {
      name: img.file_name,
      type: res.type || 'image/jpeg',
      size: res.size || 0,
    };

    // The shape matches what builder expects: body.fileMetaData
    const imageFileObj = {
      body: {
        fileMetaData: fileMeta,
        fileFormat: 'image',
        // prefer dataUrl if available; otherwise use the blobUrl (remote URL)
        dataUrl: res.dataUrl || img.blobUrl || img.img_url || null,
        blobUrl: img.blobUrl || img.img_url || null,
        originalImageRecord: img,
      },
      // builder.addImageFile will copy these flags into the stored datasetObject entry
      error: false,
      alreadyUploaded: true,
    };

    const errorObject = { error: false, alreadyUploaded: true };

    // addImageFile populates datasetObject[IMAGE_FILES_OBJECT][fileName] = imageFileObj
    datasetObjectManager.addImageFile(imageFileObj, errorObject);
  }

  // 3) Add annotation file object (no UI flags like newlyActive/newlyAdded to minimize UI activity)
  const annotationFileMeta = {
    name: annotationFileName,
    type: 'application/json',
    size: JSON.stringify(cocoData).length,
  };

  // Transform parsed COCO data into the required annotationData format
  const annotationData = {
    images: (cocoData.images || []).map((img, index) => ({
      id: index,
      file_name: img.file_name,
      license: 1,
      date_captured: '',
      blobUrl: img.blobUrl || null,
      dbImgId: img.id,
      isLabeled: img.isLabeled,
      taskId: img.taskId,
    })),

    annotations: (cocoData.annotations || []).map((ann, index) => ({
      id: index,
      annots_id: ann.id,
      image_id: (cocoData.images || []).findIndex((img) => img.id === ann.image_id),
      category_id: ann.category_id,
      category_name: ann.category_name,
      segmentation: JSON.parse(ann.segmentation),
      area: parseFloat(ann.area),
      bbox: JSON.parse(ann.bbox),
      isCrowd: ann.is_crowd,
      db_img_id: ann.image_id,
      img_url: ann.img_url,
      is_labeled: Boolean(ann.is_labeled),
      task_id: ann.task_id,
    })),

    licenses: [
      {
        id: 1,
        name: 'Unknown',
        url: '',
      },
    ],

    categories: (cocoData.categories || []).map((cat) => ({
      id: cat.id,
      name: cat.name,
      supercategory: cat.supercategory,
      product_id: cat.id,
    })),
  };

  const annotationFileObj = {
    body: {
      fileMetaData: annotationFileMeta,
      fileFormat: 'annotation',
      parsedObject: annotationData,
      annotationData,
      images: annotationData.images,
      annotations: annotationData.annotations,
      categories: annotationData.categories,
      raw: JSON.stringify(annotationData),
      originalAnnotationRecord: cocoData,
    },
  };

  datasetObjectManager.addAnnotationFile(annotationFileObj, false);

  // 4) return the whole datasetObject for inspection
  return datasetObjectManager.getDatasetObject();
}
export default injectCocoSilently;

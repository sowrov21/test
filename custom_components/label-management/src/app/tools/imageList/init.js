import { initialiseImageList } from './imageList';
import initialiseImageListButtonClickEvents from './panelButtons/buttonClickEvents';
import initialiseImageListButtonHoverEvents from './panelButtons/buttonHoverEvents';
import { uploadImagesFromBlobUrl } from './uploadImages/uploadImages';

async function initialiseImageListFunctionality() {
  initialiseImageList();
  initialiseImageListButtonClickEvents();
  initialiseImageListButtonHoverEvents();
  await uploadImagesFromBlobUrl(); // new add by sowrov on 29 July 2025
}

export { initialiseImageListFunctionality as default };

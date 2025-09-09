import { jwtDecode } from 'jwt-decode';
import loadCocoFromApi from './tools/uploadDatasetsModal/views/uploadDatasets/loadCocoFromApi';
import initialiseShapeManipulationDeltas from './canvas/objects/deltaValueSetters/initialiseShapeManipulationDeltas';
import assignPassiveEventListeners from './tools/passiveEventListeners/passiveEventListeners';
import { initialisePulseAnimationCancelling } from './tools/utils/buttons/pulseAnimation';
import { initialiseImageSwitchPanelFunctionality } from './tools/imageSwitchPanel/style';
import { initialiseCoreButtonPopovers } from './tools/globalStyling/buttons/popovers';
import initialiseRemoveImagesModal from './tools/imageList/removeImages/modal/init';
import initialiseBrowserExitHandler from './tools/browserExit/browserExitHandler';
import initialiseDragAndDropFunctionality from './tools/dragAndDrop/dragAndDrop';
import { initialiseWindowDimService } from './tools/dimWindow/dimWindowService';
import initialiseExportDatasetsPopup from './tools/exportDatasetsPopup/init';
import registerWindowMouseEvents from './keyEvents/mouse/registerEvents';
import initialiseImageListFunctionality from './tools/imageList/init';
import initialiseLabelListFunctionality from './tools/labelList/init';
import { initialiseSettingsPopup } from './tools/settingsPopup/init';
import initialiseLabellerModal from './tools/labellerModal/buttons';
import { registerHotKeys } from './keyEvents/keyboard/hotKeys';
import initialiseWelcomeModal from './tools/welcomeModal/init';
import { applyStyling } from './tools/globalStyling/style';
import initialiseToolkit from './tools/toolkit/init';
import { findUserOS } from './tools/OS/OSManager';
import { constructCanvas } from './canvas/canvas';
import initialiseText from './tools/text/init';
// import initLabelDropdownList from './custom/dropdown';
import StreamlitUtil from './utils/streamlitUtil';
import Snackbar from './utils/snackbarHelper';
// import { setTasksChangeState } from './tools/state';

findUserOS();
applyStyling();
constructCanvas();
registerHotKeys();
initialiseText();
initialiseToolkit();
initialiseLabellerModal();
initialiseSettingsPopup();
registerWindowMouseEvents();
initialiseWindowDimService();
initialiseCoreButtonPopovers();
initialiseExportDatasetsPopup();
assignPassiveEventListeners();
initialiseRemoveImagesModal();
// initialiseImageListFunctionality();
// initialiseLabelListFunctionality();
initialiseDragAndDropFunctionality();
initialiseImageSwitchPanelFunctionality();
initialisePulseAnimationCancelling();
initialiseShapeManipulationDeltas();
initialiseBrowserExitHandler();
// initialiseWelcomeModal();
window.Snackbar = Snackbar;
// initLabelDropdownList();
let oldTaskId;
StreamlitUtil.init({
  onData: (props) => {
    // const data = props?.data || {};
    const data = (props && props.data) || {};
    if (data.token) {
      localStorage.setItem('token', data.token);
      const decoded = jwtDecode(data.token);
      const expired = (decoded && decoded.exp) ? decoded.exp : 0;
      localStorage.setItem('expired', expired.toString());
      localStorage.setItem(
        'last_request',
        Math.floor(Date.now() / 1000).toString(),
      );
      localStorage.setItem('rf_token', data.rf_token);
      // localStorage.setItem('current_user', JSON.stringify(data.cu));
      const cuObj = {
        _un: data.un,
        _eml: data.eml,
        _fn: data.fn,
        _mob: data.mob,
        _ut: data.ut,
      };
      // const cObj = encryptData(cuObj);
      localStorage.setItem('_cu', JSON.stringify(cuObj));
      // localStorage.setItem('current_user', data.cu);
      localStorage.setItem('taskId', JSON.stringify(data.taskId));
      const curUT = data.ut;
      const allowedUserTypes = [0, 1, 2];
      if (allowedUserTypes.includes(curUT)) {
        // Show the approve button
        document.getElementById('title-approve-btn-container').style.display = 'flex';
      } else {
        // Hide the approve button
        document.getElementById('title-approve-btn-container').style.display = 'none';
      }
      const taskid = JSON.stringify(data.taskId);
      if (oldTaskId !== taskid) {
        // hide welcome animation
        const welcomeAnimElm = document.getElementById('welcome-modal-contour-animation-parent');
        welcomeAnimElm.style.display = 'none';
        Snackbar.show('Loading Images...', 'loading');
        initialiseImageListFunctionality();
        localStorage.setItem('labelOptions', '');
        Snackbar.show('Loading Categories...', 'loading');
        initialiseLabelListFunctionality();
        setTimeout(async () => {
          try {
            Snackbar.show('Fetching Annotation...', 'loading');
            await loadCocoFromApi({
              endpoint: `image_annotations/getImageAnnotationsByTask/${taskid}`,
              payload: {},
              method: 'POST',
              fetchImages: true,
              annotationFileName: 'task.json',
            });
            welcomeAnimElm.style.display = 'inline-block';
            initialiseWelcomeModal();
            // setInitLoadState('ready');
          } catch (err) {
            console.error('Failed to load COCO dataset:', err);
            // TODO:: Show toast or other error handling
            Snackbar.hide();
          }
        }, 300);
      }
      oldTaskId = taskid;
    }
    // console.log('Received args from Python:', props);
  },
  onReady: () => {
    // console.log('Streamlit component is ready!');
    // Optionally send initial data or state to Python
  },
});
document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line no-unused-vars
  document.getElementById('title-github-mark-container').addEventListener('click', (e) => {
    StreamlitUtil.send({
      status: 'OK',
      message: 'go_to_tasks_list',
      data: {
        action: 'back',
      },
    });
  });
});

import { selectDatasetExportFormat, exportDatasets, closeexportDatasetsPopup, saveData, approveAnnotation } from './buttonEventHandlers';
import { displayExportPopupInformationPopover, removeExportPopupInformationPopover } from './style';

function assignExportDatasetsPopupButtonEventHandlers() {
  window.selectExportDatasetsFormat = selectDatasetExportFormat;
  window.exportDataset = exportDatasets;
  window.cancelexportDatasets = closeexportDatasetsPopup;
  window.displayExportPopupInformationPopover = displayExportPopupInformationPopover;
  window.removeExportPopupInformationPopover = removeExportPopupInformationPopover;
  window.saveData = saveData;
  window.approveAnnotation = approveAnnotation;
}

export { assignExportDatasetsPopupButtonEventHandlers as default };

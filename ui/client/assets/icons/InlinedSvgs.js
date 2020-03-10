//TODO put all svg's in one place, in code or in assets

import buttonLayout from "!raw-loader!../../assets/img/buttons/new/layout.svg"
import buttonRedo from "!raw-loader!../../assets/img/buttons/new/redo.svg"
import settingsIcon from "!raw-loader!../../assets/img/buttons/new/properties.svg"
import businessViewInactive from "!raw-loader!../../assets/img/buttons/new/business.svg"
import resetGui from "!raw-loader!../../assets/img/buttons/new/resetgui.svg"
import zoomIn from "!raw-loader!../../assets/img/buttons/new/zoom-in.svg"
import zoomOut from "!raw-loader!../../assets/img/buttons/new/zoom-out.svg"
import buttonUndo from "!raw-loader!../../assets/img/buttons/new/undo.svg"
import buttonCancel from "!raw-loader!../../assets/img/buttons/new/stop.svg"
import buttonDeploy from "!raw-loader!../../assets/img/buttons/new/deploy.svg"
import buttonMetrics from "!raw-loader!../../assets/img/buttons/new/metrics.svg"
import buttonUngroup from "!raw-loader!../../assets/img/buttons/new/ungroup.svg"
import buttonGroupCancel from "!raw-loader!../../assets/img/buttons/new/group-cancel.svg"
import buttonGroupFinish from "!raw-loader!../../assets/img/buttons/new/group-finish.svg"
import buttonGroupStart from "!raw-loader!../../assets/img/buttons/new/group-start.svg"
import buttonImport from "!raw-loader!../../assets/img/buttons/new/import.svg"
import buttonExport from "!raw-loader!../../assets/img/buttons/new/JSON.svg"
import buttonMigrate from "!raw-loader!../../assets/img/buttons/new/migrate.svg"
import pdf from "!raw-loader!../../assets/img/buttons/new/PDF.svg"
import buttonSave from "!raw-loader!../../assets/img/buttons/new/save.svg"
import buttonFromFile from "!raw-loader!../../assets/img/buttons/new/from-file.svg"
import buttonHide from "!raw-loader!../../assets/img/buttons/new/hide.svg"

const InlinedSvgs = {
  buttonDownload: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 20 20\"> <defs> <style>.a { fill: #999; } .b { fill: none; } </style> </defs>  <g> <path class=\"a\" d=\"M14.92,16.15H5.08V18h9.85ZM11.23,2H8.77v8L5.69,6.31V10L10,14.92,14.31,10V6.31L11.23,10Z\"/> <rect class=\"b\" width=\"20\" height=\"20\"/> </g> </svg>",
  buttonUpload_1: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 32 32\"> <defs> <style>.a { fill: #999; } .b { fill: none; } </style> </defs>  <g> <path class=\"a\" d=\"M9,24.75H23v-3.5h2.62v6.12H6.38V21.25H9ZM14.25,23h3.5V11.63l4.37,5.25V11.63L16,4.63l-6.12,7v5.25l4.37-5.25Z\"/> <rect class=\"b\" width=\"32\" height=\"32\"/> </g> </svg>",
  tipsInfo: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\"> <defs> <style>.a { fill: #b3b3b3; } .b { fill: none; } </style> </defs> <title>tips-info</title> <g> <path class=\"a\" d=\"M8,0A8,8,0,1,1,0,8,8,8,0,0,1,8,0ZM6,6V7.33H7.33V12H6v1.33h4.67V12H9.33V6ZM8.33,2.67a1,1,0,1,0,1,1A1,1,0,0,0,8.33,2.67Z\"/> <rect class=\"b\" width=\"16\" height=\"16\"/> </g> </svg>",
  tipsSuccess: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\"><defs><style>.cls-success{fill:#64d864;}</style></defs><title>success</title><g id=\"Layer_2\"><g><path class=\"cls-success\" d=\"M8,0a8,8,0,1,0,8,8A8,8,0,0,0,8,0ZM7.15,12.61,5.56,11,2.82,8.28,4.41,6.7,7,9.26l4.38-5.48,1.83,1.64Z\"/></g></g></svg>",
  tipsClose: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\"><defs><style>.cls-close-1{fill:none;}.cls-close-2{fill:#333;}</style></defs><title>close</title><g id=\"Layer_2\"><g id=\"Layer_1-2\"><rect class=\"cls-close-1\" width=\"16\" height=\"16\"/><path class=\"cls-close-2\" d=\"M5.24,4.05,8,6.82l2.76-2.77L12,5.24,9.18,8,12,10.76,10.76,12,8,9.18,5.24,12,4.05,10.76,6.82,8,4.05,5.24Z\"/></g></g></svg>",
  tipsWarning: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\"> <defs> <style>.warning { fill: #FF9A4D; } .b { fill: none; } </style> </defs> <title>tips-warning</title> <g> <path class=\"warning\" d=\"M15.49,15.46H.51A1.73,1.73,0,0,1,.51,13L7,1A1.73,1.73,0,0,1,9.43,1l6.07,12A1.73,1.73,0,0,1,15.49,15.46ZM6.56,4.65l.72,5.91H8.72l.72-5.91ZM8,11.42a1.15,1.15,0,1,0,1.15,1.15A1.15,1.15,0,0,0,8,11.42Z\"/> <rect class=\"b\" width=\"16\" height=\"16\"/> </g> </svg>",
  tipsError: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\"><defs><style>.cls-error{fill:#f25c6e;}</style></defs><title>errors</title><g id=\"Layer_2\"><g id=\"Layer_1-2\"><path class=\"cls-error\" d=\"M5.33,0h5.34L16,5.33v5.34L10.67,16H5.33L0,10.67V5.33ZM3.15,11,5,12.85l3-3,3,3L12.85,11l-3-3,3-3L11,3.15l-3,3-3-3L3.15,5l3,3Z\"/></g></g></svg>",
  groupingMode: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\"><defs><style>.cls-grouping{fill:#b3b3b3;}.cls-grouping-2{fill:none;}</style></defs><title>grouping-mode</title><g id=\"Layer_2\"><g id=\"Layer_1-2\"><path class=\"cls-grouping\" d=\"M15,5V15H5V5H15m1-1H4V16H16V4Z\"/><rect class=\"cls-grouping\" width=\"12\" height=\"12\"/><rect class=\"cls-grouping-2\" width=\"16\" height=\"16\"/></g></g></svg>",
  testingMode: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 16 16\"><defs><style>.cls-testing{fill:#b3b3b3;}.cls-testing-2{fill:none;}</style></defs><title>testing-mode</title><g id=\"Layer_2\"><g id=\"Layer_1-2\"><path class=\"cls-testing\" d=\"M15.71,12.42l-5-8.06V1.94h1.45V.24H3.88v1.7H5.33V4.36l-5,8.06A2.52,2.52,0,0,0,0,13.58,2.43,2.43,0,0,0,2.42,16H13.58A2.43,2.43,0,0,0,16,13.58,2.52,2.52,0,0,0,15.71,12.42Zm-11.56-3L7,4.85V1.94H9V4.85l2.88,4.6Z\"/><rect class=\"cls-testing-2\" width=\"16\" height=\"16\"/></g></g></svg>",
  compareButton: "<svg viewBox=\"0 0 1792 1792\" xmlns=\"http://www.w3.org/2000/svg\"><defs> <style>.a {fill: #999}</style> </defs> <path class=\"a\" d=\"M666 481q-60 92-137 273-22-45-37-72.5t-40.5-63.5-51-56.5-63-35-81.5-14.5h-224q-14 0-23-9t-9-23v-192q0-14 9-23t23-9h224q250 0 410 225zm1126 799q0 14-9 23l-320 320q-9 9-23 9-13 0-22.5-9.5t-9.5-22.5v-192q-32 0-85 .5t-81 1-73-1-71-5-64-10.5-63-18.5-58-28.5-59-40-55-53.5-56-69.5q59-93 136-273 22 45 37 72.5t40.5 63.5 51 56.5 63 35 81.5 14.5h256v-192q0-14 9-23t23-9q12 0 24 10l319 319q9 9 9 23zm0-896q0 14-9 23l-320 320q-9 9-23 9-13 0-22.5-9.5t-9.5-22.5v-192h-256q-48 0-87 15t-69 45-51 61.5-45 77.5q-32 62-78 171-29 66-49.5 111t-54 105-64 100-74 83-90 68.5-106.5 42-128 16.5h-224q-14 0-23-9t-9-23v-192q0-14 9-23t23-9h224q48 0 87-15t69-45 51-61.5 45-77.5q32-62 78-171 29-66 49.5-111t54-105 64-100 74-83 90-68.5 106.5-42 128-16.5h256v-192q0-14 9-23t23-9q12 0 24 10l319 319q9 9 9 23z\"/><rect class=\"b\" width=\"32\" height=\"32\"/></svg>",
}

export default InlinedSvgs

export {
  businessViewInactive,
  resetGui,
  zoomIn,
  zoomOut,
  buttonLayout,
  settingsIcon,
  buttonRedo,
  buttonUndo,
  buttonCancel,
  buttonDeploy,
  buttonMetrics,
  buttonUngroup,
  buttonGroupCancel,
  buttonGroupFinish,
  buttonGroupStart,
  buttonImport,
  buttonExport,
  buttonMigrate,
  pdf,
  buttonSave,
  buttonFromFile,
  buttonHide,
}

window.Telegram.WebApp.expand();

// trial лицензия на Dynamsoft Barcode Scanner
let scanerNewLicense =
  "DLS2eyJoYW5kc2hha2VDb2RlIjoiMTAxNjc5OTc0LVRYbFhaV0pRY205cVgyUmljZyIsIm9yZ2FuaXphdGlvbklEIjoiMTAxNjc5OTc0IiwiY2hlY2tDb2RlIjotNDEzNDcxMDQ3fQ==";
let scanerCurrent = "old";
let scanerNewObj, scanerOldObj, lastCode;

// запуск сканера
async function showScaner(isOnce) {
  // запуск нового сканера
  if (scanerCurrent === "new") {
    console.log("START NEW");
    document.getElementById("app").classList.add("fullscreen");
    document.getElementById("reader-wrap").classList.add("hide");
    document.getElementById("barcode-scaner").classList.remove("hide");
    lastCode = null;
    try {
      document.getElementById("dce-bg-loading").classList.remove("hide");
      if (scanerNewObj) {
        await scanerNewObj.show();
      } else {
        // if ( !Dynamsoft.DBR.BarcodeReader.license )
        //     Dynamsoft.DBR.BarcodeReader.license = scanerNewLicense;
        scanerNewObj = await Dynamsoft.DBR.BarcodeScanner.createInstance();

        let settings = await scanerNewObj.getRuntimeSettings();
        settings.maxAlgorithmThreadCount = 1;
        settings.barcodeFormatIds =
          Dynamsoft.DBR.EnumBarcodeFormat.BF_QR_CODE |
          Dynamsoft.DBR.EnumBarcodeFormat.BF_EAN_13;
        await scanerNewObj.updateRuntimeSettings(settings);

        let scanSettings = await scanerNewObj.getScanSettings();
        scanSettings.captureAndDecodeInParallel = false;
        scanSettings.intervalTime = 100;
        scanSettings.whenToPlaySoundforSuccessfulRead = "unique";
        scanSettings.whenToVibrateforSuccessfulRead = "unique";
        scanSettings.duplicateForgetTime = 1500;
        await scanerNewObj.updateScanSettings(scanSettings);

        let videoSettings = await scanerNewObj.getVideoSettings();
        videoSettings.video.facingMode = { ideal: "environment" };
        await scanerNewObj.updateVideoSettings(videoSettings);

        scanerNewObj.onUniqueRead = scanerResult;

        scanerNewObj.onPlayed = async (info) => {
          let rs = await scanerNewObj.getRuntimeSettings();
          rs.region.regionLeft = 5;
          rs.region.regionRight = 95;
          rs.region.regionTop = 5;
          rs.region.regionBottom = 95;
          rs.region.regionMeasuredByPercentage = 1;
          await scanerNewObj.updateRuntimeSettings(rs);
        };

        await scanerNewObj.setUIElement(
          document.getElementById("barcode-scaner")
        );
        await scanerNewObj.show();

        document.getElementById("dce-video-container").style.display = "block";
      }
      document.getElementById("dce-bg-loading").classList.add("hide");
    } catch (e) {
      let err;
      if (e.message.includes("network connection error"))
        err = "Failed to connect to Dynamsoft License Server";
      else err = e.message || e;
      console.log(err);
      if (scanerNewObj && scanerNewObj.hide) {
        scanerNewObj.hide();
        scanerNewObj.destroyContext();
        scanerNewObj = null;
      }
      if (!isOnce) {
        scanerCurrent = "old";
        showScaner(true);
      }
    }
  }
  // запуск старого сканера
  else {
    document.getElementById("app").classList.remove("fullscreen");
    document.getElementById("barcode-scaner").classList.add("hide");
    document.getElementById("reader-wrap").classList.remove("hide");
    lastCode = null;
    try {
      if (
        scanerOldObj &&
        scanerOldObj.getState() === Html5QrcodeScannerState.PAUSED
      )
        scanerOldObj.resume();
      else {
        if (
          scanerOldObj &&
          scanerOldObj.getState() === Html5QrcodeScannerState.SCANNING
        )
          scanerOldObj.stop();
        console.log("CREATE OLD");
        scanerOldObj = new Html5Qrcode("reader", {
          experimentalFeatures: { useBarCodeDetectorIfSupported: false },
        });
        scanerOldObj
          .start(
            { facingMode: "environment" },
            {
              fps: 15,
              qrbox: 250,
              formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
              disableFlip: false,
              aspectRatio: 1.0,
              supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
            },
            scanerResult
          )
          .catch(function (e) {
            console.log(e);
          });
      }
    } catch (e) {
      console.log(e.message || e);
      if (scanerOldObj) {
        if (scanerOldObj.getState() === Html5QrcodeScannerState.SCANNING)
          scanerOldObj.stop();
        scanerOldObj = null;
      }
      if (!isOnce) {
        scanerCurrent = "new";
        showScaner(true);
      }
    }
  }
}

// метод принимает расшифрованный QR или штрих-код
function scanerResult(code) {
  if (!code || (lastCode && lastCode === code && scanerCurrent === "old"))
    return;

  alert("Отсканировано: " + code);

  lastCode = code;

  setTimeout(() => {
    lastCode = null;
  }, 1500);

  return;

  // отправляем данные на api
  // let xhr = new XMLHttpRequest();
  // xhr.open("POST", {{{msg.serverUrl}}}'/QRres', true);
  // xhr.setRequestHeader('Content-Type', 'application/json');
  // xhr.send(JSON.stringify({
  //     "text": code,
  //     "channel": `{{{payload.channel}}}`,
  //     "phone": `{{{payload.phone}}}`,
  //     "user": window.Telegram.WebApp.initDataUnsafe.user
  // }));

  // редирект
  // setTimeout(redirect, 500);
}

// для редиректа
function redirect() {
  window.location.replace(decodeURIComponent("{{payload.redirectLink}}"));
}

// смена сканера
async function changeScaner() {
  if (scanerCurrent === "old" && scanerOldObj) {
    if (scanerOldObj.getState() === Html5QrcodeScannerState.SCANNING)
      scanerOldObj.pause();
  } else if (scanerCurrent === "new" && scanerNewObj) await scanerNewObj.hide();

  scanerCurrent = scanerCurrent === "old" ? "new" : "old";

  showScaner();
}

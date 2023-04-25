'use strict';

const urlParams = new URLSearchParams(window.location.search);
// const channel = urlParams.get('channel');
let channel = 'telegram';
const phone = urlParams.get('phone');

// if (channel === 'telegram') {
  window.Telegram.WebApp.expand();
// }

const instructionHeight = document.getElementById('instruction').offsetHeight;
document.documentElement.style.setProperty(
  '--instruction-height',
  `${instructionHeight}px`
);

// const isAndroid = /Android/i.test(navigator.userAgent);
// const isAndroid = true;
const isAndroid = false;
const isIOS = /Iphone/i.test(navigator.userAgent);

const footer = document.getElementById('footer');

if ((isAndroid && channel === 'viber') || (isIOS && channel === 'telegram')) {
  footer.classList.add('hide');
} else {
  footer.classList.remove('hide');
}

let scanerCurrent;

if (isAndroid && channel === 'telegram') {
  scanerCurrent = 'new';
} else {
  scanerCurrent = 'old';
}

let scanerNewObj, scanerOldObj, lastCode;

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

window.console.log(scanerCurrent)

// запуск сканера
async function showScaner() {
  //запуск старого сканера
  if (scanerCurrent === 'old') {
    console.log('START OLD');
    lastCode = null;
    document.getElementById('scanner-dynamsoft').classList.add('hide');
    document.getElementById('scanner-HTML5').classList.remove('hide');
    try {
      document.getElementById('loader-wrapper').classList.remove('hide');

      setTimeout(() => {
        if (
          scanerOldObj &&
          scanerOldObj.getState() === Html5QrcodeScannerState.PAUSED
        ) {
          scanerOldObj.resume();
        } else {
          if (
            scanerOldObj &&
            scanerOldObj.getState() === Html5QrcodeScannerState.SCANNING
          ) {
            scanerOldObj.stop();
          }

          window.console.log('CREATE OLD');

          scanerOldObj = new Html5Qrcode('reader', {
            experimentalFeatures: { useBarCodeDetectorIfSupported: false },
          });

          scanerOldObj
            .start(
              { facingMode: 'environment' },
              {
                fps: 15,
                qrbox: 225,
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

        document.getElementById('loader-wrapper').classList.add('hide');
        document.getElementById('reader').classList.remove('hide');
      }, 1500);
    } catch (e) {
      console.log(e.message || e);

      if (scanerOldObj) {
        if (scanerOldObj.getState() === Html5QrcodeScannerState.SCANNING) {
          scanerOldObj.stop();
          scanerOldObj = null;
        }

        if (channel === 'telegram') {
          window.Telegram.WebApp.showAlert(
            'Щось пішло не так! Змінюємо сканер...',
            () => {
              scanerCurrent = 'new';
              showScaner();
            }
          );
        } else {
          alert('Щось пішло не так! Змінюємо сканер...');
          scanerCurrent = 'new';
          showScaner();
        }
      }
    }
    //запуск нового сканера
  } else if (scanerCurrent === 'new') {
    window.console.log('START NEW');
    document.getElementById('scanner-HTML5').classList.add('hide');
    document.getElementById('reader').classList.add('hide');

    lastCode = null;

    document.getElementById('scanner-dynamsoft').classList.remove('hide');
    try {
      document.getElementById('dce-bg-loading').classList.remove('hide');
      if (scanerNewObj) {
        await scanerNewObj.show();
        document.getElementById('dce-bg-loading').classList.add('hide');
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
        scanSettings.whenToPlaySoundforSuccessfulRead = 'unique';
        scanSettings.whenToVibrateforSuccessfulRead = 'unique';
        scanSettings.duplicateForgetTime = 1500;

        await scanerNewObj.updateScanSettings(scanSettings);

        let videoSettings = await scanerNewObj.getVideoSettings();
        videoSettings.video.facingMode = { ideal: 'environment' };

        await scanerNewObj.updateVideoSettings(videoSettings);

        scanerNewObj.onUniqueRead = scanerResult;

        scanerNewObj.onPlayed = async () => {
          let rs = await scanerNewObj.getRuntimeSettings();
          rs.region.regionLeft = 5;
          rs.region.regionRight = 95;
          rs.region.regionTop = 5;
          rs.region.regionBottom = 95;
          rs.region.regionMeasuredByPercentage = 1;
          await scanerNewObj.updateRuntimeSettings(rs);
        };

        await scanerNewObj.setUIElement(
          document.getElementById('barcode-scaner')
        );
        await scanerNewObj.setResolution(400, 400);
        document.getElementById('dce-video-container').style.display = 'block';
        await scanerNewObj.show();
        document.getElementById('dce-bg-loading').classList.add('hide');
      }
    } catch (e) {
      let err;

      if (e.message.includes('network connection error')) {
        err = 'Failed to connect to Dynamsoft License Server';
      } else {
        err = e.message || e;
        window.console.log(err);
      }

      if (scanerNewObj && scanerNewObj.hide) {
        scanerNewObj.hide();
        scanerNewObj.destroyContext();
        scanerNewObj = null;
      }

      if (channel === 'telegram') {
        window.Telegram.WebApp.showAlert(
          'Щось пішло не так... Змінюємо сканер',
          () => {
            scanerCurrent = 'old';
            showScaner();
          }
        );
      } else {
        alert('Щось пішло не так... Змінюємо сканер');
        scanerCurrent = 'old';
        showScaner();
      }
    }
  }
}

// смена сканера
async function changeScaner() {
  if (scanerCurrent === 'old' && scanerOldObj) {
    if (scanerOldObj.getState() === Html5QrcodeScannerState.SCANNING) {
      scanerOldObj.pause();
    }
  } else if (scanerCurrent === 'new' && scanerNewObj) {
    scanerNewObj.hide();
  }

  scanerCurrent = scanerCurrent === 'old' ? 'new' : 'old';

  showScaner();
}

// метод принимает расшифрованный QR или штрих-код
function scanerResult(code) {
  if (!code || (lastCode && lastCode === code)) {
    return;
  }

  console.log(code);

  if (channel === 'telegram') {
    window.Telegram.WebApp.showAlert(
      'QR успішно відскановано ✅\n Перевіряємо інформацію ⏳',
      () => {
        sendDataToApi(code);
      }
    );
  } else {
    alert('QR успішно відскановано ✅\n Перевіряємо інформацію ⏳');
    sendDataToApi(code);
  }
}

function sendDataToApi(code) {
  lastCode = code;

  setTimeout(() => {
    lastCode = null;
  }, 1500);

  // отправляем данные на api - новий
  // let xhr = new XMLHttpRequest();
  // xhr.open('POST', {{{msg.serverUrl}}}'/QRres', true);
  // xhr.setRequestHeader('Content-Type', 'application/json');

  // if (channel === 'telegram') {
  //   xhr.send(
  //     JSON.stringify({
  //       text: code,
  //       channel: channel,
  //       phone: phone,
  //       user: window.Telegram.WebApp.initDataUnsafe.user,
  //     })
  //   );
  // } else if (channel === 'viber') {
  //   xhr.send(
  //     JSON.stringify({
  //       text: code,
  //       channel: channel,
  //       phone: phone,
  //     })
  //   );
  // }

  setTimeout(redirect, 500);

  return;
}

function redirect() {
  if (channel === 'telegram') {
    window.Telegram.WebApp.close();
  } else if (channel === 'viber') {
    window.location.replace(decodeURIComponent('{{payload.redirectLink}}'));
  }

  window.Telegram.WebApp.close();
}

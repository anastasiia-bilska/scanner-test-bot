'use strict';

const urlParams = new URLSearchParams(window.location.search);
const channel = urlParams.get('channel');
const phone = urlParams.get('phone');

if (channel === 'telegram') {
  window.Telegram.WebApp.expand();
}
// trial лицензия на Dynamsoft Barcode Scanner
let scanerNewLicense =
  'DLS2eyJoYW5kc2hha2VDb2RlIjoiMTAxNjc5OTc0LVRYbFhaV0pRY205cVgyUmljZyIsIm9yZ2FuaXphdGlvbklEIjoiMTAxNjc5OTc0IiwiY2hlY2tDb2RlIjotNDEzNDcxMDQ3fQ==';
let scanerObj, lastCode;

// запуск сканера
async function showScaner() {
  window.console.log('START NEW');

  lastCode = null;

  try {
    document.getElementById('dce-bg-loading').classList.remove('hide');

    if (scanerObj) {
      await scanerObj.show();
    } else {
      // if ( !Dynamsoft.DBR.BarcodeReader.license )
      //     Dynamsoft.DBR.BarcodeReader.license = scanerNewLicense;
      scanerObj = await Dynamsoft.DBR.BarcodeScanner.createInstance();

      let settings = await scanerObj.getRuntimeSettings();
      settings.maxAlgorithmThreadCount = 1;
      settings.barcodeFormatIds =
        Dynamsoft.DBR.EnumBarcodeFormat.BF_QR_CODE |
        Dynamsoft.DBR.EnumBarcodeFormat.BF_EAN_13;

      await scanerObj.updateRuntimeSettings(settings);

      let scanSettings = await scanerObj.getScanSettings();
      scanSettings.captureAndDecodeInParallel = false;
      scanSettings.intervalTime = 100;
      scanSettings.whenToPlaySoundforSuccessfulRead = 'unique';
      scanSettings.whenToVibrateforSuccessfulRead = 'unique';
      scanSettings.duplicateForgetTime = 1500;

      await scanerObj.updateScanSettings(scanSettings);

      let videoSettings = await scanerObj.getVideoSettings();
      videoSettings.video.facingMode = { ideal: 'environment' };

      await scanerObj.updateVideoSettings(videoSettings);

      scanerObj.onUniqueRead = scanerResult;

      scanerObj.onPlayed = async () => {
        let rs = await scanerObj.getRuntimeSettings();
        rs.region.regionLeft = 5;
        rs.region.regionRight = 95;
        rs.region.regionTop = 5;
        rs.region.regionBottom = 95;
        rs.region.regionMeasuredByPercentage = 1;
        await scanerObj.updateRuntimeSettings(rs);
      };

      await scanerObj.setUIElement(document.getElementById('barcode-scaner'));
      await scanerObj.setResolution(400, 400);
      await scanerObj.show();
      document.getElementById('dce-video-container').style.display = 'block';
    }

    document.getElementById('dce-bg-loading').classList.add('hide');
  } catch (e) {
    let err;

    if (e.message.includes('network connection error')) {
      err = 'Failed to connect to Dynamsoft License Server';
    } else {
      err = e.message || e;
      window.console.log(err);
    }

    if (scanerObj && scanerObj.hide) {
      scanerObj.hide();
      scanerObj.destroyContext();
      scanerObj = null;
    }
  }
}

// метод принимает расшифрованный QR или штрих-код
function scanerResult(code) {
  if (!code) {
    return;
  }

  alert('QR успішно відскановано ✅\n Перевіряємо інформацію ⏳');

  lastCode = code;

  setTimeout(() => {
    lastCode = null;
  }, 1500);

  //отправляем данные на api
  // let xhr = new XMLHttpRequest();
  // const codeInfo = JSON.parse(code);

  // xhr.open('POST', {{{msg.serverUrl}}}'/QRres', true);
  // xhr.setRequestHeader('Content-Type', 'application/json');

  //   if (channel === 'telegram') {
  //     xhr.send(
  //       JSON.stringify({
  //         text: code,
  //         channel: `{{{payload.channel}}}`,
  //         phone: `{{{payload.phone}}}`,
  //         user: window.Telegram.WebApp.initDataUnsafe.user,
  //       })
  //     );
  //   } else if (channel === 'viber') {
  //     xhr.send(
  //       JSON.stringify({
  //         text: code,
  //         channel: `{{{payload.channel}}}`,
  //         phone: `{{{payload.phone}}}`,
  //       })
  //     );
  //   }
  
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

  
  setTimeout(redirect, 500);

  return;
}

function redirect() {
  if (channel === 'telegram') {
    window.Telegram.WebApp.close();
  } else if (channel === 'viber') {
    window.location.replace(decodeURIComponent('{{payload.redirectLink}}'));
  }
}

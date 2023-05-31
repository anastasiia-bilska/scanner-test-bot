'use strict';

const urlParams = new URLSearchParams(window.location.search);
const channel = urlParams.get('channel');
const phone = urlParams.get('phone');

if (channel === 'telegram') {
  window.Telegram.WebApp.expand();
}

const instructionHeight = document.getElementById('instruction').offsetHeight;
document.documentElement.style.setProperty(
  '--instruction-height',
  `${instructionHeight}px`
);

let scannerObj, lastCode;
let isScanned = false;

showScanner();

// запуск сканера
async function showScanner() {
  console.log('START OLD');
  lastCode = null;

  try {
    setTimeout(() => {
      if (
        scannerObj &&
        scannerObj.getState() === Html5QrcodeScannerState.PAUSED
      ) {
        scannerObj.resume();
      } else {
        if (
          scannerObj &&
          scannerObj.getState() === Html5QrcodeScannerState.SCANNING
        ) {
          scannerObj.stop();
        }

        window.console.log('CREATE OLD');

        scannerObj = new Html5Qrcode('reader', {
          experimentalFeatures: { useBarCodeDetectorIfSupported: false },
        });

        scannerObj
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
            scannerResult
          )
          .catch(function (e) {
            console.log(e);
          });
      }

      document.getElementById('reader').classList.remove('hide');
    }, 1500);
  } catch (e) {
    console.log(e.message || e);

    if (scannerObj) {
      if (scannerObj.getState() === Html5QrcodeScannerState.SCANNING) {
        scannerObj.stop();
        scannerObj = null;
      }

      if (channel === 'telegram') {
        window.Telegram.WebApp.showAlert(
          'Щось пішло не так! Спробуйте, будь ласка, пізніше',
          () => {
            showScanner();
          }
        );
      } else {
        alert('Щось пішло не так! Спробуйте, будь ласка, пізніше');
        showScanner();
      }
    }
  }
}

// метод приймає розшифрований QR- чи штрих-код
function scannerResult(code) {
  // if (!code || (lastCode && lastCode === code)) {
  //   return;
  // }

  // alert(JSON.parse(code));
  const realCode = JSON.parse(code);

  if (!lastCode || isScanned) {
    lastCode = realCode;
    return;
  }

  // if (channel === 'telegram') {
  //   window.Telegram.WebApp.showAlert(
  //     'QR успішно відскановано ✅\n Перевіряємо інформацію ⏳',
  //     () => {
  //       sendDataToApi(code);
  //     }
  //   );
  // } else {
  //   alert('QR успішно відскановано ✅\n Перевіряємо інформацію ⏳');
  //   sendDataToApi(code);
  // }
   if (realCode.id !== lastCode.id && realCode.name === lastCode.name) {
     alert('Це відео!');
     isScanned = true;
     redirect();
     return;
   }

   setTimeout(() => {
     alert('Схоже це не відео');
     isScanned = true;
     lastCode = null;
     return;
   }, 3000);
}

function sendDataToApi(code) {
  lastCode = code;

  //   setTimeout(() => {
  //     lastCode = null;
  //   }, 1500);

  //   // відправляємо дані на api
  //   let xhr = new XMLHttpRequest();
  //   xhr.open('POST', {{{msg.serverUrl}}}'/QRres', true);
  //   xhr.setRequestHeader('Content-Type', 'application/json');

  //   if (channel === 'telegram') {
  //     xhr.send(
  //       JSON.stringify({
  //         text: code,
  //         channel: channel,
  //         phone: phone,
  //         user: window.Telegram.WebApp.initDataUnsafe.user,
  //       })
  //     );
  //   } else if (channel === 'viber') {
  //     xhr.send(
  //       JSON.stringify({
  //         text: code,
  //         channel: channel,
  //         phone: phone,
  //       })
  //     );
  //   }

  //   setTimeout(redirect, 500);

  //   return;
}

function redirect() {
  if (channel === 'telegram') {
    window.Telegram.WebApp.close();
  } else if (channel === 'viber') {
    window.location.replace(decodeURIComponent('{{payload.redirectLink}}'));
  }

  window.Telegram.WebApp.close();
}

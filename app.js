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

let scanerObj, lastCode;
showScaner();

// запуск сканера
async function showScaner() {
  console.log('START OLD');
  lastCode = null;

  try {
    setTimeout(() => {
      if (
        scanerObj &&
        scanerObj.getState() === Html5QrcodeScannerState.PAUSED
      ) {
        scanerObj.resume();
      } else {
        if (
          scanerObj &&
          scanerObj.getState() === Html5QrcodeScannerState.SCANNING
        ) {
          scanerObj.stop();
        }

        window.console.log('CREATE OLD');

        scanerObj = new Html5Qrcode('reader', {
          experimentalFeatures: { useBarCodeDetectorIfSupported: false },
        });

        scanerObj
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
      
      document.getElementById('reader').classList.remove('hide');
    }, 1500);
  } catch (e) {
    console.log(e.message || e);

    if (scanerObj) {
      if (scanerObj.getState() === Html5QrcodeScannerState.SCANNING) {
        scanerObj.stop();
        scanerObj = null;
      }

      if (channel === 'telegram') {
        window.Telegram.WebApp.showAlert(
          'Щось пішло не так! Спробуйте, будь ласка, пізніше',
          () => {
            showScaner();
          }
        );
      } else {
        alert('Щось пішло не так! Спробуйте, будь ласка, пізніше');
        showScaner();
      }
    }
  }
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
}

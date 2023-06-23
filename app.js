'use strict';

let IP = null;

const getIP = async () => {
  const response = await fetch('http://ip-api.com/json/?fields=query');
  const IPData = await response.json();

  return IPData.query;
};

document.addEventListener('DOMContentLoaded', async () => {
  IP = await getIP();

  console.log(IP);
});

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
  // alert('here')
  const realCode = JSON.parse(code);

  if (!lastCode || isScanned) {
    lastCode = realCode;
    // alert('reject');
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
  if (
    realCode.scanningTime !== lastCode.scanningTime &&
    realCode.id === lastCode.id
  ) {
    alert('Це відео!');
    scannerObj.pause();
    const date = new Date();
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Europe/Kiev',
    };

    const formattedDate = date.toLocaleString('en-US', options);
    const text = formattedDate;
    const QRDate = Date.parse(realCode.scanningTime);
    const currentDate = Date.parse(text);

    const timeDifference = Math.abs(currentDate - QRDate);

    // alert(
    //   `QRDate: ${realCode.scanningTime}, currentDate: ${text}, QRTime: ${QRDate}, currentTime: ${currentDate}, diffTime: ${timeDifference}`
    // );

    if (timeDifference <= 3000) {
      alert('різниця між поточним часом і часом в qr-коді коректна!');
    } else {
      alert('різниця між поточним часом і часом в qr-коді надто велика!');
    }

    if (realCode.ip !== null) {
      alert('generator IP: ' + realCode.ip, ', scanner IP: ' + IP)
      if (realCode.ip === IP) {
        alert('IP адреси співпадають!');
      } else {
        alert('IP адреси НЕ співпадають!');
      }
    }

    scannerObj.resume();
    isScanned = true;
    redirect();
    return;
  }

  setTimeout(() => {
    scannerObj.pause();
    alert('Схоже це не відео');
    isScanned = true;
    lastCode = null;

    setTimeout(() => {
      isScanned = false;
      scannerObj.resume();
    }, 3000);
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

// setTimeout(() => {
//   isScanned = false;
// }, 5000);

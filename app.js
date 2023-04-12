'use strict';

const urlParams = new URLSearchParams(window.location.search);
const channel = urlParams.get('channel');
const phone = urlParams.get('phone');

// if (channel === 'telegram') {
  window.Telegram.WebApp.expand();
// }

let scanerObj, lastCode;

const messagesForTelegramScan = ['Аптека 9-1-1 бажає вам гарного дня!', 'Аптека 9-1-1 бажає вам міцного здоров\'я', 'Аптека 9-1-1 дуже вдячна за ваш труд!']
const randomIndex = Math.floor(Math.random() * strings.length);
const randomMessage = messagesForTelegramScan[randomIndex];

// запуск сканера
async function showScaner() {
  console.log('START OLD');
  lastCode = null;

  try {
    // document.getElementById('loader-wrapper').classList.remove('hide');

    // if (channel === 'telegram') {
    //   window.Telegram.WebApp.showScanQrPopup({
    //     text: "Помістіть QR-код у центр екрану 🎯",
    //   });
    //   window.Telegram.WebApp.onEvent('qrTextReceived', scanerResult);
    // } else {
      setTimeout(() => {
      if (scanerObj && scanerObj.getState() === Html5QrcodeScannerState.PAUSED) {
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

        document.getElementById("loader-wrapper").classList.add("hide");
      }, 3000)
      // }
    // document.getElementById('loader-wrapper').classList.add('hide');
    // }
  } catch (e) {
    console.log(e.message || e);

    if (scanerObj) {
      if (isScanning) {
        scanerObj.stop();
      }

      scanerObj = null;
    }
  } finally {
    // document.getElementById("loader-wrapper").classList.add("hide");
  }
}

// метод принимает расшифрованный QR или штрих-код
function scanerResult(code) {
  window.Telegram.WebApp.closeScanQrPopup();

  // const scanResult = channel === 'telegram' ? code.data : code;
  const scanResult = code.data;

  if (!scanResult || (lastCode && lastCode === scanResult)) {
    return;
  }

  if (channel === 'telegram') {
    window.Telegram.WebApp.showAlert("QR успішно відскановано ✅\n Перевіряємо інформацію ⏳");
  }

  // alert('QR успішно відскановано ✅\n Перевіряємо інформацію ⏳');
  // lastCode = code.data;

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
    //       channel: `{{{payload.channel}}}`,
    //       phone: `{{{payload.phone}}}`,
    //       user: window.Telegram.WebApp.initDataUnsafe.user,
    //     })
    //   );
    // } else if (channel === 'viber') {
    //   xhr.send(
    //     JSON.stringify({
    //       text: code,
    //       channel: `{{{payload.channel}}}`,
    //       phone: `{{{payload.phone}}}`,
    //     })
    //   );
    // }

    // отправляем данные на api - початковий
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

  window.Telegram.WebApp.close();
}

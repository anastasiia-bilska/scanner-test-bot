window.Telegram.WebApp.expand();
const ct = window.Telegram.WebApp.colorScheme;

window.Telegram.WebApp.showScanQrPopup({
  text: "Помістіть QR-код у центр екрану 🎯",
});
window.Telegram.WebApp.onEvent("qrTextReceived", scanerResult);

window.console.log(ct);

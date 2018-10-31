// request permission on page load
document.addEventListener('DOMContentLoaded', function () {
  if (typeof Notification !== "undefined" && Notification.permission !== "granted")
    Notification.requestPermission();
});

function notifyMe() {
  if (!Notification) {
    alert('Desktop notifications not available in your browser. Try Chrome browser.'); 
    return;
  }

  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else {
    var notification = new Notification('Project status changed!', {
      icon: 'http://192.168.61.101/_tao/apple-touch-icon-152x152.png',
      body: "Click to access results.",
    });

    notification.onclick = function () {
      window.open("http://192.168.61.101/_tao/");
    };
  }
}

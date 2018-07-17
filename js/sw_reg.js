if (navigator.serviceWorker) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(function() {
      console.log("SW Registered!");
    })
    .catch(function() {
      console.log("SW reg failed!");
    });
} 
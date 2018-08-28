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


// static initServiceWorker() {
//   if ('serviceWorker' in navigator) {
//     window.addEventListener('load', function () {
//       navigator.serviceWorker.register('/service-worker.js').then(() => {
//         navigator.serviceWorker.addEventListener('message', message => {
//           message.data.action === 'postReviews' &&
//             DBHelper.sendStoredReviews()
//         })
//       })
//       console.log("SW has been registered")
//     });
//   }
// }
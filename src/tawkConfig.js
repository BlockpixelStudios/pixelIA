export const initTawkTo = () => {
  var Tawk_API = Tawk_API || {};
  var Tawk_LoadStart = new Date();
  
  (function(){
    var s1 = document.createElement("script");
    var s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/691505bb5efb8f195964b425/default';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin','*');
    s0.parentNode.insertBefore(s1, s0);
  })();
  
  return Tawk_API;
};

export const showTawkWidget = () => {
  if (window.Tawk_API) {
    window.Tawk_API.showWidget();
  }
};

export const hideTawkWidget = () => {
  if (window.Tawk_API) {
    window.Tawk_API.hideWidget();
  }
};

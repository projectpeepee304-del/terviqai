// Tawk.to live chat loader — loaded site-wide through Next.js Script.
var Tawk_API = Tawk_API || {};
var Tawk_LoadStart = new Date();

// Keep the launcher at the bottom-right and raise it by 50px on all screens.
Tawk_API.customStyle = {
  visibility: {
    desktop: { position: "br", xOffset: "0px", yOffset: "50px" },
    mobile: { position: "br", xOffset: "0px", yOffset: "50px" }
  }
};
(function () {
  var s1 = document.createElement("script");
  var s0 = document.getElementsByTagName("script")[0];
  s1.async = true;
  s1.src = "https://embed.tawk.to/6afb030a66b4883c8464d179/1k7i87p63";
  s1.charset = "UTF-8";
  s1.setAttribute("crossorigin", "*");
  if (s0 && s0.parentNode) {
    s0.parentNode.insertBefore(s1, s0);
  } else {
    document.head.appendChild(s1);
  }
})();

(function () {
  if (window.HireneticWidget) return;

  var SCRIPT_SRC = document.currentScript ? document.currentScript.src : '';
  var BASE_URL = SCRIPT_SRC ? new URL(SCRIPT_SRC).origin : window.location.origin;

  function createWidgetModal(options) {
    var candidateId = options.candidateId || options.id || '';
    var email = options.email || '';

    var embedUrl = BASE_URL + '/candidate-widget/embed?public_widget=true';
    if (candidateId) embedUrl += '&candidate_id=' + encodeURIComponent(candidateId);
    if (email) embedUrl += '&email=' + encodeURIComponent(email);

    // Check if modal already exists
    var existingModal = document.getElementById('hirenetic-widget-overlay');
    if (existingModal) existingModal.remove();

    // Create Overlay
    var overlay = document.createElement('div');
    overlay.id = 'hirenetic-widget-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(15,23,42,0.75);backdrop-filter:blur(8px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';

    // Create Container
    var container = document.createElement('div');
    container.style.cssText = 'width:100%;max-width:1180px;height:90vh;max-height:880px;background:#ffffff;border-radius:16px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);overflow:hidden;position:relative;display:flex;flex-direction:column;animation:hireneticFadeIn 0.25s ease-out;';

    // Keyframes
    var styleTag = document.createElement('style');
    styleTag.textContent = '@keyframes hireneticFadeIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }';
    document.head.appendChild(styleTag);

    // Create Close Button
    var closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = 'position:absolute;top:14px;right:18px;z-index:1000000;background:rgba(241,245,249,0.9);border:1px solid #cbd5e1;color:#0f172a;width:32px;height:32px;border-radius:50%;font-size:16px;font-weight:bold;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s ease;';
    closeBtn.onclick = function () {
      overlay.remove();
    };

    // Create Iframe
    var iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.style.cssText = 'width:100%;height:100%;border:none;background:#ffffff;';

    container.appendChild(closeBtn);
    container.appendChild(iframe);
    overlay.appendChild(container);

    overlay.onclick = function (e) {
      if (e.target === overlay) overlay.remove();
    };

    document.body.appendChild(overlay);
  }

  window.HireneticWidget = {
    open: function (options) {
      createWidgetModal(options || {});
    }
  };

  // Auto-bind to buttons with data-hirenetic-candidate or data-hirenetic-email
  document.addEventListener('click', function (e) {
    var target = e.target.closest('[data-hirenetic-candidate], [data-hirenetic-email]');
    if (target) {
      e.preventDefault();
      var candidateId = target.getAttribute('data-hirenetic-candidate') || '';
      var email = target.getAttribute('data-hirenetic-email') || '';
      window.HireneticWidget.open({ candidateId: candidateId, email: email });
    }
  });
})();

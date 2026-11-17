// Menú móvil
(function () {
  var btn = document.querySelector('.menu-btn');
  var menu = document.querySelector('.nav ul');
  if (btn && menu) {
    btn.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { menu.classList.remove('open'); });
    });
  }
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

// Envío de formularios a Formspree (mismo endpoint del sitio anterior)
(function () {
  var ENDPOINT = 'https://formspree.io/f/mlgaekaz';
  document.querySelectorAll('form[data-formspree]').forEach(function (form) {
    var msg = form.querySelector('.form-msg');
    var submit = form.querySelector('button[type=submit]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      msg.className = 'form-msg';
      submit.disabled = true;
      var label = submit.textContent;
      submit.textContent = 'Enviando…';
      fetch(ENDPOINT, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          form.reset();
          msg.textContent = form.dataset.ok || 'Gracias. Recibimos su mensaje y le contactaremos a la brevedad.';
          msg.className = 'form-msg ok';
        })
        .catch(function () {
          msg.textContent = 'No pudimos enviar el formulario. Escríbanos a contacto@gariskcapital.com.';
          msg.className = 'form-msg err';
        })
        .finally(function () { submit.disabled = false; submit.textContent = label; });
    });
  });
})();

// Respaldo si una imagen no existe: logo -> texto, foto -> se oculta
(function () {
  function fix(img) {
    if (img.dataset.fixed) return; img.dataset.fixed = '1';
    if (img.closest('.logo, .foot')) {
      var s = document.createElement('span');
      s.className = 'wordmark'; s.innerHTML = 'GA <em>Risk Capital</em>';
      img.replaceWith(s);
    } else { img.style.display = 'none'; }
  }
  document.querySelectorAll('img').forEach(function (img) {
    if (img.complete && img.naturalWidth === 0) fix(img);
    img.addEventListener('error', function () { fix(img); });
  });
})();

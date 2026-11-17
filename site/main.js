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

// Indicadores de mercado (Banxico) — si falla, la sección queda oculta
(function () {
  var sec = document.getElementById('indicadores');
  var grid = document.getElementById('ticker-grid');
  if (!sec || !grid) return;
  var fmt = function (v, d) {
    return v.toLocaleString('es-MX', { minimumFractionDigits: d, maximumFractionDigits: d });
  };
  fetch('/api/indicadores', { headers: { Accept: 'application/json' } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) {
      if (!j || !j.ok || !j.items || !j.items.length) return;
      grid.innerHTML = '';
      j.items.forEach(function (it) {
        var el = document.createElement('div');
        el.className = 'tk';
        var unidad = it.unidad === '%' ? '%' : '';
        var sufijo = it.unidad === '%' ? '' : '<small>' + it.unidad + '</small>';
        var varTxt = '';
        if (typeof it.variacion === 'number') {
          var cls = it.variacion > 0 ? 'up' : (it.variacion < 0 ? 'down' : '');
          varTxt = ' · <span class="' + cls + '">' + (it.variacion > 0 ? '+' : '') + fmt(it.variacion, 2) + '%</span>';
        }
        el.innerHTML = '<div class="l"></div><div class="v"></div><div class="d"></div>';
        el.querySelector('.l').textContent = it.label;
        el.querySelector('.v').innerHTML = fmt(it.valor, it.decimales) + unidad + sufijo;
        var f = String(it.fecha).replace(/[<>&]/g, '');
        var m = f.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        var meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
        if (it.key === 'inflacion' && m) f = meses[parseInt(m[2], 10) - 1] + ' ' + m[3];
        el.querySelector('.d').innerHTML = (it.key === 'inflacion' ? 'Dato de ' : 'Dato al ') + f + varTxt;
        grid.appendChild(el);
      });
      sec.hidden = false;
    })
    .catch(function () {});
})();

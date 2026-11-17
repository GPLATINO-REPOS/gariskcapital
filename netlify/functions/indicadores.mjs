// Indicadores financieros de México desde Banxico (SIE API).
// Requiere la variable de entorno BANXICO_TOKEN en Netlify.
// La respuesta se guarda en la caché de Netlify (6 h), así que Banxico se consulta pocas veces al día.

const BASE = 'https://www.banxico.org.mx/SieAPIRest/service/v1/series';

// Para cada indicador se prueban códigos candidatos y sólo se acepta el que
// tenga un título oficial que coincida (evita mostrar una serie equivocada).
export const INDICADORES = [
  { key: 'fix', label: 'Tipo de cambio FIX', unidad: 'MXN por USD', decimales: 4,
    candidatos: ['SF43718'], debe: [/fix/i], excluye: [] },
  { key: 'objetivo', label: 'Tasa objetivo Banxico', unidad: '%', decimales: 2,
    candidatos: ['SF61745'], debe: [/objetivo/i], excluye: [] },
  { key: 'tiie28', label: 'TIIE 28 días', unidad: '%', decimales: 4,
    candidatos: ['SF43783', 'SF60648', 'SF60653'], debe: [/tiie/i, /28/], excluye: [/mensual/i, /fondeo/i] },
  { key: 'cetes28', label: 'CETES 28 días', unidad: '%', decimales: 2,
    candidatos: ['SF43936', 'SF60633'], debe: [/cetes/i, /28/], excluye: [/mensual/i] },
  { key: 'inflacion', label: 'Inflación anual', unidad: '%', decimales: 2,
    candidatos: ['SP30578', 'SP74665'], debe: [/inflaci/i], excluye: [/subyacente/i, /mensual/i] },
  { key: 'udi', label: 'Valor de la UDI', unidad: 'MXN', decimales: 6,
    candidatos: ['SP68257'], debe: [/udi|unidades de inversi/i], excluye: [] },
];

const num = (s) => {
  const v = parseFloat(String(s).replace(/,/g, ''));
  return Number.isFinite(v) ? v : null;
};

const iso = (d) => d.toISOString().slice(0, 10);

async function sie(path, token) {
  const r = await fetch(`${BASE}/${path}`, {
    headers: { 'Bmx-Token': token, Accept: 'application/json' },
  });
  if (!r.ok) throw new Error(`Banxico HTTP ${r.status}`);
  const j = await r.json();
  return (j && j.bmx && j.bmx.series) || [];
}

export function elegir(ind, series) {
  for (const id of ind.candidatos) {
    const s = series.find((x) => x.idSerie === id);
    if (!s || !Array.isArray(s.datos) || !s.datos.length) continue;
    const t = s.titulo || '';
    if (!ind.debe.every((re) => re.test(t))) continue;
    if (ind.excluye.some((re) => re.test(t))) continue;
    const d = s.datos[s.datos.length - 1];
    const valor = num(d.dato);
    if (valor === null) continue;
    return { key: ind.key, label: ind.label, unidad: ind.unidad, decimales: ind.decimales,
      valor, fecha: d.fecha, serie: id, tituloOficial: t };
  }
  return null;
}

export async function obtener(token, hoy = new Date()) {
  const ids = [...new Set(INDICADORES.flatMap((i) => i.candidatos))].join(',');
  const desde = new Date(hoy.getTime() - 15 * 864e5);

  const [ultimos, historiaFix] = await Promise.all([
    sie(`${ids}/datos/oportuno`, token),
    sie(`SF43718/datos/${iso(desde)}/${iso(hoy)}`, token).catch(() => []),
  ]);

  const items = INDICADORES.map((i) => elegir(i, ultimos)).filter(Boolean);

  // Variación diaria del FIX contra el dato publicado anterior
  const fix = items.find((i) => i.key === 'fix');
  const h = historiaFix[0] && historiaFix[0].datos ? historiaFix[0].datos.filter((d) => num(d.dato) !== null) : [];
  if (fix && h.length >= 2) {
    const prev = num(h[h.length - 2].dato);
    const last = num(h[h.length - 1].dato);
    if (last === fix.valor && prev) fix.variacion = ((last - prev) / prev) * 100;
  }
  return items;
}

export default async () => {
  const token = process.env.BANXICO_TOKEN;
  const headers = { 'Content-Type': 'application/json; charset=utf-8' };
  if (!token) {
    return new Response(JSON.stringify({ ok: false, error: 'Falta BANXICO_TOKEN' }), { status: 500, headers });
  }
  try {
    const items = await obtener(token);
    if (!items.length) throw new Error('Sin datos válidos');
    return new Response(JSON.stringify({ ok: true, fuente: 'Banco de México (SIE)', actualizado: new Date().toISOString(), items }), {
      status: 200,
      headers: {
        ...headers,
        'Cache-Control': 'public, max-age=900',
        'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=21600, stale-while-revalidate=86400',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e.message || e) }), {
      status: 502, headers: { ...headers, 'Cache-Control': 'no-store' },
    });
  }
};

export const config = { path: '/api/indicadores' };

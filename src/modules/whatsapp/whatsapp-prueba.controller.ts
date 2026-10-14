// whatsapp-prueba.controller.ts
// TEMPORAL: página para conectar un asesor sin el front. Bórrala cuando tengas el Vue listo.
import { Controller, Get, Header } from '@nestjs/common';

const HTML = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Prueba coexistencia</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 640px; margin: 40px auto; padding: 0 16px; }
  input, button { font-size: 16px; padding: 10px; margin: 6px 0; }
  button { cursor: pointer; background: #25d366; border: 0; border-radius: 6px; color: #fff; }
  pre { background: #111; color: #0f0; padding: 12px; border-radius: 6px; white-space: pre-wrap; min-height: 120px; }
</style>
</head>
<body>
<h2>Conectar asesor (coexistencia)</h2>
<label>ID del trabajador</label><br>
<input id="idTrabajador" type="number" value="1"><br>
<button id="btn">Conectar con WhatsApp Business</button>
<pre id="log"></pre>

<script>
var APP_ID = '__APP_ID__';
var CONFIG_ID = '__CONFIG_ID__';
var VERSION = '__VERSION__';

var code = null;
var wabaId = null;
var phoneNumberId = null;
var enviado = false;

function log(t) {
  document.getElementById('log').textContent += t + '\\n';
}

window.fbAsyncInit = function () {
  FB.init({ appId: APP_ID, autoLogAppEvents: true, xfbml: true, version: VERSION });
  log('SDK listo.');
};

// Meta avisa por aquí cuando el asesor termina el flujo y nos da el waba_id
window.addEventListener('message', function (event) {
  if (event.origin.indexOf('facebook.com') === -1) return;
  try {
    var data = JSON.parse(event.data);
    if (data.type === 'WA_EMBEDDED_SIGNUP') {
      log('Evento Meta: ' + JSON.stringify(data));
      if (data.data && data.data.waba_id) wabaId = data.data.waba_id;
      if (data.data && data.data.phone_number_id) phoneNumberId = data.data.phone_number_id;
      intentarEnviar();
    }
  } catch (e) { /* mensajes que no son JSON */ }
});

document.getElementById('btn').onclick = function () {
  code = null; wabaId = null; phoneNumberId = null; enviado = false;
  FB.login(function (response) {
    if (response.authResponse && response.authResponse.code) {
      code = response.authResponse.code;
      log('Code recibido.');
      intentarEnviar();
    } else {
      log('Login cancelado o sin code: ' + JSON.stringify(response));
    }
  }, {
    config_id: CONFIG_ID,
    response_type: 'code',
    override_default_response_type: true,
    extras: {
      setup: {},
      featureType: 'whatsapp_business_app_onboarding',
      sessionInfoVersion: '3'
    }
  });
};

function intentarEnviar() {
  if (enviado || !code || !wabaId) return;
  enviado = true;
  log('Enviando al back...');
  fetch('/whatsapp/coexistencia/onboarding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: code,
      waba_id: wabaId,
      phone_number_id: phoneNumberId,
      id_trabajador: Number(document.getElementById('idTrabajador').value)
    })
  })
  .then(function (r) { return r.json(); })
  .then(function (j) { log('Respuesta del back:\\n' + JSON.stringify(j, null, 2)); })
  .catch(function (e) { log('Error: ' + e.message); });
}
</script>
<script async defer crossorigin="anonymous" src="https://connect.facebook.net/es_LA/sdk.js"></script>
</body>
</html>`;

@Controller('whatsapp-prueba')
export class WhatsappPruebaController {
    @Get()
    @Header('Content-Type', 'text/html; charset=utf-8')
    pagina() {
        return HTML
            .replace('__APP_ID__', process.env.META_APP_ID ?? '')
            .replace('__CONFIG_ID__', process.env.META_CONFIG_ID ?? '1642802610692516')
            .replace('__VERSION__', process.env.WHATSAPP_API_VERSION ?? 'v25.0');
    }
}
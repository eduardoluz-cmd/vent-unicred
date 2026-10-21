// Tela de senha do protótipo (Vercel Routing Middleware).
// Toda visita passa por aqui antes de chegar aos arquivos de public/.
// A senha fica na variável de ambiente SITE_PASSWORD, configurada no painel da Vercel, nunca no código.
import { next } from '@vercel/functions';

export const config = {
  // Protege tudo, exceto os arquivos que a própria tela de senha usa (logo).
  matcher: '/((?!_acesso/).*)',
};

const COOKIE = 'vent_acesso';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

export default async function middleware(request) {
  const password = process.env.SITE_PASSWORD;
  if (!password) {
    return loginPage({ status: 503, error: 'O acesso ainda não foi configurado. Fale com o time VENT.', disabled: true });
  }

  const url = new URL(request.url);
  const token = await tokenFor(password);

  if (url.pathname === '/login') {
    if (request.method !== 'POST') return redirect('/');
    const form = await request.formData().catch(() => null);
    if (form?.get('senha') === password) {
      return redirect('/', `${COOKIE}=${token}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`);
    }
    return loginPage({ status: 401, error: 'Senha incorreta. Tente novamente.' });
  }

  if (readCookie(request, COOKIE) === token) return next();

  return loginPage({ status: 401 });
}

// O cookie guarda um hash da senha: trocar SITE_PASSWORD desconecta todo mundo.
async function tokenFor(password) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`vent-unicred:${password}`));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

function readCookie(request, name) {
  const match = (request.headers.get('cookie') || '').match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}

function redirect(location, cookie) {
  const headers = { Location: location, 'Cache-Control': 'no-store' };
  if (cookie) headers['Set-Cookie'] = cookie;
  return new Response(null, { status: 303, headers });
}

function loginPage({ status, error = '', disabled = false }) {
  const off = disabled ? 'disabled' : '';
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Acesso · Copiloto de Gestão de Agências</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@700;900&family=Roboto:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root { --green:#004A35; --green-dk:#003D2C; --green2:#018B6A; --gold-ink:#76672B; --ink:#0B2050; --ink3:#5C6A80; --line:#DCE2E7; --canvas:#EFF3F2; --red:#A8322A; --redlt:#F8E8E6; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px 16px; background: var(--canvas); color: var(--ink); font-family: Roboto, system-ui, sans-serif; }
  .card { width: 100%; max-width: 400px; background: #fff; border: 1px solid var(--line); border-top: 4px solid var(--green); border-radius: 12px; padding: 36px 32px 32px; box-shadow: 0 12px 32px rgba(0, 74, 53, .08); }
  .logo { display: block; height: 28px; margin-bottom: 28px; }
  h1 { margin: 0 0 6px; font-family: Lato, sans-serif; font-weight: 900; font-size: 22px; line-height: 1.25; color: var(--green); }
  .sub { margin: 0 0 24px; font-size: 14px; line-height: 1.5; color: var(--ink3); }
  label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; }
  input { width: 100%; height: 44px; padding: 0 12px; border: 1px solid var(--line); border-radius: 8px; font: inherit; font-size: 15px; color: var(--ink); }
  input:focus { outline: none; border-color: var(--green2); box-shadow: 0 0 0 3px rgba(1, 139, 106, .15); }
  button { width: 100%; height: 44px; margin-top: 16px; border: 0; border-radius: 8px; background: var(--green); color: #fff; font: inherit; font-size: 15px; font-weight: 500; cursor: pointer; }
  button:hover { background: var(--green-dk); }
  input:disabled, button:disabled { opacity: .5; cursor: not-allowed; }
  .erro { margin: 0 0 16px; padding: 10px 12px; border-radius: 8px; background: var(--redlt); color: var(--red); font-size: 13px; }
  footer { margin-top: 20px; font-size: 12px; color: var(--ink3); }
  footer b { color: var(--gold-ink); letter-spacing: .04em; }
</style>
</head>
<body>
<main class="card">
  <img class="logo" src="/_acesso/unicred.png" alt="Unicred">
  <h1>Copiloto de Gestão de Agências</h1>
  <p class="sub">Protótipo confidencial. Digite a senha de acesso que você recebeu.</p>
  ${error ? `<p class="erro" role="alert">${error}</p>` : ''}
  <form method="post" action="/login">
    <label for="senha">Senha de acesso</label>
    <input id="senha" name="senha" type="password" autocomplete="current-password" required autofocus ${off}>
    <button type="submit" ${off}>Entrar</button>
  </form>
</main>
<footer>Protótipo desenvolvido por <b>VENT</b></footer>
</body>
</html>`;
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

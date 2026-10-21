# Unicred · Copiloto de Gestão de Agências (demo)

Protótipo navegável da VENT para a Unicred, publicado na Vercel com senha de acesso.

## Como funciona

- `public/index.html`: o protótipo (HTML único, roda offline).
- `middleware.js`: a tela de senha. Toda visita passa por ela, e quem acerta a senha recebe um cookie válido por 7 dias.
- A senha **não fica no código**. Ela é a variável de ambiente `SITE_PASSWORD`, configurada na Vercel.

## Publicar uma nova versão do protótipo

1. Substitua `public/index.html` pelo HTML novo, mantendo o nome `index.html`.
2. Rode `git add public/index.html && git commit -m "Protótipo v6" && git push`.
3. A Vercel publica sozinha em cerca de 1 minuto, no mesmo link.

## Trocar a senha

Na Vercel: projeto → Settings → Environment Variables → edite `SITE_PASSWORD`. Depois vá em Deployments → ⋯ → Redeploy.
Ao trocar a senha, todo mundo que já tinha entrado é desconectado.

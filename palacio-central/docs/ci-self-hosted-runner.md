# Runner self-hosted â€œinfraâ€ (GitHub Actions)

Este runner te permite ejecutar el workflow `metrics-deploy.yml` con acceso SSH a tus servidores.

## Requisitos
- Nodo Ubuntu con acceso SSH y salida a Internet
- Usuario con sudo sin contraseÃ±a (o acceso a sudo interactivo)
- Clave SSH configurada para acceder a tus servidores de mÃ©tricas

## Pasos rÃ¡pidos (recomendado)
1) ObtÃ©n un token de registro de runner en GitHub:
   - Repo â†’ Settings â†’ Actions â†’ Runners â†’ New self-hosted runner â†’ Linux â†’ Copy token
2) ConÃ©ctate al nodo de gestiÃ³n (Hetzner) y ejecuta:
```bash
# Variables (ajusta owner/repo y etiquetas si quieres)
export GH_REPO_URL="https://github.com/golloschickens-collab/Goio-Store"
export RUNNER_TOKEN="<PEGA_AQUI_EL_TOKEN>"
export RUNNER_LABELS="self-hosted,linux,infra"

# Ejecuta el setup
bash palacio-central/scripts/ci/setup_runner.sh
```
3) Verifica en GitHub â†’ Actions â†’ Runners que aparezca online con etiqueta `infra`.

## Desinstalar
```bash
# Usa el mismo token (o genera uno nuevo) y el mismo directorio de trabajo
export GH_REPO_URL="https://github.com/golloschickens-collab/Goio-Store"
export RUNNER_TOKEN="<TOKEN>"
bash palacio-central/scripts/ci/remove_runner.sh
```

## Notas
- El workflow `palacio-central/.github/workflows/metrics-deploy.yml` usa `runs-on: [self-hosted, linux, infra]`.
- AsegÃºrate de que el runner tenga la clave SSH con acceso a los hosts (ai-masterkernel, goio-store, eco-eterno, gollos-server-1).
- Si quieres runners por organizaciÃ³n, adapta GH_REPO_URL a la org y usa runners de organizaciÃ³n.

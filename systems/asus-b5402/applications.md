---
kind: system
scope: system
status: draft
last_verified: 2026-09-22
verified_on: [asus-b5402]
---

# Приложения ASUS ExpertBook B5402

Записи перенесены из общих руководств и сверены с системой 2026-09-22.

- Firefox собран для Wayland с LLVM 22, аппаратным ускорением, PGO и
  profile-sync-daemon (psd активен, overlayfs). Текущие размеры профиля
  (2026-09-22): живой вид через overlay — ~653 MiB, upper-слой в
  `/run/user/1000/psd/` — ~168 MiB.
- GUI-приложения и Steam установлены через Flatpak (14 приложений, remote —
  flathub); разрешения выдаются через Flatseal с предпочтением Wayland.
- OBS Studio установлен через Flatpak (`com.obsproject.Studio` 32.2.2,
  проверено 2026-09-22). Package policy и настройки порта-стека остаются
  планом.
- Perplexity AppImage подключён через пользовательский `.desktop`
  (`~/.local/share/applications/perplexity.desktop`, схема
  `perplexity-app://` зарегистрирована); перенос конфигурации в chezmoi
  оставался планом.
- r2modman AppImage запускает Flatpak-версию Steam через wrapper
  `~/.local/bin/steam.sh` (`flatpak run com.valvesoftware.Steam "$@"`).

## Общие руководства

- [Firefox](../../settings/firefox.md)
- [Flatpak и Flatseal](../../settings/flatpak.md)
- [OBS Studio](../../settings/obs-studio.md)
- [Perplexity AppImage](../../settings/perplexity.md)
- [r2modman и Steam Flatpak](../../settings/r2modman.md)

---
kind: system
scope: system
status: draft
last_verified: null
verified_on: [asus-b5402]
---

# Приложения ASUS ExpertBook B5402

Записи ниже перенесены из общих руководств и требуют повторной проверки.

- Firefox собирался для Wayland с LLVM 22, аппаратным ускорением, PGO и
  profile-sync-daemon. Последние записанные размеры профиля и overlay — около
  235 MiB и 69 MiB.
- GUI-приложения и Steam устанавливались через Flatpak; разрешения выдавались
  через Flatseal с предпочтением Wayland.
- OBS Studio не был установлен; package policy и настройки оставались планом.
- Perplexity AppImage подключался через пользовательский `.desktop`; перенос
  конфигурации в chezmoi оставался планом.
- r2modman AppImage запускал Flatpak-версию Steam через wrapper в
  `~/.local/bin/`.

## Общие руководства

- [Firefox](../../settings/firefox.md)
- [Flatpak и Flatseal](../../settings/flatpak.md)
- [OBS Studio](../../settings/obs-studio.md)
- [Perplexity AppImage](../../settings/perplexity.md)
- [r2modman и Steam Flatpak](../../settings/r2modman.md)

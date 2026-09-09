---
kind: guide
scope: general
status: current
last_verified: null
verified_on: [asus-b5402]
---

# Настройка XDG Desktop Portals

Порталы обеспечивают взаимодействие приложений с композитором: захват экрана,
открытие файлов и уведомления. Выбранная на ASUS B5402 связка записана в
[системном разделе](../systems/asus-b5402/desktop/environment.md).

## 1. Необходимые пакеты

Для работы требуется связка из нескольких порталов:

- `gui-libs/xdg-desktop-portal` — Основной демон.
- `gui-libs/xdg-desktop-portal-gnome` (или gtk) — Для системных диалогов и тем.
- `gui-libs/xdg-desktop-portal-wlr` (или нативный портал Niri) — Для захвата экрана (Screencasting).

## 2. Конфигурация (portals.conf)

С выходом обновлений xdg-desktop-portal необходимо явно указывать, какой портал за что отвечает.

Файл: `~/.config/xdg-desktop-portal/niri-portals.conf` (или conf для конкретного десктопа)

```ini
[preferred]
default=gtk
org.freedesktop.impl.portal.ScreenCast=wlr
org.freedesktop.impl.portal.Screenshot=wlr
```

## 3. Интеграция с D-Bus

Niri должен запускаться в контексте D-Bus-сессии. Пример ниже импортирует
переменные окружения в пользовательский systemd manager.

Убедитесь, что при запуске Niri импортируются переменные окружения:

```bash
# В конфиге niri (spawn-at-startup)
spawn-sh-at-startup "dbus-update-activation-environment --systemd WAYLAND_DISPLAY XDG_CURRENT_DESKTOP=niri"
```

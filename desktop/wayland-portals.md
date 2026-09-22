---
kind: guide
scope: general
status: current
last_verified: 2026-09-22
verified_on: [asus-b5402]
---

# Настройка XDG Desktop Portals

Порталы обеспечивают взаимодействие приложений с композитором: захват экрана,
открытие файлов и уведомления. Выбранная на ASUS B5402 связка записана в
[системном разделе](../systems/asus-b5402/desktop/environment.md).

## 1. Необходимые пакеты

Для работы требуется связка из нескольких порталов:

- `sys-apps/xdg-desktop-portal` — основной демон.
- `sys-apps/xdg-desktop-portal-gtk` — системные диалоги (FileChooser, AppChooser, Settings).
- `sys-apps/xdg-desktop-portal-gnome` — ScreenCast и Screenshot: Niri реализует mutter ScreenCast D-Bus API, который обслуживает именно GNOME-бэкенд.
- `gui-libs/xdg-desktop-portal-wlr` — альтернатива для окружений на wlr-протоколах; на Niri не используется.

## 2. Конфигурация (portals.conf)

С выходом обновлений xdg-desktop-portal необходимо явно указывать, какой портал за что отвечает.

Файл: `~/.config/xdg-desktop-portal/niri-portals.conf` (проверен на asus-b5402 2026-09-22)

```ini
[preferred]
# По умолчанию используем GTK, он самый стабильный для общих задач
default=gtk
# Специфичные вещи для Niri
org.freedesktop.impl.portal.Screenshot=gnome
# шаринг окон
org.freedesktop.impl.portal.ScreenCast=gnome
# GTK
org.freedesktop.impl.portal.FileChooser=gtk
org.freedesktop.impl.portal.AppChooser=gtk
# чтобы звук и уведомления точно шли через GTK бэкенд
org.freedesktop.impl.portal.Settings=gtk
```

## 3. Интеграция с D-Bus

Niri должен запускаться в контексте D-Bus-сессии. Пример ниже импортирует
переменные окружения в пользовательский systemd manager.

Убедитесь, что при запуске Niri импортируются переменные окружения:

```bash
# В конфиге niri (spawn-at-startup)
spawn-sh-at-startup "dbus-update-activation-environment --systemd WAYLAND_DISPLAY XDG_CURRENT_DESKTOP=niri"
```

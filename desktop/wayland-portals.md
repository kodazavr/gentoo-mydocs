---
kind: guide
scope: general
status: current
last_verified: 2026-09-22
verified_on: [asus-b5402]
---

# XDG Desktop Portals

Порталы — прослойка между приложениями и рабочим столом: захват экрана,
скриншоты, выбор файлов, уведомления, настройки внешнего вида. Главный вопрос
здесь: какие portal-бэкенды нужны Niri и кто за что отвечает.

```text
xdg-desktop-portal       = frontend, с ним работают приложения
xdg-desktop-portal-gtk   = common desktop portals
xdg-desktop-portal-gnome = Niri screencast / screenshot path
```

Выбранная на эталонной системе ASUS B5402 связка записана в
[системном разделе](../systems/asus-b5402/desktop/environment.md).

## Required components

- `sys-apps/xdg-desktop-portal` — frontend: D-Bus-сервис, с которым работают
  приложения; по конфигурации выбирает бэкенды.
- `sys-apps/xdg-desktop-portal-gtk` — общие порталы: FileChooser, AppChooser,
  Settings и другие диалоги.
- `sys-apps/xdg-desktop-portal-gnome` — ScreenCast и Screenshot: Niri
  реализует mutter ScreenCast D-Bus API, и его обслуживает именно
  GNOME-бэкенд.

`gui-libs/xdg-desktop-portal-wlr` для Niri не нужен: это бэкенд для
композиторов на wlr-протоколах (wlr-screencopy), а Niri использует
mutter-совместимый путь через GNOME-бэкенд.

## Backend routing (portals.conf)

Кто какой интерфейс обслуживает, задаётся в `portals.conf`. Имя файла
выбирается по `XDG_CURRENT_DESKTOP`: для Niri это `niri`, поэтому файл
называется `~/.config/xdg-desktop-portal/niri-portals.conf`.

```ini
[preferred]
# Fallback для интерфейсов без явного правила
default=gtk
# Screencast и скриншоты — через GNOME-бэкенд
org.freedesktop.impl.portal.ScreenCast=gnome
org.freedesktop.impl.portal.Screenshot=gnome
# Общие диалоги — GTK
org.freedesktop.impl.portal.FileChooser=gtk
org.freedesktop.impl.portal.AppChooser=gtk
# Настройки внешнего вида для приложений
org.freedesktop.impl.portal.Settings=gtk
```

- `default=gtk` — запасной вариант для интерфейсов, не перечисленных выше.
- `ScreenCast`/`Screenshot` идут через GNOME-бэкенд.
- `Settings` — портал настроек рабочего стола (тёмная тема, цветовая схема
  и т.п.), который приложения читают; он не является маршрутизатором звука
  или уведомлений.

## Session integration

При запуске через [`niri-session`](niri.md) вручную ничего делать не нужно:
session environment (`WAYLAND_DISPLAY`, `XDG_CURRENT_DESKTOP` и остальные)
уже импортирован в systemd user manager и D-Bus activation environment, и
порталы, запущенные systemd/D-Bus, видят сессию.

Ручной `dbus-update-activation-environment` — не часть нормального пути
запуска через `niri-session`; он нужен только при нестандартном способе
запуска (см. Troubleshooting).

## Verification

Проверки read-only, сервисы перезапускать не нужно.

```bash
# Сессия представилась как niri — по этому имени выбран niri-portals.conf
echo "$XDG_CURRENT_DESKTOP"

# Frontend и бэкенды запущены как user-сервисы
systemctl --user status xdg-desktop-portal.service \
                      xdg-desktop-portal-gtk.service \
                      xdg-desktop-portal-gnome.service
```

Практическая проверка screencast: открыть выбор источника захвата в браузере
или OBS — в списке должны быть отдельные окна Niri.

## Troubleshooting

- Порталы не видят сессию (пустой список экранов, порталы падают) при
  нестандартном запуске Niri без `niri-session` (например, голый `niri` из
  tty): импортируйте окружение вручную и перезапустите frontend:

  ```bash
  dbus-update-activation-environment --systemd WAYLAND_DISPLAY XDG_CURRENT_DESKTOP
  systemctl --user restart xdg-desktop-portal.service
  ```

- Изменённый `niri-portals.conf` применяется после перезапуска порталов или
  перелогина.

## Related docs

- [Niri](niri.md) — запуск сессии.
- [Рабочее окружение ASUS B5402](../systems/asus-b5402/desktop/environment.md)
  — фактическое состояние.

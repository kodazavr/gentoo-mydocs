---
kind: system
scope: system
status: draft
last_verified: 2026-09-22
verified_on: [asus-b5402]
---

# Рабочее окружение ASUS ExpertBook B5402

Запись перенесена из общих руководств; раздел polkit-агента проверен на
живой системе 2026-09-21, остальное перед использованием нужно сверить с
установленными пакетами и конфигурацией.

## Записанное состояние

- Основной композитор — Niri в чистой Wayland-сессии, запуск через greetd и
  tuigreet.
- Для порталов выбраны GTK и GNOME (проверено 2026-09-22): GTK обслуживает
  FileChooser/AppChooser/Settings, GNOME (`sys-apps/xdg-desktop-portal-gnome`,
  поверх реализованного в Niri mutter ScreenCast D-Bus API) — ScreenCast и
  Screenshot. WLR-портал не установлен.
- В пользовательской GTK4-конфигурации импортируется палитра Noctalia из
  `~/.config/gtk-4.0/noctalia.css`; предпочтение тёмной темы задано в
  `~/.config/gtk-4.0/settings.ini`.

## Polkit authentication agent

Проверено на живой системе 2026-09-21.

- Agent запускается системным XDG autostart
  (`/etc/xdg/autostart/polkit-gnome-authentication-agent-1.desktop`),
  который Niri как systemd session поднимает через
  `xdg-desktop-autostart.target`.
- 2026-09-21: дублирующий ручной запуск
  (`spawn-sh-at-startup "/usr/libexec/polkit-gnome-authentication-agent-1 &"`)
  закомментирован в `~/.config/niri/autostart.kdl`. Причина: upstream
  polkit допускает только один authentication agent на subject, второй
  экземпляр завершался ошибкой регистрации (`An authentication agent
  already exists for the given subject`). Цель — ровно один agent на
  пользовательскую сессию.
- 2026-09-22: расследование сессии от 2026-09-21 22:48 показало, что
  рабочий агент порождал не ручной spawn, а цепочка из niri: агент жил в
  cgroup `niri.service` с её `INVOCATION_ID`, после чего autostart-юнит
  падал с той же ошибкой регистрации. Этот spawn в конфиге niri
  закомментирован владельцем 2026-09-22. В текущей сессии юнит остаётся
  failed — исправление вступает при следующем перелогине.
- Runtime-проверка после следующего перелогина — pending: ожидание —
  `app-polkit-gnome-authentication-agent-1@autostart.service` в состоянии
  active и ровно один процесс `polkit-gnome-authentication-agent-1`.
- Наблюдение: polkitd (`sys-auth/polkit-126-r3`) при старте логирует
  отсутствие `/run/polkit-1/rules.d` и `/usr/local/share/polkit-1/rules.d`
  при полностью рабочем polkit — benign startup-сообщение; создавать пустые
  каталоги ради чистого журнала не нужно.

Источники: [polkit — polkitbackendinteractiveauthority.c](https://gitlab.freedesktop.org/polkit/polkit/-/blob/master/src/polkitbackend/polkitbackendinteractiveauthority.c),
[Niri wiki — Integrating niri](https://github.com/YaLTeR/niri/wiki/Integrating-niri).

## Общие руководства

- [Niri](../../../desktop/niri.md)
- [XDG Desktop Portals](../../../desktop/wayland-portals.md)
- [GTK4 и палитра Noctalia](../../../settings/gtk.md)


---
kind: system
scope: system
status: draft
last_verified: null
verified_on: [asus-b5402]
---

# Рабочее окружение ASUS ExpertBook B5402

Запись перенесена из общих руководств; раздел polkit-агента проверен на
живой системе 2026-09-21, остальное перед использованием нужно сверить с
установленными пакетами и конфигурацией.

## Записанное состояние

- Основной композитор — Niri в чистой Wayland-сессии, запуск через greetd и
  tuigreet.
- Для порталов выбраны GTK и WLR: GTK обслуживает общие диалоги, WLR —
  ScreenCast и Screenshot.
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
- Runtime-проверка фикса после новой Niri-сессии — pending: текущая сессия
  началась до правки, и в ней юнит
  `app-polkit-gnome-authentication-agent-1@autostart.service` числится
  failed, хотя запущен ровно один экземпляр агента. После перелогина
  проверить: один процесс `polkit-gnome-authentication-agent-1` и unit в
  состоянии active.
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


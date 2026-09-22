---
kind: system
scope: system
status: draft
last_verified: 2026-09-22
verified_on: [asus-b5402]
---

# Рабочее окружение ASUS ExpertBook B5402

## Current state

- Desktop: Niri, чистая Wayland-сессия.
- Session: greetd + tuigreet.
- Shell: Noctalia.
- Portals: GTK → FileChooser/AppChooser/Settings; GNOME → ScreenCast/Screenshot.
- WLR portal: не установлен.
- GTK theme: палитра Noctalia в `~/.config/gtk-4.0/`.
- Polkit agent: ровно один процесс
  `polkit-gnome-authentication-agent-1`; конфликт дублирующихся агентов
  устранён.

Запись перенесена из общих руководств; раздел polkit-агента сверен с живой
системой 2026-09-21 и 2026-09-22, остальное перед использованием нужно сверить
с установленными пакетами и конфигурацией.

## Portals

Для порталов выбраны GTK и GNOME (проверено 2026-09-22):

- GTK обслуживает FileChooser, AppChooser и Settings.
- GNOME (`sys-apps/xdg-desktop-portal-gnome`, поверх реализованного в Niri
  mutter ScreenCast D-Bus API) — ScreenCast и Screenshot.
- WLR-портал не установлен.

## GTK

- `~/.config/gtk-4.0/noctalia.css` — палитра Noctalia; импортируется в
  пользовательскую GTK4-конфигурацию.
- `~/.config/gtk-4.0/settings.ini` — предпочтение тёмной темы.

## Polkit authentication agent

В текущей сессии работает ровно один процесс
`polkit-gnome-authentication-agent-1` (подтверждено `pgrep -af` после
перелогина 2026-09-22); конфликт дублирующихся агентов устранён. Цель — ровно
один agent на пользовательскую сессию.

Точный источник запуска работающего процесса по имеющимся данным не установлен.
Проектный путь — системный XDG autostart
(`/etc/xdg/autostart/polkit-gnome-authentication-agent-1.desktop`), который
Niri как systemd session поднимает через `xdg-desktop-autostart.target`.

- Ручной spawn из конфигурации Niri убран: строка
  `spawn-sh-at-startup "/usr/libexec/polkit-gnome-authentication-agent-1 &"`
  закомментирована в `~/.config/niri/autostart.kdl`.
- Юнит `app-polkit-gnome-authentication-agent-1@autostart.service` в текущей
  user manager-сессии не существует (`systemctl --user status` — «could not be
  found»), поэтому прежний критерий проверки «юнит становится active» больше
  не используется и каноническим не является.
- Сообщения polkitd (`sys-auth/polkit-126-r3`) об отсутствии
  `/run/polkit-1/rules.d` и `/usr/local/share/polkit-1/rules.d` — benign
  startup-сообщения при полностью рабочем polkit; создавать пустые каталоги
  ради чистого журнала не нужно.

### Investigation notes (2026-09-21/22)

- 2026-09-21: дублирующий ручной запуск закомментирован. Причина: upstream
  polkit допускает только один authentication agent на subject, второй
  экземпляр завершался ошибкой регистрации (`An authentication agent already
  exists for the given subject`).
- 2026-09-22: расследование сессии от 2026-09-21 22:48 показало, что рабочий
  агент порождал не ручной spawn, а цепочка из niri: агент жил в cgroup
  `niri.service` с её `INVOCATION_ID`, после чего autostart-юнит падал с той
  же ошибкой регистрации. Этот spawn в конфиге niri закомментирован владельцем
  2026-09-22.
- Runtime-проверка после перелогина (2026-09-22) закрыта в части «ровно один
  агент» (см. выше); статус XDG-generated-юнита и источник запуска работающего
  процесса по имеющимся данным не устанавливаются.

Источники: [polkit — polkitbackendinteractiveauthority.c](https://gitlab.freedesktop.org/polkit/polkit/-/blob/master/src/polkitbackend/polkitbackendinteractiveauthority.c),
[Niri wiki — Integrating niri](https://github.com/YaLTeR/niri/wiki/Integrating-niri).

## Общие руководства

- [Niri](../../../desktop/niri.md)
- [XDG Desktop Portals](../../../desktop/wayland-portals.md)
- [GTK4 и палитра Noctalia](../../../settings/gtk.md)

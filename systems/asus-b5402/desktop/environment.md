---
kind: system
scope: system
status: draft
last_verified: null
verified_on: [asus-b5402]
---

# Рабочее окружение ASUS ExpertBook B5402

Запись перенесена из общих руководств без проверки живой системы. Перед
использованием её нужно сверить с установленными пакетами и конфигурацией.

## Записанное состояние

- Основной композитор — Niri в чистой Wayland-сессии, запуск через greetd и
  tuigreet.
- Для порталов выбраны GTK и WLR: GTK обслуживает общие диалоги, WLR —
  ScreenCast и Screenshot.
- В пользовательской GTK4-конфигурации импортируется палитра Noctalia из
  `~/.config/gtk-4.0/noctalia.css`; предпочтение тёмной темы задано в
  `~/.config/gtk-4.0/settings.ini`.

## Общие руководства

- [Niri](../../../desktop/niri.md)
- [XDG Desktop Portals](../../../desktop/wayland-portals.md)
- [GTK4 и палитра Noctalia](../../../settings/gtk.md)


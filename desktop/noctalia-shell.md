# Noctalia v5 для Niri

Noctalia — нативная Wayland-оболочка вокруг Niri: панель и dock, launcher,
Control Center, уведомления, обои, экран блокировки, OSD и clipboard history.
Серия v5 больше не использует Quickshell/QML: конфигурация хранится в TOML,
а IPC вызывается через `noctalia msg`.

## 1. Конфигурация и state

Собственный TOML Noctalia читает из `~/.config/noctalia/`. Все `*.toml` в
этом каталоге объединяются; один `config.toml` — базовая и предпочтительная
для этой машины конфигурация.

Настройки, изменённые через GUI, сохраняются в
`~/.local/state/noctalia/settings.toml` и имеют более высокий приоритет.
Если значение из `config.toml` не применяется, сначала проверь этот файл.

## Ссылки

- [Noctalia v5: установка для Gentoo](https://docs.noctalia.dev/noctalia/getting-started/installation/)
- [Noctalia v5: модель конфигурации и проверка TOML](https://docs.noctalia.dev/noctalia/configuration/)
- [Noctalia v5: palettes и перенос цветовой схемы v4](https://docs.noctalia.dev/noctalia/theming/palette/)
- [Noctalia v5: исходный код и статус beta](https://github.com/noctalia-dev/noctalia)

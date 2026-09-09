---
kind: guide
scope: general
status: current
last_verified: 2026-09-09
verified_on: [asus-b5402]
---

# Noctalia v5 для Niri

Noctalia — нативная Wayland-оболочка вокруг Niri: панель и dock, launcher,
Control Center, уведомления, обои, экран блокировки, OSD и clipboard history.
Серия v5 больше не использует Quickshell/QML: конфигурация хранится в TOML,
а IPC вызывается через `noctalia msg`.

Проверенная конфигурация ASUS B5402 описана отдельно в
[системном журнале](../systems/asus-b5402/desktop/noctalia.md).

## 1. Репозиторий и обновление

В Gentoo пакет доступен через репозиторий GURU. После подключения репозитория
его метаданные и Noctalia можно обновить отдельно от всей системы:

```bash
doas emaint sync -r guru
doas emerge --ask --verbose --update --oneshot gui-apps/noctalia
```

Если Portage сообщает, что пакет или его зависимость замаскированы по keyword,
добавь только запрошенные правила в отдельный файл внутри
`/etc/portage/package.accept_keywords/`. Не копируй список с другой системы
без проверки текущего плана Portage.

Проверка установленной версии и источника:

```bash
noctalia --version
cat /var/db/pkg/gui-apps/noctalia-*/repository
```

Первая команда должна вывести установленную версию, вторая — имя репозитория,
из которого Portage установил пакет.

## 2. Конфигурация и состояние

Собственный TOML Noctalia читает из `~/.config/noctalia/`. Все `*.toml` в
этом каталоге объединяются. Файл `config.toml` подходит для базовой
конфигурации, которую нужно хранить явно.

Настройки, изменённые через GUI, сохраняются в
`~/.local/state/noctalia/settings.toml` и имеют более высокий приоритет.
Если значение из `config.toml` не применяется, сначала проверь этот файл.

## 3. Ссылки

- [Официальный релиз Noctalia v5.0.1](https://github.com/noctalia-dev/noctalia/releases/tag/v5.0.1)
- [Noctalia v5: установка для Gentoo](https://docs.noctalia.dev/noctalia/getting-started/installation/)
- [Noctalia v5: модель конфигурации и проверка TOML](https://docs.noctalia.dev/noctalia/configuration/)
- [Noctalia v5: palettes и перенос цветовой схемы v4](https://docs.noctalia.dev/noctalia/theming/palette/)
- [Noctalia v5: исходный код](https://github.com/noctalia-dev/noctalia)

# Noctalia v5 для Niri

Noctalia — нативная Wayland-оболочка вокруг Niri: панель и dock, launcher,
Control Center, уведомления, обои, экран блокировки, OSD и clipboard history.
Серия v5 больше не использует Quickshell/QML: конфигурация хранится в TOML,
а IPC вызывается через `noctalia msg`.

На этой системе пакет `gui-apps/noctalia-5.0.1` установлен из репозитория
`::guru`. Прежний локальный overlay `noctalia-local` удалён.

## 1. Репозиторий и обновление

GURU уже подключён в Portage. Обновить метаданные репозитория и Noctalia можно
отдельно от полного обновления системы:

```bash
doas emaint sync -r guru
doas emerge --ask --verbose --update --oneshot gui-apps/noctalia
```

Пакет пока требует `~amd64`. Разрешение хранится в файле
`/etc/portage/package.accept_keywords/noctalia`:

```text
gui-apps/noctalia                ~amd64
dev-cpp/sdbus-c++                ~amd64
```

Проверка установленной версии и источника:

```bash
noctalia --version
cat /var/db/pkg/gui-apps/noctalia-*/repository
```

Ожидаемый результат: Noctalia `5.0.1`, репозиторий `guru`.

## 2. Конфигурация и state

Собственный TOML Noctalia читает из `~/.config/noctalia/`. Все `*.toml` в
этом каталоге объединяются; один `config.toml` — базовая и предпочтительная
для этой машины конфигурация.

Настройки, изменённые через GUI, сохраняются в
`~/.local/state/noctalia/settings.toml` и имеют более высокий приоритет.
Если значение из `config.toml` не применяется, сначала проверь этот файл.

## 3. Ссылки

- [Официальный релиз Noctalia v5.0.1](https://github.com/noctalia-dev/noctalia/releases/tag/v5.0.1)
- [Noctalia v5: установка для Gentoo](https://docs.noctalia.dev/noctalia/getting-started/installation/)
- [Noctalia v5: модель конфигурации и проверка TOML](https://docs.noctalia.dev/noctalia/configuration/)
- [Noctalia v5: palettes и перенос цветовой схемы v4](https://docs.noctalia.dev/noctalia/theming/palette/)
- [Noctalia v5: исходный код](https://github.com/noctalia-dev/noctalia)

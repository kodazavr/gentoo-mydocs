---
kind: guide
scope: general
status: current
last_verified: 2026-09-14
verified_on: [asus-b5402]
---

# Приложения по умолчанию и MIME-типы (XDG)

`xdg-mime` задаёт, какое приложение открывает ссылку, документ или файл
определённого MIME-типа. Настройки действуют для пользовательской сессии и не
зависят от Wayland-композитора. Приложения, включая Flatpak, обычно используют
эти XDG-ассоциации при открытии внешних ссылок.

## 1. Перед настройкой

Узнай текущего обработчика для нужного типа:

```bash
xdg-mime query default x-scheme-handler/http
xdg-mime query default x-scheme-handler/https
xdg-mime query default text/html
xdg-mime query default application/pdf
```

Команды возвращают ID desktop-файла, например `firefox.desktop` или
`com.google.Chrome.desktop`. Он не обязан совпадать с именем исполняемого
файла.

> **Примечание**: для ассоциации нужен установленный desktop-файл. Локальные
> файлы обычно находятся в `~/.local/share/applications/`, системные — в
> `/usr/share/applications/`.

## 2. Базовые ассоциации

Следующий набор подходит для Firefox, qimgv и mpv:

| Тип | Приложение | Desktop ID |
|-----|------------|------------|
| HTTP(S)-ссылки и HTML | Firefox | `firefox.desktop` |
| PDF | Firefox | `firefox.desktop` |
| JPEG, PNG, GIF, WebP, BMP | qimgv | `qimgv.desktop` |
| Аудио и видео | mpv | `mpv.desktop` |

Установить Firefox обработчиком ссылок, HTML и PDF:

```bash
xdg-mime default firefox.desktop x-scheme-handler/http
xdg-mime default firefox.desktop x-scheme-handler/https
xdg-mime default firefox.desktop text/html
xdg-mime default firefox.desktop application/xhtml+xml
xdg-mime default firefox.desktop application/pdf
```

Установить qimgv обработчиком распространённых форматов изображений:

```bash
xdg-mime default qimgv.desktop image/jpeg
xdg-mime default qimgv.desktop image/png
xdg-mime default qimgv.desktop image/gif
xdg-mime default qimgv.desktop image/webp
xdg-mime default qimgv.desktop image/bmp
```

Если mpv ещё не выбран, назначить его для используемых аудио- и видеоформатов:

```bash
xdg-mime default mpv.desktop audio/mpeg
xdg-mime default mpv.desktop audio/ogg
xdg-mime default mpv.desktop audio/flac
xdg-mime default mpv.desktop video/mp4
xdg-mime default mpv.desktop video/webm
xdg-mime default mpv.desktop video/x-matroska
```

## 3. URI-схемы отдельных приложений

Протоколы вида `perplexity-app://`, `tg://` или `steam://` назначай в
документации соответствующего приложения. Для них используется тот же формат:

```bash
xdg-mime default <application>.desktop x-scheme-handler/<scheme>
xdg-mime query default x-scheme-handler/<scheme>
```

См. [Perplexity AppImage](../settings/perplexity.md) и
[r2modman](../settings/r2modman.md).

## 4. Проверка и хранение настроек

Проверь получившиеся ассоциации:

```bash
xdg-mime query default x-scheme-handler/http
xdg-mime query default x-scheme-handler/https
xdg-mime query default text/html
xdg-mime query default application/pdf
xdg-mime query default image/png
xdg-mime query default video/mp4
```

`xdg-mime` сохраняет результат в пользовательском `mimeapps.list`, обычно в
`~/.config/mimeapps.list`. Настройка сохраняется между перезагрузками, но её
может изменить интерфейс рабочего стола или другое приложение. Если файл
управляется через dotfiles, перед добавлением проверь, что перечисленные
desktop-файлы существуют на целевой системе.

Чтобы заменить обработчик, повтори команду `xdg-mime default` с другим
desktop ID. Ручное редактирование `mimeapps.list` обычно не требуется.

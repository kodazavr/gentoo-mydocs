---
kind: guide
scope: general
status: draft
last_verified: null
verified_on: [asus-b5402]
---

# Perplexity (AppImage) в меню приложений Niri/Wayland

> Интеграция Perplexity AppImage в меню приложений на Wayland. Записанная
> конфигурация ASUS B5402 находится в
> [`systems/asus-b5402/applications.md`](../systems/asus-b5402/applications.md).

---

## Проблема

Perplexity распространяется как AppImage. После скачивания его нужно:

- поместить в постоянное место;
- сделать исполняемым;
- добавить в меню приложений (`.desktop`);
- настроить нативный Wayland-запуск, если в целевой системе отключён XWayland.

---

## Что понадобится

- Скачанный `Perplexity-*.AppImage`
- `sys-fs/fuse` или `sys-fs/fuse-static` для запуска AppImage
- `xdg-utils` для регистрации обработчика схемы `perplexity-app://`

Проверка наличия fuse:

```bash
which fusermount
```

---

## 1. Подготовка AppImage

Перемещаем AppImage в `~/.local/bin/` и даём права на исполнение:

```bash
mv ~/Downloads/Perplexity-1.6.0-x86_64.AppImage ~/.local/bin/Perplexity.AppImage
chmod +x ~/.local/bin/Perplexity.AppImage
```

> **Примечание**: версия в имени файла может отличаться. При обновлении заменяй файл и обновляй `Exec=` в `.desktop`, если путь изменился.

---

## 2. Извлечение иконки

AppImage содержит иконки внутри `squashfs-root/usr/share/icons/hicolor/`. Извлекаем их во временную директорию и копируем в `~/.local/share/icons/`:

```bash
cd /tmp
rm -rf perplexity-extract
mkdir perplexity-extract && cd perplexity-extract
~/.local/bin/Perplexity.AppImage --appimage-extract >/dev/null 2>&1

for size in 16 32 48 64 128 256 512 1024; do
  mkdir -p "$HOME/.local/share/icons/hicolor/${size}x${size}/apps"
  cp "squashfs-root/usr/share/icons/hicolor/${size}x${size}/apps/Perplexity.png" \
     "$HOME/.local/share/icons/hicolor/${size}x${size}/apps/Perplexity.png"
done
```

---

## 3. Создание .desktop файла

Файл: `~/.local/share/applications/perplexity.desktop`

```ini
[Desktop Entry]
Name=Perplexity
Comment=AI-powered search and chat
Exec=env ELECTRON_OZONE_PLATFORM_HINT=wayland /home/<username>/.local/bin/Perplexity.AppImage --ozone-platform=wayland --no-sandbox %U
Terminal=false
Type=Application
Icon=Perplexity
StartupWMClass=Perplexity
X-AppImage-Version=1.6.0
MimeType=x-scheme-handler/perplexity-app;
Categories=Network;Chat;
TryExec=/home/<username>/.local/bin/Perplexity.AppImage
```

> **Важно**: `StartupWMClass=Perplexity` взят из внутреннего `.desktop` AppImage. Это позволяет Noctalia/Niri корректно группировать окно приложения.

Ключевые параметры Wayland:

- `ELECTRON_OZONE_PLATFORM_HINT=wayland` — говорит Electron использовать Ozone/Wayland.
- `--ozone-platform=wayland` — дублирует выбор бэкенда на уровне командной строки.
- `--no-sandbox` — требуется AppImage, так как внутри него нет SUID sandbox.

---

## 4. Регистрация в системе

Обновляем кэш `.desktop` файлов и регистрируем обработчик ссылки `perplexity-app://`:

```bash
update-desktop-database ~/.local/share/applications/
xdg-mime default perplexity.desktop x-scheme-handler/perplexity-app
```

Проверка:

```bash
xdg-mime query default x-scheme-handler/perplexity-app
# Ожидаемый вывод: perplexity.desktop
```

---

## 5. Проверка запуска

Пробуем запустить из терминала:

```bash
gtk-launch perplexity.desktop
```

Или напрямую:

```bash
~/.local/bin/Perplexity.AppImage
```

Если окно появилось и работает нативно на Wayland — интеграция успешна.

Проверить бэкенд можно через:

```bash
WAYLAND_DEBUG=1 ~/.local/bin/Perplexity.AppImage 2>&1 | head -20
```

Должны быть сообщения о Wayland, а не X11.

---

## Возможные проблемы

### AppImage не запускается: `FUSE` не найден

Установи fuse:

```bash
doas emerge -av sys-fs/fuse
```

Альтернатива — распаковать AppImage и запускать `squashfs-root/AppRun`:

```bash
cd ~/.local/bin
./Perplexity.AppImage --appimage-extract
# Затем запускать через ~/.local/bin/squashfs-root/AppRun
```

### Мигает/не рисуется интерфейс на Wayland

Попробуй добавить `--enable-features=UseOzonePlatform` в `Exec=`:

```ini
Exec=env ELECTRON_OZONE_PLATFORM_HINT=wayland /home/<username>/.local/bin/Perplexity.AppImage --ozone-platform=wayland --enable-features=UseOzonePlatform --no-sandbox %U
```

Если не помогает — временно вернуть через XWayland (потребуется `gui-wm/xwayland` и USE-флаг `xwayland`).

### Иконка не отображается в меню

Проверь, что иконка лежит в `~/.local/share/icons/hicolor/256x256/apps/Perplexity.png`, и обнови кэш:

```bash
gtk-update-icon-cache ~/.local/share/icons/hicolor/
```

### Ссылки `perplexity-app://` не открываются

Проверь регистрацию:

```bash
xdg-mime query default x-scheme-handler/perplexity-app
```

Если пусто — повтори:

```bash
xdg-mime default perplexity.desktop x-scheme-handler/perplexity-app
```

---

## Связанные документы

- [flatpak](flatpak.md) — другие GUI-приложения в системе устанавливаются через Flatpak.
- [r2modman](r2modman.md) — пример интеграции AppImage со Steam Flatpak.
- [niri](../desktop/niri.md) — конфигурация Wayland-композитора.
- [Приложения по умолчанию](../desktop/default-applications.md) — общие MIME-ассоциации и URI-схемы через XDG.

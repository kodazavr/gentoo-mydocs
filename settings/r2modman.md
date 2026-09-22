---
kind: troubleshooting
scope: general
status: current
last_verified: 2026-09-22
verified_on: [asus-b5402]
---

# Запуск r2modman AppImage со Steam Flatpak в Gentoo/Niri

Записанное игровое окружение ASUS B5402 находится в
[`systems/asus-b5402/applications.md`](../systems/asus-b5402/applications.md).

## Данный гайд описывает решение проблемы интеграции r2modman (запущенного как AppImage) со Steam, установленным через Flatpak, в окружении с Wayland/Niri

### Проблема

По умолчанию r2modman пытается вызвать бинарник steam или запустить steam.sh напрямую из директории Steam. В случае с Flatpak исполняемого файла steam в системе нет, а прямой запуск скрипта из песочницы Flatpak в хост-системе Gentoo ломается из-за отсутствия рантайма (ошибка DISTRIB_RELEASE: unbound variable).

### Решение

1. Создание Steam Wrapper (Скрипта-прослойки)
Создаем скрипт, который будет перехватывать вызовы r2modman и корректно пробрасывать их внутрь Flatpak.
Файл: ~/.local/bin/steam (или steam.sh)

```bash
# !/bin/bash

# Пробрасываем все аргументы ($@) внутрь контейнера Flatpak

flatpak run com.valvesoftware.Steam "$@"

Права на исполнение:
chmod +x ~/.local/bin/steam
```

2. Настройка PATH
Убедитесь, что ~/.local/bin находится в начале переменной $PATH. Для Fish shell:

```bash
fish_add_path ~/.local/bin
```

3. Конфигурация r2modman
В интерфейсе r2modman (Settings -> Locations/Linux) необходимо убедиться, что:

* Steam Directory: Указывает на внутреннюю папку Flatpak:
   ~/.var/app/com.valvesoftware.Steam/.local/share/Steam
* Steam Command: (если доступно в версии) установлено в steam или полный путь /home/<username>/.local/bin/steam.

4. Параметры запуска в Steam (BepInEx Fix)
Чтобы Proton разрешил загрузку BepInEx, в свойствах Risk of Rain 2 в Steam необходимо установить параметры запуска:
WINEDLLOVERRIDES="winhttp=n,b" %command%

### Дополнительная диагностика
Если игра не запускается, проверьте обработку ссылок в терминале:

> Должен открыться Steam на странице игры

```bash 
xdg-open steam://rungameid/632360
```

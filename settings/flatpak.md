---
kind: guide
scope: general
status: current
last_verified: 2026-09-22
verified_on: [asus-b5402]
---

# Управление приложениями: Flatpak & Flatseal

Flatpak изолирует GUI-приложения и упрощает установку программ, которых нет в
основном дереве Gentoo. Локальная политика ASUS B5402 записана в
[системном разделе](../systems/asus-b5402/applications.md).

## 1. Установка и базовая настройка

Для работы Flatpak в Gentoo необходим пакет `sys-apps/flatpak` с включенным USE-флагом systemd.

```bash
# Добавление репозитория Flathub
flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
```

## 2. Flatseal: Тонкая настройка прав

Flatseal — это графическая утилита для управления разрешениями Flatpak-пакетов.

Для Wayland и Niri проверь следующие разрешения:

- **Socket**: Отключаем x11 и fallback-x11, оставляем только wayland. Это гарантирует, что приложение не будет пытаться запустить XWayland.
- **Filesystem**: Для приложений вроде Discord или Obsidian разрешаем доступ только к нужным папкам (например, `xdg-run/app/com.discordapp.Discord`), а не ко всему home.
- **Environment**: Прописываем переменные для принудительного Wayland (например, `MOZ_ENABLE_WAYLAND=1` для Firefox).

## Steam и Игры

Steam — одно из немногих приложений, которое может требовать multilib (32-бит) и специфичного доступа к железу.

### 1. Особенности запуска в Flatpak

Установка Steam через Flatpak избавляет от необходимости включать 32-битную архитектуру глобально в системе (в профиле Gentoo).

```bash
flatpak install flathub com.valvesoftware.Steam
```

### 2. Оптимизация производительности

В Flatseal для Steam необходимо разрешить:

- **Device**: Доступ к `/dev/dri` (прямой рендеринг) и игровым контроллерам.
- **Shaders**: Разрешить фоновую обработку шейдеров (актуально для Intel Xe).
- **MangoHud**: Для мониторинга FPS установите Flatpak-версию MangoHud и пропишите в параметрах запуска игры: `mangohud %command%`.

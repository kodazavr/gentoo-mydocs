---
kind: guide
scope: general
status: current
last_verified: 2026-09-22
verified_on: [asus-b5402]
---

# Веб-браузер: Firefox (Gentoo Way)

Документ описывает сборку Firefox с LLVM, аппаратным ускорением Wayland и
profile-sync-daemon. Действовавшие параметры ASUS B5402 записаны в
[системном разделе](../systems/asus-b5402/applications.md).

## 1. Сборка и оптимизация (Clang & PGO)

Использование современного тулчейна и профилирования позволяет получить максимально отзывчивый бинарный файл под архитектуру Alder Lake.

| USE-flag | Описание |
|---------|----------|
| `clang` | Сборка компилятором LLVM. Флаг включён по умолчанию в ebuild'е, отдельный пин слота не нужен. |
| `+pgo` | Profile-Guided Optimization. Сборка на основе реальных профилей использования (прирост скорости ~10%). |
| `jumbo-build` | Ускорение компиляции объединением исходных файлов. Актуальный Gentoo profile форсирует его для Firefox, а `USE=pgo` также требует `jumbo-build`; локальный override не нужен. |
| `-wifi -jpegxl` | Выключены геолокация по Wi-Fi и поддержка JPEG XL. |
| `+system-lib*` | Использование системных библиотек (jpeg, png, webp, av1) для уменьшения оверхеда. |

## 2. Графический стек и Wayland

Для чистого Wayland-окружения Firefox можно собрать без X11.

- **Backend**: используй `-X +wayland`, если XWayland не нужен.
- **HWACCEL**: включи `+hwaccel` после проверки драйвера ядра, Mesa и VA-API.
- **Интеграция**: `+dbus`, `+pulseaudio` через PipeWire и `+system-pipewire`
  обеспечивают WebRTC и захват экрана.

Ассоциации Firefox для HTTP(S), HTML и PDF настраиваются через
[приложения по умолчанию (XDG MIME)](../desktop/default-applications.md).

### Пример package.use

```makefile
# /etc/portage/package.use/40-multimedia (тематический файл; подойдёт и отдельный файл firefox)
media-libs/libpng          apng
media-libs/libvpx          postproc
www-client/firefox         hwaccel pulseaudio openh264 system-pipewire wasm-sandbox system-av1 system-harfbuzz system-icu system-jpeg system-libevent system-libvpx system-webp system-png -telemetry -wifi -jpegxl
```

## 3. Безопасность

- **RLBox**: Флаг `+wasm-sandbox` изолирует сторонние библиотеки (например, графические) в песочнице WebAssembly.
- **Hardened**: Активированы дополнительные проверки защиты тулчейна.
- **Telemetry**: `-telemetry` — полная вырезка аналитики и «стука» в Mozilla.

## 4. Оптимизация профиля (Profile-sync-daemon)

Для переноса профиля в tmpfs можно использовать profile-sync-daemon (PSD).

### Конфигурация (`~/.config/psd/psd.conf`)

В примере профиль работает в tmpfs через Overlayfs.

```bash
# Использовать Overlayfs (быстрее и меньше RAM)
USE_OVERLAYFS="yes"
# Синхронизация при уходе в сон (предотвращает потерю данных на ноутбуке)
USE_SUSPSYNC="yes"
# Только необходимый браузер
BROWSERS=(firefox)
```

### Проверка службы

Управление осуществляется через пользовательский юнит systemd:

```bash
systemctl --user status psd.service
```

Пример показателей, которые стоит контролировать:

- **Размер профиля**: ~235M
- **Overlayfs size**: ~69M (объем реально измененных данных в сессии)
- **Точка монтирования**: /run/user/1000/psd/...

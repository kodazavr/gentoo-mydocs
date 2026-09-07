# Веб-браузер: Firefox (Gentoo Way)

Конфигурация Firefox направлена на максимальное использование возможностей LLVM 22, аппаратного ускорения в Wayland и минимизацию дисковых операций для ускорения интерфейса.

## 1. Сборка и оптимизация (Clang & PGO)

Использование современного тулчейна и профилирования позволяет получить максимально отзывчивый бинарный файл под архитектуру Alder Lake.

| USE-flag | Описание |
|---------|----------|
| `+clang +llvm_slot_22` | Сборка компилятором LLVM 22. |
| `+pgo` | Profile-Guided Optimization. Сборка на основе реальных профилей использования (прирост скорости ~10%). |
| `+jumbo-build` | Ускорение компиляции за счет объединения исходных файлов. |
| `+system-lib*` | Использование системных библиотек (jpeg, png, webp, av1) для уменьшения оверхеда. |

## 2. Графический стек и Wayland

Полный отказ от X11 в пользу нативного Wayland-окружения (Niri) и современных драйверов Intel.

- **Backend**: Собран с `-X +wayland`. Никакого XWayland.
- **HWACCEL**: `+hwaccel` включен. В связке с драйвером ядра (цель — `xe`, текущее состояние — `i915`) и Mesa (iris) это обеспечивает аппаратное декодирование видео с минимальной нагрузкой на CPU.
- **Интеграция**: `+dbus`, `+pulseaudio` (через PipeWire) и `+system-pipewire` для бесшовной работы WebRTC и шаринга экрана.

### package.use

```makefile
# /etc/portage/package.use/firefox
media-libs/libpng apng
media-libs/libvpx postproc
www-client/firefox hwaccel pulseaudio openh264 jumbo-build system-pipewire wasm-sandbox system-av1 system-harfbuzz system-icu system-jpeg system-libevent system-libvpx system-webp system-png gmp-autoupdate llvm_slot_22 -llvm_slot_21 -telemetry
```

## 3. Безопасность

- **RLBox**: Флаг `+wasm-sandbox` изолирует сторонние библиотеки (например, графические) в песочнице WebAssembly.
- **Hardened**: Активированы дополнительные проверки защиты тулчейна.
- **Telemetry**: `-telemetry` — полная вырезка аналитики и «стука» в Mozilla.

## 4. Оптимизация профиля (Profile-sync-daemon)

Для исключения задержек при чтении/записи базы данных (история, куки) и продления жизни SSD используется profile-sync-daemon (PSD).

### Конфигурация (`~/.config/psd/psd.conf`)

Браузер работает в tmpfs, используя Overlayfs для минимизации объема копируемых данных.

```bash
# Использовать Overlayfs (быстрее и меньше RAM)
USE_OVERLAYFS="yes"
# Синхронизация при уходе в сон (предотвращает потерю данных на ноутбуке)
USE_SUSPSYNC="yes"
# Только необходимый браузер
BROWSERS=(firefox)
```

### Статус системы

Управление осуществляется через пользовательский юнит systemd:

```bash
systemctl --user status psd.service
```

Текущие показатели:

- **Размер профиля**: ~235M
- **Overlayfs size**: ~69M (объем реально измененных данных в сессии)
- **Точка монтирования**: /run/user/1000/psd/...

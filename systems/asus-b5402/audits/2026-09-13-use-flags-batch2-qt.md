---
kind: system
scope: system
status: current
last_verified: 2026-09-13
verified_on: [asus-b5402]
---

# Аудит USE: батчи 2 и 2b (Qt) — 2026-09-13

Продолжение [политики make.conf и аудита USE](2026-09-12-make-conf-policy.md).
Батчи по 5 пакетов; источник флагов — VDB IUSE и эффективный USE.

## Глобально (2026-09-13)

- `wifi` удалён из глобального `USE`: единственный значимый потребитель —
  NetworkManager с собственным дефолтом `+wifi`; firefox закрыт точечным
  `-wifi` 2026-09-12.
- Зафиксировано: hardened-профиль глобально задаёт `-jit -orc`
  (`profiles/features/hardened/make.defaults`), поэтому QML JIT у
  qtdeclarative и Orc JIT выключены политикой профиля, а не конфигурацией
  владельца.
- Печать не используется: `cups` у qtbase остаётся выключенным.

## Батч 2: qtbase, qtdeclarative, qtwayland, qtmultimedia, qttools

- **qtbase** — близко к оптимуму. Дефолт `+X` удерживается глобальным `-X`
  (та же схема, что у firefox); embedded-флаги (`evdev`, `tslib`, `eglfs`),
  `gles2-only`, `renderdoc`, `io-uring`, `sctp`, `gssapi`, `journald`,
  `syslog` и БД-драйверы (`mysql`, `postgres`, `odbc`, `oci8`) выключены
  обоснованно; `gtk`, `custom-cflags`, `brotli` и глобальные
  `icu`/`vulkan`/`wayland`/`libinput` — осознанно.
- **qtdeclarative** — чисто; `-jit` объяснён профилем.
- **qtwayland** — `qml` включён; `-gnome` обоснован (Niri, не GNOME Shell).
- **qtmultimedia** — полный медиа-стек (`ffmpeg`+`gstreamer`+`pipewire`+
  `vaapi`+`v4l`+`alsa`), `-pulseaudio`, `-X`, `-eglfs`.
- **qttools** — `assistant`/`linguist`/`qdbus`/`qtdiag`; дев-утилиты
  (`designer`, `qdoc` и другие) выключены. Нюанс на будущее: qttools знает
  LLVM-слоты только до 21 — если понадобится `qdoc`, включать `llvm_slot_21`.

## Батч 2b: остальные модули Qt

`qt5compat` (`gui`+`icu`+`qml`), `qtshadertools`, `qtsvg`, `qtquick3d`
(`opengl`+`vulkan`), `qtquicktimeline`, `qttranslations` — только
`custom-cflags` и профильные флаги; минимально и корректно, изменений нет.
Qt-окружение на системе: `qt6ct`, `poppler`, `cmake`, `meson`, `appstream`;
сетевых Qt-приложений нет.

## libproxy

Прокси в системе не настроен: переменные окружения отсутствуют,
`org.gnome.system.proxy mode = 'none'`. При прямом соединении `libproxy` у
qtbase не даёт функции. Фактические потребители пакета: только
`glib-networking` (дефолт `+libproxy`); `wget` и `firefox` его не требуют.

Рекомендация: убрать `libproxy` из строки qtbase. Пакет при этом останется
в системе из-за glib-networking; полное выселение возможно отдельным шагом
через `-libproxy` у glib-networking с последующей depclean-проверкой.

## Источники

- VDB IUSE и эффективный USE пакетов Qt (2026-09-13).
- `profiles/features/hardened/make.defaults`.

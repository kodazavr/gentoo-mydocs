---
kind: system
scope: system
status: draft
last_verified: null
verified_on: [asus-b5402]
---

# Загрузка и Portage на ASUS ExpertBook B5402

Раздел загрузки подтверждён аудитом 2026-09-10. Раздел Package policy ниже
сохраняет исходную запись и требует отдельной проверки.

## Toolchain

Подтверждено аудитами `make.conf` от 2026-09-11: [основной](../audits/2026-09-11-make-conf-audit.md)
и [очистка](../audits/2026-09-11-make-conf-cleanup.md).

- Основной toolchain — LLVM/Clang/LLD 22 с `-march=alderlake`, `-O3` и
  ThinLTO; для Fortran — отдельный набор флагов без LTO.
- Для повторных сборок используется ccache; BOLT отключён.
- Записанный профиль содержит `MAKEOPTS="-j14 -l10"` и
  `VIDEO_CARDS="intel zink"` (невалидный токен `iris` удалён 2026-09-11).
- `GOFLAGS` удалён 2026-09-11 как не влияющий на сборки: `go-env.eclass`
  задаёт собственный `GOFLAGS` и сам добавляет `-buildmode=pie`.
- Политика флагов подтверждена владельцем 2026-09-11: глобальные `-O3` и
  ThinLTO остаются с точечными исключениями в `package.env` (`bfd`,
  `gcc-fallback`, `java`, `kernel-llvm`, `lld`, `llvm-22`, `no-lto-llvm`,
  `p-cores`, `problem-llvm`, `ssd`, `systemd-llvm`); явный набор `-mno-*`
  остаётся как отключение возможностей, которых у процессора нет;
  `MAKEOPTS="-j14 -l10"` — с запасом под гибридные ядра и память.
- Из глобального `USE` удалены семь флагов без установленных потребителей
  (`mapi`, `vpp`, `zink`, `networkmanager`, `udisks2`, `libnotify`, `acpi`) —
  см. [аудит 2026-09-12](../audits/2026-09-12-make-conf-policy.md). Драйвер
  Zink не затронут: он управляется `video_cards_zink` из `VIDEO_CARDS`.

## Загрузка

- Ядро собирается пакетом `sys-kernel/gentoo-kernel` с `savedconfig`.
- `kernel-install` использует `layout=uki`, `initrd_generator=dracut` и
  `uki_generator=dracut`. Dracut создаёт UKI, а systemd-boot загружает его с
  ESP.
- Dracut подписывает UKI ключами sbctl; после установки плагин sbctl проверяет
  подпись итогового EFI-файла.
- Корневой LUKS открывается через TPM2; корень — Btrfs-субволюм `@`.
- После пересборки UKI 2026-09-10 Secure Boot и автоматическая TPM2-
  разблокировка проверены успешной перезагрузкой.
- В cmdline используется `apparmor=1` и
  `lsm=landlock,lockdown,yama,integrity,apparmor,bpf`; устаревший
  `security=apparmor` удалён. В runtime AppArmor присутствует в активном
  наборе LSM.

## Package policy

В исходной записи использовались следующие правила. Перед применением их
нужно заново проверить Portage resolver.

```makefile
# /etc/portage/package.use/gentoo-kernel
sys-kernel/gentoo-kernel initramfs savedconfig modules-sign -debug -generic

# /etc/portage/package.use/installkernel
sys-kernel/installkernel systemd-boot ukify dracut uki -grub -efistub -ugrd -refind

# /etc/portage/package.use/firefox
media-libs/libpng apng
media-libs/libvpx postproc
www-client/firefox hwaccel pulseaudio openh264 jumbo-build system-pipewire wasm-sandbox system-av1 system-harfbuzz system-icu system-jpeg system-libevent system-libvpx system-webp system-png gmp-autoupdate llvm_slot_22 -llvm_slot_21 -telemetry

# /etc/portage/package.use/ffmpeg
media-video/ffmpeg qsv x264 x265 drm gpl opus vorbis dav1d svt-av1 libaom libplacebo vpx webp zimg -sdl -opengl
media-libs/x265 -12bit
media-video/libva-utils vainfo

# /etc/portage/package.use/pipewire
media-video/pipewire sound-server udev pulseaudio gsettings pipewire-alsa liblc3 lv2 extra flatpak echo-cancel -ssl -libcamera
```

## Общие руководства

- [Базовая система](../../../installation/base-system.md)
- [UKI](../../../installation/systemd-uki-setup.md)
- [Portage](../../../managed/portage.md)

---
kind: system
scope: system
status: draft
last_verified: null
verified_on: [asus-b5402]
---

# Загрузка и Portage на ASUS ExpertBook B5402

Состояние перенесено из смешанных документов и пока не подтверждено новым
аудитом.

## Toolchain

- Основной toolchain — LLVM/Clang/LLD 22 с `-march=alderlake`, `-O3` и
  ThinLTO.
- Для повторных сборок используется ccache; BOLT отключён.
- Записанный профиль содержит `MAKEOPTS="-j14 -l10"` и
  `VIDEO_CARDS="intel iris zink"`.

## Загрузка

- Ядро собирается пакетом `sys-kernel/gentoo-kernel` с `savedconfig`.
- Dracut создаёт UKI, systemd-boot загружает его с ESP, подпись использует
  ключи sbctl из `/var/lib/sbctl/keys/db/`.
- Корневой LUKS открывается через TPM2; корень — Btrfs-субволюм `@`.

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

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

Подтверждено аудитами `make.conf` от 2026-09-11: основной аудит и очистка.

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
  аудит 2026-09-12. Драйвер
  Zink не затронут: он управляется `video_cards_zink` из `VIDEO_CARDS`.
- Ещё четыре флага перенесены точечно в `package.use`: `sound-server`
  (pipewire), `screencast` (niri), `lto` (gcc), `gles2` (gst-plugins-base,
  mesa-progs). `egl`, `ffmpeg`, `v4l`, `pgo`, `custom-cflags` и `btrfs`
  остаются глобальной политикой.

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

Подтверждено сверкой с живой системой 2026-09-12 (файлы
`/etc/portage/package.use/`).

```makefile
# /etc/portage/package.use/20-kernel-boot
sys-kernel/gentoo-kernel      initramfs savedconfig modules-sign modules-compress -debug
sys-kernel/installkernel      systemd-boot ukify dracut uki -grub -efistub -ugrd -refind
sys-kernel/linux-firmware     compress-zstd deduplicate -savedconfig
sys-firmware/intel-microcode  dist-kernel initramfs split-ucode hostonly -vanilla
```

- Прежний флаг `-generic` у gentoo-kernel устарел: в текущих ebuild его
  нет (схема сменилась на `generic-uki`), из живой конфигурации он убран.
- `savedconfig` ядра хранится в `/etc/portage/savedconfig/sys-kernel/`:
  базовый файл `gentoo-kernel` и версионные `gentoo-kernel-7.2.3/.4/.5`
  (приоритет PF > PN по правилу eclass); файлы `*.bak` не используются.
- При выключенном `savedconfig` у linux-firmware сохранённый список
  `linux-firmware-20260810` не применяется — судьба файла не решена.
- Точечные `llvm_slot_*`-правила удалены 2026-09-12: при установленных
  слотах LLVM 22 и 23 все потребители (mesa, mesa_clc, niri, bpftool, perf,
  firefox, xwayland-satellite) резолвятся в 22, потому что слот 23 их
  ebuild'ами ещё не поддерживается. Когда появится `llvm_slot_23`, дефолты
  перевернутся на него сами — в этот момент решать вопрос перехода.
- `video_cards_i915` у mesa удалён 2026-09-12: легаси-драйвер Gen2–Gen5,
  графику Alder Lake обслуживает iris (значение `intel` в `VIDEO_CARDS`).

## Общие руководства

- [Базовая система](../../../installation/base-system.md)
- [UKI](../../../installation/systemd-uki-setup.md)
- [Portage](../../../managed/portage.md)

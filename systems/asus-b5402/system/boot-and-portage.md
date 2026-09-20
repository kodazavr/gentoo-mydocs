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

Основной аудит и очистка `make.conf` — 2026-09-11; применение optimization
policy — 2026-09-20.

- Production toolchain — LLVM/Clang/LLD 22.
- CPU target — явный `-march=alderlake`. `-march=native` отклонён как
  production policy: явный таргет воспроизводим и проверяем по конфигу,
  `native` подстраивается под конкретный экземпляр CPU, на котором идёт
  компиляция. Явный набор `-mno-*` остаётся как отключение возможностей,
  которых у процессора нет.
- C/C++ optimization — глобально `-O2`; ThinLTO глобально там, где
  package/ebuild policy допускает; `-O3` — только package-specific после
  отдельного benchmark (по итогам B1–B4 selective rules не созданы).
  Решение 2026-09-20, доказательная база —
  [experiments/llvm23-toolchain](../../../experiments/llvm23-toolchain/README.md).
- Fortran — `-O2` без ThinLTO: GNU Fortran не понимает `-flto=thin`
  (расширение Clang).
- Политика применена к `/etc/portage` 2026-09-20: `-O3` → `-O2` в
  `make.conf` и env-файлах (`kernel-llvm` уже был `-O2`);
  `portageq envvar CFLAGS CXXFLAGS` подтверждает
  `-O2 -flto=thin`, resolver рассчитывается. Полный rebuild `@world` под
  `-O2` ещё не выполнен.
- LLVM 23: compatibility experiment COMPLETE (A1–A4); controlled production
  rollout не начат. Ядро намеренно собирается LLVM 23.1.1 (env
  `kernel-llvm`, пилот).
- Для повторных сборок используется ccache; BOLT отключён.
- Записанный профиль содержит `MAKEOPTS="-j14 -l10"` — с запасом под
  гибридные ядра и память — и `VIDEO_CARDS="intel zink"` (невалидный токен
  `iris` удалён 2026-09-11).
- `GOFLAGS` удалён 2026-09-11 как не влияющий на сборки: `go-env.eclass`
  задаёт собственный `GOFLAGS` и сам добавляет `-buildmode=pie`.
- Из глобального `USE` удалены семь флагов без установленных потребителей
  (`mapi`, `vpp`, `zink`, `networkmanager`, `udisks2`, `libnotify`, `acpi`) —
  аудит 2026-09-12. Драйвер
  Zink не затронут: он управляется `video_cards_zink` из `VIDEO_CARDS`.
- Ещё четыре флага перенесены точечно в `package.use`: `sound-server`
  (pipewire), `screencast` (niri), `lto` (gcc), `gles2` (gst-plugins-base,
  mesa-progs). `egl`, `ffmpeg`, `v4l`, `pgo`, `custom-cflags` и `btrfs`
  остаются глобальной политикой.

## Package.env и GCC-исключения

No-LTO exception cleanup — COMPLETE (2026-09-21): все 102 локальных
`no-lto-llvm` overrides перепроверены и сняты контролируемыми batch'ами
(проверка — `emerge --buildpkgonly -1`); `env/no-lto-llvm`, `env/no-ccache`
(после исчезновения последнего потребителя) и `package.env/20-compatibility`
удалены. Все 102 overrides оказались больше не нужны: для части пакетов
ebuild сам управляет LTO (`filter-lto`), а часть Go/Rust-пакетов не
использует эти C/C++ flags напрямую. Полный rebuild `@world` после
изменения policy ещё не выполнялся.

Текущая структура — 4 файла `env/`, 3 файла `package.env`:

```text
/etc/portage/env:          gcc-fallback  kernel-llvm  p-cores  ssd
/etc/portage/package.env:  00-toolchain  10-performance  30-gcc-fallback
```

Действующая policy:

- C/C++ — глобально `-O2` + ThinLTO, если ebuild сам его не фильтрует;
  локального `no-lto-llvm` blacklist больше нет.
- GCC fallback — только `sys-devel/binutils` (реальная текущая проблема
  Clang + PGO) и `x11-libs/pango` (временное исключение перед LLVM 23
  rollout из-за известной проблемы Clang 23); назначения — в
  `30-gcc-fallback`. BFD policy находится внутри `env/gcc-fallback`: GCC
  LTO (`-flto=auto`) несовместим с глобальным `-fuse-ld=lld`.
- Performance policy (`p-cores`, `ssd`) — в `00-toolchain` и
  `10-performance`: clang/lld/llvm (`p-cores ssd`), gentoo-kernel
  (`kernel-llvm p-cores ssd`), firefox и qtbase (`p-cores ssd`), mesa —
  только `ssd`.

Перепроверены 2026-09-20 и больше не документируются как GCC-исключения:
`app-shells/bash` (включая `USE=pgo`), `app-containers/lxc-7.0.0-r1`,
`app-editors/nano`, `dev-cpp/highway`, `net-analyzer/nmap`,
`media-libs/libjxl`, modern OpenJDK — все успешно собираются production
Clang.

- Java: source `dev-java/openjdk:17` больше не нужен; система переведена на
  `dev-java/openjdk-bin:25` — system VM через `eselect java-vm`, проверено
  `java -version` (Temurin 25.0.4 LTS) и `javac -version`.

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

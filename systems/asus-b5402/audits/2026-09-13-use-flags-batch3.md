---
kind: system
scope: system
status: current
last_verified: 2026-09-13
verified_on: [asus-b5402]
---

# Аудит USE: батч 3 (mpv, networkmanager, docker, podman, libvirt) — 2026-09-13

Продолжение серии батчей ([батч 1 и вычистка](2026-09-12-make-conf-policy.md),
[батчи 2/2b Qt](2026-09-13-use-flags-batch2-qt.md)).

## Итоги по пакетам

- **mpv** — чисто: правило валидно; `vulkan` (для vo_gpu-next), `libmpv` и
  `uchardet` уже включены дефолтами; `-alsa` (звук через PipeWire) и
  `-dvb -dvd -cdda` (нет приёмников и приводов) осознанны.
- **docker** — оптимален: `apparmor`+`seccomp` согласованы с системой,
  `btrfs`, `container-init`, `overlay2`, `systemd`.
- **podman** — оптимален: `cron` и `wrapper` выключены (systemd-таймеры
  есть, реальный docker установлен).
- **libvirt** — стек `apparmor`+`audit`+`policykit`+`caps` согласован;
  чужие хранилища, `lxc`, `xen`, `virtualbox`, `firewalld` выключены
  обоснованно. Владелец решил включить `virtiofsd` для файл-шеринга с ВМ.

## networkmanager: находки и конфликт

Выключены дефолтные `modemmanager` (WWAN-модема нет; тянул установленный
`net-misc/modemmanager`) и `ppp` (PPPoE нет; тянул `net-dialup/ppp` и
`ppp-scripts`). После этого resolver вскрыл скрытую связку
`REQUIRED_USE: bluetooth? ( modemmanager )`: глобальный `bluetooth`
включал у NM поддержку BT-тетеринга, которая требует modemmanager. Решение
владельца: `-bluetooth` у NM — сетевой BT-тетеринг не нужен; стек bluez и
BT-аудио PipeWire не затронуты.

Урок метода: связки флагов живут в `REQUIRED_USE` ebuild'а и не видны в
списке IUSE — при выключении флагов проверять REQUIRED_USE до правки.
Полный REQUIRED_USE NM проверен, все 11 ограничений выполняются; важная
связка на будущее: `iwd? ( wifi )` — выключение `wifi` сломало бы `iwd`.

Итоговое состояние NM: `audit concheck connection-sharing introspection
iwd nftables nss policykit psl systemd tools wifi`. `introspection`
оставлен: микроэкономия от выключения не оправдывает риск для
GI-потребителей.

## Источники

- VDB IUSE и эффективный USE (2026-09-13).
- `REQUIRED_USE` ebuild networkmanager-1.56.1.

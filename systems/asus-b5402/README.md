---
kind: system
scope: system
status: draft
last_verified: null
verified_on: [asus-b5402]
---

# ASUS ExpertBook B5402

Этот каталог хранит состояние эталонной Gentoo-системы отдельно от общих
руководств. Он заполняется постепенно: отсутствие записи не означает, что
компонент не установлен или не настроен.

Полного актуального аудита системы пока нет. Дату `last_verified` следует
заполнять только после новой фактической проверки.

## Рабочее окружение

- [Noctalia v5](desktop/noctalia.md) — установленная версия, источник пакета
  и локальная keyword-политика.
- [Niri, порталы и GTK](desktop/environment.md) — записанное состояние
  рабочего окружения.

## Аппаратная конфигурация

- [ASUS ExpertBook B5402CBA](hardware/asus-expertbook.md)
- [Intel Alder Lake i7-1260P](hardware/cpu-optimization.md)
- [Intel Graphics](hardware/graphics.md)
- [Второй NVMe и резервные копии](hardware/second-disk.md) — непроверенный
  системный план.

## Система

- [Btrfs и Snapper](filesystem/layout-and-snapshots.md)
- [UKI, toolchain и Portage](system/boot-and-portage.md)
- [Обновление BIOS/UEFI](system/bios-update.md) — проверенная процедура для
  Secure Boot, `sbctl`, LUKS2 и TPM2.
- [NetworkManager, Docker и Libvirt](networking/networkmanager-and-libvirt.md)
- [Политика doas](security/doas.md)
- [Приложения](applications.md)

## Общие руководства

- [Noctalia v5 для Niri](../../desktop/noctalia-shell.md)
- [Niri](../../desktop/niri.md)

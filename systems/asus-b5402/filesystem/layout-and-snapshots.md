---
kind: system
scope: system
status: draft
last_verified: 2026-09-22
verified_on: [asus-b5402]
---

# Btrfs и Snapper на ASUS ExpertBook B5402

Перенесённая запись конфигурации, перепроверена 2026-09-22: Btrfs — по живому
выводу `findmnt`, Snapper — по конфигу `/etc/snapper/configs/root`.

## Btrfs

Субволюмы подтверждены монтированием 2026-09-12: `@`, `@home`, `@snapshots`,
`@var_log`, `@var_cache`, `@distfiles`, `@ccache`, `@portage_tree`, `@docker`,
`@libvirt` и `@portage_tmp`. Опции NVMe — `compress=zstd:3`, `noatime`,
`discard=async`, `space_cache=v2`.

Сборочная цепочка Portage вынесена из снапшотируемого корня:

| Субволюм | Точка монтирования | Назначение |
|---|---|---|
| `@ccache` | `/var/tmp/ccache` | кэш компилятора; `nodatacow` на каталоге подтверждён |
| `@portage_tmp` | `/var/tmp/portage-disk` | временные файлы тяжёлых сборок |
| `@distfiles` | `/var/cache/distfiles` | исходные коды пакетов |
| `@var_cache` | `/var/cache` | прочий системный кэш |
| `@portage_tree` | `/var/db/repos/gentoo` | дерево Gentoo |

Рабочая директория `/var/tmp/portage` — tmpfs размером 16 GiB
(`uid=portage`, `nosuid`, `nodev`, `noatime`), подтверждена 2026-09-12.

## Snapper

Конфигурация `root` проверена 2026-09-22: `ALLOW_GROUPS="wheel"`,
`SYNC_ACL="yes"`, лимиты — пять часовых, семь дневных, одна недельная, ноль
месячных (`TIMELINE_LIMIT_*`), `NUMBER_LIMIT="10"` (важные — 5),
`SPACE_LIMIT="0.8"`. Автоматизация — systemd timers (timeline, cleanup, boot).

Хук Portage в `/etc/portage/bashrc` отсутствует (проверено 2026-09-22): bashrc
содержит только `PORTAGE_SCHEDULING_COMMAND` для p-cores, pre/post-снимков на
emerge не создаётся.

## Общие руководства

- [Структура Btrfs](../../../filesystem/btrfs-setup.md)
- [Snapper](../../../filesystem/snapper-backups.md)


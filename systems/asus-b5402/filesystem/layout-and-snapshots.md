---
kind: system
scope: system
status: draft
last_verified: null
verified_on: [asus-b5402]
---

# Btrfs и Snapper на ASUS ExpertBook B5402

Перенесённая запись конфигурации. Раздел Btrfs подтверждён монтированием
2026-09-12; раздел Snapper не перепроверялся.

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

Для корня записана конфигурация `root` с доступом группы `wheel`. Указаны пять
часовых, семь дневных и десять пар Portage-снимков, а также
`SPACE_LIMIT="0.8"`. Автоматизация использует systemd timers и Portage hook в
`/etc/portage/bashrc`.

## Общие руководства

- [Структура Btrfs](../../../filesystem/btrfs-setup.md)
- [Snapper](../../../filesystem/snapper-backups.md)


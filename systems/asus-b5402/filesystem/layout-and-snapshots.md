---
kind: system
scope: system
status: draft
last_verified: null
verified_on: [asus-b5402]
---

# Btrfs и Snapper на ASUS ExpertBook B5402

Это перенесённая запись конфигурации, а не результат текущего аудита.

## Btrfs

В документации зафиксированы субволюмы `@`, `@home`, `@snapshots`,
`@var_log`, `@var_cache`, `@distfiles`, `@ccache`, `@portage_tree`, `@docker`,
`@libvirt` и `@portage_tmp`. Для NVMe указаны `compress=zstd:3`, `noatime` и
`discard=async`; `/var/tmp/portage` описан как tmpfs размером 16 GiB.

## Snapper

Для корня записана конфигурация `root` с доступом группы `wheel`. Указаны пять
часовых, семь дневных и десять пар Portage-снимков, а также
`SPACE_LIMIT="0.8"`. Автоматизация использует systemd timers и Portage hook в
`/etc/portage/bashrc`.

## Общие руководства

- [Структура Btrfs](../../../filesystem/btrfs-setup.md)
- [Snapper](../../../filesystem/snapper-backups.md)


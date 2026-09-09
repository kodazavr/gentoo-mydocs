---
kind: system
scope: system
status: draft
last_verified: null
verified_on: [asus-b5402]
---

# Сеть ASUS ExpertBook B5402

Записанное состояние требует повторной проверки.

## Wi-Fi

- NetworkManager использует iwd и драйвер Intel AX201.
- Включены случайный MAC при сканировании и стабильный MAC для подключений.
- Локальный `31-mac-addr-change.conf` маскирует одноимённый системный файл.

## Docker и Libvirt

Старая запись относится к systemd, Docker 29.8.0 с iptables-nft и Libvirt
10.x. Для обхода Docker `FORWARD policy drop` использовалась отдельная таблица
nftables с более ранним приоритетом. Подсети и корректность правил нужно
проверить до применения.

## Общие руководства

- [NetworkManager и iwd](../../../networking/networkmanager-iwd.md)
- [MAC-рандомизация](../../../troubleshooting/networkmanager-iwd-mac-randomization.md)
- [Docker, Libvirt и nftables](../../../troubleshooting/docker-libvirt-nftables.md)


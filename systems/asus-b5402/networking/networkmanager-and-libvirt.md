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
- Локальный drop-in `iwd.service.d/override.conf` (проверен 2026-09-21):
  `ProtectKernelTunables=yes` заменён на `ProtectKernelTunables=no`
  (effective подтверждён `systemctl show iwd -p ProtectKernelTunables`).
  Причина: `yes` запрещал iwd запись в sysctl `arp_evict_nocarrier` и
  `ndisc_evict_nocarrier` (`journalctl -u iwd`: `Unable to write ...`),
  которыми iwd управляет для корректного Wi-Fi roaming. Остальной hardening
  drop-in'а сохранён (CapabilityBoundingSet, RestrictAddressFamilies,
  ProtectSystem/ProtectHome и др.). Первичные источники — в
  [руководстве NetworkManager + iwd](../../../networking/networkmanager-iwd.md).
- Transient startup-гонка NetworkManager/iwd (наблюдение 2026-09-21): при
  инициализации iwd на короткое время создаётся Wi-Fi P2P device
  `/net/connman/iwd/0`, NetworkManager в этот момент логирует `error
  setting IPv4 forwarding to '0': Resource temporarily unavailable` и
  `IWD device named wlan0 is not a Wifi device`, после чего создаёт обычный
  `wlan0`; iwd подключается, DHCP проходит, дальше ошибок нет. Текущее
  состояние: `wlan0` connected, `/net/connman/iwd/0` (wifi-p2p)
  disconnected, оба сервиса active. Подтверждённого runtime-воздействия
  нет, исправление не требуется; с rebuild/toolchain policy не связано.

## Docker и Libvirt

Старая запись относится к systemd, Docker 29.8.0 с iptables-nft и Libvirt
10.x. Для обхода Docker `FORWARD policy drop` использовалась отдельная таблица
nftables с более ранним приоритетом. Подсети и корректность правил нужно
проверить до применения.

## Общие руководства

- [NetworkManager и iwd](../../../networking/networkmanager-iwd.md)
- [MAC-рандомизация](../../../troubleshooting/networkmanager-iwd-mac-randomization.md)
- [Docker, Libvirt и nftables](../../../troubleshooting/docker-libvirt-nftables.md)


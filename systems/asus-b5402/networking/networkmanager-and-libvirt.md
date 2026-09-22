---
kind: system
scope: system
status: draft
last_verified: 2026-09-22
verified_on: [asus-b5402]
---

# Сеть ASUS ExpertBook B5402

Записанное состояние сверено с системой 2026-09-22.

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

Проверено 2026-09-22: Docker 29.8.0 (storage driver `overlay2`, iptables-nft),
Libvirt 12.6.0 (юниты libvirtd/virtqemud системно неактивны — виртуализация
запускается по мере надобности). Для обхода Docker `FORWARD policy drop`
применена отдельная таблица `ip gentoo_bridge_libvirt` (priority −10) и
NAT-маскарадинг: `/etc/nftables/rules/main.nft` подключает `libvirt_fix.nft`
и `tailscale.nft`; runtime-таблицы `ip nat`, `ip gentoo_bridge_libvirt`,
`ip tailscale_nat` подтверждены `nft list tables`.

## Mesh VPN

Проверено 2026-09-22:

- NetBird (`net-vpn/netbird`) — основной mesh-VPN. Интерфейс `wt0`
  (WireGuard, NM-профиль `wt0`, external), процесс поднимает шаблонный юнит
  `netbird@main.service` (активен с загрузки 2026-09-21; сам юнит disabled).
- Tailscale (`net-vpn/tailscale`) установлен, но `tailscaled`
  disabled+inactive; таблица `ip tailscale_nat` загружается include'ом из
  `/etc/nftables/rules/main.nft`.

## Общие руководства

- [NetworkManager и iwd](../../../networking/networkmanager-iwd.md)
- [MAC-рандомизация](../../../troubleshooting/networkmanager-iwd-mac-randomization.md)
- [Docker, Libvirt и nftables](../../../troubleshooting/docker-libvirt-nftables.md)


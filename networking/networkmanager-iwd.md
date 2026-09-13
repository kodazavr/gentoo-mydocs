---
kind: guide
scope: general
status: current
last_verified: 2026-09-13
verified_on: [asus-b5402]
---

# Настройка сети: NetworkManager + iwd

NetworkManager может использовать iwd как беспроводной backend. Записанное
состояние ASUS B5402 находится в
[системном разделе](../systems/asus-b5402/networking/networkmanager-and-libvirt.md),
а отдельная диагностика MAC-рандомизации — в
[troubleshooting](../troubleshooting/networkmanager-iwd-mac-randomization.md).

## 1. Подготовка

Убедитесь, что networkmanager собран с поддержкой iwd.

Файл: `/etc/portage/package.use/networkmanager`

```makefile
net-misc/networkmanager -iptables -dhcpcd -wext -modemmanager -ppp -bluetooth concheck tools connection-sharing iwd audit psl
net-vpn/networkmanager-openvpn -gtk
```

## 2. Конфигурация NetworkManager

Необходимо явно указать NetworkManager использовать iwd в качестве бэкенда для Wi-Fi.

Файл: `/etc/NetworkManager/conf.d/99-wifi-backend.conf`

```ini
[main]
plugins=keyfile

[device]
wifi.backend=iwd
wifi.scan-rand-mac-address=yes

[connection]
wifi.cloned-mac-address=stable
ethernet.cloned-mac-address=stable
```

## 3. Управление сервисами

После проверки конфликтующих сетевых служб включи выбранный стек:

```bash
doas systemctl enable --now iwd
doas systemctl enable --now NetworkManager
```

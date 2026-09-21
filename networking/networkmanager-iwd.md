---
kind: guide
scope: general
status: current
last_verified: 2026-09-21
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

## 4. Локальный drop-in для iwd

Если для `iwd.service` создан локальный drop-in, каждая строка в секции
`[Service]` должна иметь вид `Директива=значение`. Отдельная строка с именем
capability, например `CAP_SYS_MODULE`, не является настройкой: systemd
проигнорирует её с сообщением `Missing '='`.

`CapabilityBoundingSet=` задаёт верхнюю границу capabilities процесса, а не
выдаёт ему права. Не добавляй в набор `CAP_SYS_MODULE`: iwd не загружает
модули ядра, а эта capability разрешает их загрузку и выгрузку.

> ⚠️ **Важный нюанс**: не задавай для `iwd.service`
> `ProtectKernelTunables=yes`. iwd сам управляет network sysctl
> `arp_evict_nocarrier` (IPv4) и `ndisc_evict_nocarrier` (IPv6) — в том
> числе для корректного поведения Wi-Fi roaming при потере carrier, — а
> `ProtectKernelTunables=yes` делает kernel tunables, включая `/proc/sys`,
> недоступными для записи сервису. В журнале это проявляется строками вида
> `iwd: Unable to write arp_evict_nocarrier to
> /proc/sys/net/ipv4/conf/wlan0/arp_evict_nocarrier`. Hardening должен
> учитывать реальные runtime requirements сервиса: `CapabilityBoundingSet`
> и другие совместимые ограничения при этом можно сохранять.

Файл: `/etc/systemd/system/iwd.service.d/override.conf`

```ini
[Service]
CapabilityBoundingSet=CAP_NET_ADMIN CAP_NET_RAW CAP_NET_BIND_SERVICE
```

Перед заменой существующей строки посмотри итоговую конфигурацию unit-файла:

```bash
doas systemctl cat iwd.service
```

После изменения перечитай unit-файлы и проверь синтаксис:

```bash
doas systemctl daemon-reload
doas systemd-analyze verify iwd.service
```

Новые sandbox-настройки применятся при следующем запуске iwd. Чтобы не
обрывать текущее Wi-Fi-соединение, отложи применение до следующей
перезагрузки; `doas systemctl restart iwd` временно разорвёт его.

Если после перезапуска iwd перестал подключаться к сети, удали локальный
drop-in или верни его прежнее содержимое, затем снова выполни
`doas systemctl daemon-reload` и перезапусти iwd.

## Ссылки

- [iwd — systemd unit-файл upstream](https://git.kernel.org/pub/scm/network/wireless/iwd.git/tree/src/iwd.service.in)
- [iwd — src/station.c (управление sysctl nocarrier)](https://git.kernel.org/pub/scm/network/wireless/iwd.git/tree/src/station.c)
- [systemd.exec(5) — CapabilityBoundingSet=](https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html#CapabilityBoundingSet=)
- [systemd.exec(5) — ProtectKernelTunables=](https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html#ProtectKernelTunables=)
- [Документация ядра — ip-sysctl (`arp_evict_nocarrier`, `ndisc_evict_nocarrier`)](https://docs.kernel.org/networking/ip-sysctl.html)
- [capabilities(7) — CAP_SYS_MODULE](https://man7.org/linux/man-pages/man7/capabilities.7.html)

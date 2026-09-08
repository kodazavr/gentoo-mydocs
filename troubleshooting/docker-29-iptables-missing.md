# Docker 29 не запускается: `iptables not found`

## Симптом

После обновления Go и пересборки Docker системный сервис завершался с ошибкой
`start-limit-hit`:

```text
docker.service: Start request repeated too quickly.
docker.service: Failed with result 'start-limit-hit'.
```

Это сообщение systemd отражает несколько неудачных попыток запуска, но не
указывает исходную причину. Она находится выше в журнале:

```bash
journalctl -b -u docker.service --no-pager
```

```text
failed to find iptables: exec: "iptables": executable file not found in $PATH
failed to start daemon: Error initializing network controller:
failed to create NAT chain DOCKER: iptables not found
```

## Причина

На момент диагностики были установлены Docker `29.8.0` и
`net-firewall/nftables-1.1.6`, но отсутствовали пакет
`net-firewall/iptables` и команда `iptables`:

```bash
command -v iptables
qlist -Iv net-firewall/iptables net-firewall/nftables
```

В ebuild Docker `28.4.0` была прямая зависимость от
`net-firewall/iptables`. Ebuild Docker `29.8.0` зависит от
`net-firewall/nftables`, однако Docker продолжает использовать iptables
backend по умолчанию. Пакет `net-firewall/nftables` предоставляет `nft` и
`libnftables`, но не команду `iptables`.

Обновление Go запустило пересборку Docker, но само по себе не было причиной
ошибки. Точный момент удаления `net-firewall/iptables` не подтверждён; пакет
мог стать ненужной зависимостью после обновления Docker и затем попасть под
`emerge --depclean`.

## Исправление

Сначала проверить план установки:

```bash
emerge -pv net-firewall/iptables
```

Для текущей конфигурации нужен USE-флаг `nftables`. В этом режиме Docker
вызывает команды `iptables`/`ip6tables`, а те работают через nftables backend
ядра:

```bash
doas emerge -av net-firewall/iptables
doas eselect iptables set xtables-nft-multi
iptables --version
```

> **Важно:** USE-флаг `nftables` добавляет nft-совместимую реализацию, но не
> гарантирует, что она выбрана как активная. После новой установки ebuild может
> назначить `xtables-legacy-multi`, поэтому переключение через `eselect`
> выполняется явно.

Ожидаемый результат:

```text
iptables v1.8.x (nf_tables)
```

После установки сбросить ограничение systemd и запустить сервисы:

```bash
doas systemctl reset-failed docker.service docker.socket
doas systemctl restart docker.socket
doas systemctl start docker.service
```

## Проверка

```bash
systemctl status docker.service --no-pager
docker info
docker ps
```

Ожидается состояние `active (running)`, а `docker info` должен завершиться без
ошибки подключения к демону Docker.

## Почему не нативный nftables backend

Docker 29 поддерживает нативный nftables backend, но он включается только явно:
через `"firewall-backend": "nftables"` в `/etc/docker/daemon.json`. Этот режим
пока считается экспериментальным. Переход требует включённого IP forwarding и
проверки всех пользовательских правил. На момент инцидента IPv4 и IPv6
forwarding были выключены, а действующая конфигурация Docker + Libvirt
рассчитана на `iptables-nft`.

Поэтому установка `net-firewall/iptables` с USE-флагом `nftables` — наименьшее
изменение, сохраняющее текущую сетевую схему. Активной реализацией должна быть
`xtables-nft-multi`.

## Сопутствующие сообщения

Записи `not restoring image ... layer does not exist` появляются раньше
фатальной ошибки, но не останавливают запуск на этом этапе. После
восстановления Docker следует отдельно проверить список образов и контейнеров.
Не нужно удалять `/var/lib/docker` для исправления ошибки `iptables not found`.

## Environment

- **Дата диагностики:** 2026-09-09
- **Docker:** 29.8.0
- **containerd:** 2.3.4
- **runc:** 1.4.3
- **Go:** 1.27.1
- **Firewall:** nftables 1.1.6
- **Init:** systemd

## References

- [Docker: Firewall with nftables](https://docs.docker.com/engine/network/firewall-nftables/)
- [Docker + Libvirt на этой системе](../settings/nftables-docker-libvirt.md)

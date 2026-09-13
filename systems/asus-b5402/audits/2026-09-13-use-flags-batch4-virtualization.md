---
kind: system
scope: system
status: current
last_verified: 2026-09-13
verified_on: [asus-b5402]
---

# Аудит USE: батч 4 (qemu, spice-gtk, virt-manager, libvirt) — 2026-09-13

Продолжение серии батчей ([батч 3](2026-09-13-use-flags-batch3.md)).

## qemu

- `REQUIRED_USE` сверен целиком — все ограничения выполняются (`fdt` для
  x86_64, `seccomp` для softmmu, `virgl→opengl`, `virtfs→xattr`, `vnc→gnutls`).
- `io-uring` функционален и осознан: ядро держит `CONFIG_IO_URING=y`.
- `X` форсится базовым профилем (`profiles/base/package.use.force`), пин `-X`
  был no-op и удалён.
- Таргеты сокращены до одного `x86_64` (дефолт, токен не нужен): ARM-эмуляция
  никогда не использовалась; user-mode на x86-хосте бесполезен; `i386`
  избыточен — 32-битные гости покрываются x86_64-таргетом с 32-битными
  CPU-моделями (`kvm32`, `486`, `n270` — проверено по `qemu-system-x86_64
  -cpu help`), что также скрывает 64-битность от гостя при анализе.
- Принцип безопасности: **user-mode qemu — не песочница** (системные вызовы
  уходят в ядро хоста). Условно подозрительные файлы запускаются только в
  полной ВМ: снапшот до запуска, изолированная сеть, без расшаренных
  каталогов и USB-пробросов, throwaway-образ.

## spice-gtk / virt-manager / libvirt

- **spice-gtk**: `sasl` удалён из правила — qemu и libvirt собраны с `-sasl`,
  серверной SASL-аутентификации SPICE нет, клиентский SASL повисал в воздухе.
  `introspection` обязателен (virt-manager работает через Python/GI) и
  оставлен; `webdav` выключен — согласовано с выбором virtiofs.
- **virt-manager**: чисто — `gui` + дефолтные `policykit`/`verify-sig`,
  `-sasl` корректен для локального `qemu:///system`.
- **libvirt**: включён `virtiofsd` (решение владельца) — демон virtio-fs,
  современная замена 9p/webdav для расшаривания каталогов хоста в ВМ;
  устанавливается отдельный пакет `app-emulation/virtiofsd`.

## Проверка после правок

`emerge -avuDN @world --pretend`: 18 пакетов — 10 обновлений версий, 7
переустановок и 1 новый пакет, и каждый соответствует принятому решению:
`virtiofsd` (новый), networkmanager (`-modemmanager -ppp -bluetooth`),
ffmpeg (`-gnutls`), qtbase (`-libproxy`), spice-gtk (`-sasl`), qemu
(таргеты), firefox (`-wifi`), libvirt (`virtiofsd`).

## Источники

- VDB IUSE, эффективный USE и `REQUIRED_USE` (2026-09-13).
- `profiles/base/package.use.force` (форс X у qemu).
- Конфиг ядра: `CONFIG_IO_URING=y`.

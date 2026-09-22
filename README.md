---
kind: reference
scope: general
status: current
last_verified: null
verified_on: [asus-b5402]
---

# Gentoo Linux Documentation

Практическая документация по настройке и эксплуатации Gentoo Linux с акцентом
на безопасность, производительность и современный Wayland-стек. Примеры
основаны на ASUS ExpertBook B5402, но фактическое состояние этой машины не
должно подменять общую инструкцию.

## Как устроена документация

- [Политика документации](DOCUMENTATION_POLICY.md) разделяет общие
  руководства, состояние эталонной системы, troubleshooting и историю.
- [Правила участия](CONTRIBUTING.md) содержат шаблон метаинформации и порядок
  проверки изменений.
- [Инвентаризация](DOCUMENTATION_INVENTORY.md) фиксирует исходную
  классификацию и результат миграции.
- [ASUS ExpertBook B5402](systems/asus-b5402/README.md) — эталонная система,
  на которой проверяются общие инструкции.

## Основные темы

- Wayland-окружение на Niri;
- установка Gentoo и управление Portage;
- Btrfs, Snapper, UKI, Secure Boot и TPM2;
- системная и прикладная безопасность;
- диагностика аппаратного и программного стека.

## Визуальный обзор

| Рабочий стол | Панель | Система |
|------------|--------|--------|
| ![Desktop](screenshots/Screenshot%20from%202026-04-10%2015-31-19.png) | ![Shell](screenshots/Screenshot%20from%202026-04-10%2015-31-37.png) | ![Status](screenshots/Screenshot%20from%202026-04-10%2016-09-05.png) |

## Структура документации

### 🧭 Эталонная система

| Раздел | Описание |
|--------|----------|
| [systems/asus-b5402](systems/asus-b5402/README.md) | Записанное состояние ASUS ExpertBook B5402, даты проверки и ссылки на общие руководства |

### 🚀 Установка и загрузка

| Раздел | Описание |
|--------|----------|
| [installation/base-system](installation/base-system.md) | Базовая настройка системы: LLVM toolchain, USE-флаги, ccache, lld |
| [installation/systemd-uki-setup](installation/systemd-uki-setup.md) | Настройка Unified Kernel Image через Dracut |
| [installation/secure-boot-tpm](installation/secure-boot-tpm.md) | Настройка Secure Boot и TPM 2.0 для автоматической расшифровки LUKS |

### 🖥️ Desktop Environment

| Раздел | Описание |
|--------|----------|
| [desktop/niri](desktop/niri.md) | Тайловый Wayland-композитор Niri со скроллингом окон |
| [desktop/noctalia-shell](desktop/noctalia-shell.md) | Нативная Wayland-оболочка Noctalia v5 для Niri |
| [desktop/wayland-portals](desktop/wayland-portals.md) | Настройка XDG Desktop Portals для скринкастинга и диалогов |
| [desktop/default-applications](desktop/default-applications.md) | Приложения по умолчанию, MIME-типы и URI-схемы через XDG |

### 💾 Файловая система

| Раздел | Описание |
|--------|----------|
| [filesystem/btrfs-setup](filesystem/btrfs-setup.md) | Структура субволюмов и опции монтирования |
| [filesystem/snapper-backups](filesystem/snapper-backups.md) | Настройка автоматических снимков системы |

### 🔧 Железо

| Раздел | Описание |
|--------|----------|
| [hardware/intel-graphics](hardware/intel-graphics.md) | Драйвер Intel Xe и Vulkan (ANV) |

### 🌐 Сеть

| Раздел | Описание |
|--------|----------|
| [networking/networkmanager-iwd](networking/networkmanager-iwd.md) | NetworkManager + iwd backend |
| [networking/nftables-firewall](networking/nftables-firewall.md) | Настройка nftables файрвола |
| [networking/wireless-regulatory](networking/wireless-regulatory.md) | Регуляторный домен для Wi-Fi |

### 🛡️ Безопасность

| Раздел | Описание |
|--------|----------|
| [security/app-armor](security/app-armor.md) | Настройка AppArmor для ограничения приложений |
| [security/auditd](security/auditd.md) | Система аудита событий безопасности |
| [security/usbguard](security/usbguard.md) | Контроль USB-устройств и защита от BadUSB |
| [security/kernel-hardening](security/kernel-hardening.md) | Защита ядра: sysctl, hardened flags |
| [security/doas-configuration](security/doas-configuration.md) | Замена sudo на doas |

### ⚙️ Управление пакетами

| Раздел | Описание |
|--------|----------|
| [managed/portage](managed/portage.md) | Полное руководство по Portage и emerge |

### ⚡ Настройки

| Раздел | Описание |
|--------|----------|
| [settings/gtk](settings/gtk.md) | Настройка GTK4 тем для Niri |
| [settings/r2modman](settings/r2modman.md) | Интеграция r2modman со Steam (Flatpak) |
| [settings/scanner-driver](settings/scanner-driver.md) | Настройка сканера отпечатков Elan 04f3:0c77 |
| [settings/obs-studio](settings/obs-studio.md) | OBS Studio, FFmpeg и настройка кодеков |
| [settings/perplexity](settings/perplexity.md) | Интеграция Perplexity AppImage в меню приложений |
| [settings/firefox](settings/firefox.md) | Firefox: Clang, PGO, Wayland, Profile-sync-daemon |
| [settings/flatpak](settings/flatpak.md) | Flatpak и Flatseal для изоляции приложений |
| [settings/connect-phone-android](settings/connect-phone-android.md) | Проблема с подключением телефона для передачи данных |

### 🔍 Решение проблем и аудит

| Раздел | Описание |
|--------|----------|
| [troubleshooting/docker-29-iptables-missing](troubleshooting/docker-29-iptables-missing.md) | Docker 29 не запускается из-за отсутствия команды `iptables` |
| [troubleshooting/docker-libvirt-nftables](troubleshooting/docker-libvirt-nftables.md) | Решение конфликта Docker и Libvirt в nftables; применено и проверено на эталонной системе 2026-09-22 |
| [troubleshooting/networkmanager-iwd-mac-randomization](troubleshooting/networkmanager-iwd-mac-randomization.md) | MAC-рандомизация с NetworkManager и iwd |
| [troubleshooting/luks-tpm2-unlock-after-uki-rebuild](troubleshooting/luks-tpm2-unlock-after-uki-rebuild.md) | TPM2-авторазблокировка LUKS ломается после смены cmdline/пересборки UKI |

### ⚙️ Управление конфигурацией

Конфигурационные файлы управляются через `chezmoi`.
**Первичная настройка:**

```bash
emerge -av app-admin/chezmoi
```

`chezmoi init --apply` [https://github.com/vovanbl411/dotfiles](https://github.com/vovanbl411/dotfiles)


## Эталонная конфигурация

Версии, выбранные пакеты, аппаратные особенности и локальные политики ASUS
ExpertBook B5402 находятся в
[`systems/asus-b5402/`](systems/asus-b5402/README.md). Записи с
`last_verified: null` нельзя считать результатом текущего аудита.

## Быстрые ссылки

- [Gentoo Handbook](https://wiki.gentoo.org/wiki/Handbook:AMD64)
- [Gentoo Hardened](https://wiki.gentoo.org/wiki/Project:Hardened)
- [Niri Wiki](https://www.mintlify.com/niri-wm/niri/development/documenting-niri)
- [Noctalia Shell](https://noctalia.dev/)
- [Dracut Documentation](https://dracut-ng.github.io/dracut-ng/)
- [BOLT Documentation](https://github.com/llvm/llvm-project/tree/main/bolt)

---

*Документация поддерживается вручную и обновляется по мере изменения конфигурации системы.*

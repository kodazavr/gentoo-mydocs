---
kind: guide
scope: general
status: draft
last_verified: null
verified_on: [asus-b5402]
---

# Ядро и загрузка: Unified Kernel Image (UKI)

Документ описывает создание UKI с микрокодом, initramfs и командной строкой
ядра, а также подпись Secure Boot. Перед изменением загрузки подготовь рабочий
носитель восстановления. Состояние ASUS B5402 записано в
[системном разделе](../systems/asus-b5402/system/boot-and-portage.md).

## 1. Сборка ядра (gentoo-kernel)

В примере используется `sys-kernel/gentoo-kernel` с поддержкой `savedconfig`.

- Флаги: Убедитесь, что для ядра включены dist-kernel и savedconfig.
- Путь к конфигу: `/etc/portage/savedconfig/sys-kernel/gentoo-kernel-<version>`.

При обновлении ядра Portage автоматически подхватит ваш оптимизированный конфиг и инициирует сборку.

## 2. Конфигурация Dracut (Initramfs и UKI)

Dracut используется для генерации образа и упаковки его в .efi файл (UKI). Конфигурация разделена на модули для удобства поддержки.

### Глобальные настройки (`/etc/dracut.conf.d/00-global.conf`)

Минимизируем размер образа и включаем микрокод Intel.

```conf
hostonly="yes"
hostonly_mode="strict"
compress="zstd"
early_microcode="yes"
```

### Драйверы и модули (`10-drivers.conf`, `20-modules.conf`)

Пример включает `i915`, NVMe и компоненты для работы с шифрованием. Для `xe`
нужна отдельная проверка совместимости.

```conf
# Целевой драйвер Xe (отключён до перехода)
#force_drivers+=" xe "

# Текущий драйвер i915
add_drivers+=" i915 "

add_drivers+=" nvme "

# systemd в initramfs необходим для интеграции с TPM2
add_dracutmodules+=" systemd tpm2-tss crypt btrfs "
omit_dracutmodules+=" network nfs "
```

> **Совет**: пока `xe` не стабилен на вашем железе, оставьте `force_drivers` закомментированным и явно добавьте `i915` через `add_drivers`.

### Настройка UKI и Secure Boot (90-uki.conf)

Этот файл отвечает за создание финального EFI-файла и его автоматическую подпись.

```conf
uefi="yes"

# Автоматическая подпись образа ключами sbctl
uefi_secureboot_cert="/var/lib/sbctl/keys/db/db.pem"
uefi_secureboot_key="/var/lib/sbctl/keys/db/db.key"
```

## 3. Параметры командной строки (CMDLINE)

Все параметры передаются ядру внутри UKI. Это исключает возможность их подмены злоумышленником.

Файл: `/etc/dracut.conf.d/90-uki.conf` (переменная kernel_cmdline)

| Параметр | Описание |
|----------|----------|
| `rd.luks.uuid` | UUID вашего зашифрованного раздела. |
| `rd.luks.name=...=cryptroot` | Имя mapped-устройства для корневого LUKS. |
| `rd.luks.options=tpm2-device=auto,discard` | Автоматический поиск TPM2 + `discard` для TRIM. |
| `root=UUID=...` | UUID файловой системы внутри LUKS контейнера. |
| `rootflags=subvol=@` | Монтирование конкретного subvolume Btrfs. |
| `rootfstype=btrfs` | Тип корневой файловой системы. |
| `rw` | Подключение корня на запись. |
| `quiet` | Подавление лишнего вывода при загрузке. |
| `audit=1` | Включение аудита ядра. |
| `apparmor=1 security=apparmor` | Активация AppArmor как основного механизма безопасности. |
| `lsm=landlock,lockdown,yama,integrity,apparmor,bpf` | Список активных модулей безопасности. |

## 4. Автоматизация и загрузчик

Так как мы генерируем готовый .efi файл, systemd-boot настраивается элементарно. Ему не нужны сложные конфиги для каждого ядра — он автоматически находит UKI образы в директории EFI/Linux на вашем ESP-разделе.

Для полной автоматизации в Gentoo используется sys-kernel/installkernel. Чтобы ядро после сборки само превращалось в UKI и попадало в EFI, убедитесь, что:

1. У `sys-kernel/installkernel` включены USE-флаги `systemd-boot ukify dracut uki` и отключены `grub efistub ugrd refind`:

   ```makefile
   # /etc/portage/package.use/installkernel
   sys-kernel/installkernel systemd-boot ukify dracut uki -grub -efistub -ugrd -refind
   ```
2. Пути к ключам в системе синхронизированы.

> ⚠️ **Важный нюанс**: Если вы используете sbctl, ваши ключи «живут» в `/var/lib/sbctl/`. Файл `/etc/kernel/uki.conf` (используемый ukify) должен ссылаться на те же файлы, что и конфиг Dracut.

Рекомендуемое содержимое `/etc/kernel/uki.conf` для синхронизации с sbctl:

```bash
[UKI]
SecureBootPrivateKey=/var/lib/sbctl/keys/db/db.key
SecureBootCertificate=/var/lib/sbctl/keys/db/db.pem
```

## 5. Обслуживание системы

После внесения изменений в конфиги Dracut или обновления ключей, образ пересобирается командой:

```bash
# Генерация нового UKI на основе текущего ядра
dracut --force --uefi
```

Благодаря тому, что uefi_secureboot_cert и key прописаны прямо в конфигах Dracut, переподпись происходит мгновенно в процессе сборки образа.

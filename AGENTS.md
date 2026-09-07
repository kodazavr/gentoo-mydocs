# AGENTS.md — Памятка для ассистентов

> Файл для ассистентов (агентов), работающих с репозиторием `gentoo-mydocs`.
> Здесь собраны соглашения, опасности и контекст, которые нужны для качественной помощи.

---

## 1. Что это за проект

**`gentoo-mydocs`** — персональный runbook (руководство по эксплуатации) Gentoo Linux на ноутбуке ASUS ExpertBook B5402 (Intel Core i7-1260P, Alder Lake).

- Язык: **русский** (технические термины часто на английском).
- Формат: Markdown без сборки/CI.
- Цель: задокументировать реальное состояние рабочей станции, а не написать публичный учебник.
- Аудитория: прежде всего сам автор; предполагается знакомство с Gentoo/Linux.

### Ключевая философия системы

- **Pure Wayland** — Niri, без X11.
- **LLVM/LTO** — Clang 22 (основной), Thin LTO. Установлены слоты 21 (для `xwayland-satellite`/`rust-bin`) и 22 (основной); live-слоты 23/24 убраны после ребилда. BOLT отключён до стабильного релиза LLVM 23.
- **Hardened/systemd** — профиль `default/linux/amd64/23.0/no-multilib/hardened/systemd`.
- **Безопасность** — Secure Boot + TPM 2.0 + LUKS2 + AppArmor + Auditd + USBGuard + doas.
- **Btrfs + Snapper** — flat layout субволюмов.
- **systemd-boot + UKI** — через Dracut + ukify.

---

## 2. Структура репозитория

```text
.
├── README.md                 # Главная страница и навигация
├── ROADMAP.md                # Пока пустой (см. CHECKPOINT.md)
├── AGENTS.md                 # Этот файл
├── CHECKPOINT.md             # Текущее состояние и план работ
├── .markdownlint.json        # Конфиг markdownlint, но он в .gitignore
├── .gitignore                # Игнорирует .history, .kilocodemodes, .markdownlint.json
│
├── installation/             # Установка и загрузка
│   ├── base-system.md        # make.conf, toolchain, USE-флаги
│   ├── systemd-uki-setup.md  # Ядро, Dracut, UKI, systemd-boot
│   └── secure-boot-tpm.md    # sbctl, Secure Boot, TPM2 + LUKS2
│
├── desktop/                  # Рабочее окружение
│   ├── niri.md               # Конфиг Niri (KDL), greetd/tuigreet
│   ├── noctalia-shell.md     # Черновик панели на quickshell
│   └── wayland-portals.md    # XDG Desktop Portals
│
├── filesystem/               # Файловая система
│   ├── btrfs-setup.md        # Btrfs layout, mount options, CoW
│   └── snapper-backups.md    # Snapper: конфиги, хуки, таймеры
│
├── hardware/                 # Железо
│   ├── asus-expertbook.md    # ASUS ExpertBook B5402
│   ├── cpu-optimization.md   # Alder Lake, CPU flags, BOLT
│   └── intel-graphics.md     # Intel Xe / i915, Mesa, Vulkan
│
├── networking/               # Сеть
│   ├── networkmanager-iwd.md # NetworkManager + iwd
│   ├── nftables-firewall.md  # Базовый desktop firewall
│   └── wireless-regulatory.md# Регуляторный домен Wi-Fi
│
├── security/                 # Безопасность
│   ├── app-armor.md
│   ├── auditd.md
│   ├── doas-configuration.md
│   ├── kernel-hardening.md
│   └── usbguard.md
│
├── managed/                  # Управление пакетами
│   └── portage.md            # Большое руководство по Portage
│
├── settings/                 # Прикладные настройки
│   ├── bolt.md               # BOLT-оптимизация LLVM
│   ├── connect-phone-android.md
│   ├── firefox.md
│   ├── perplexity.md         # Интеграция Perplexity AppImage
│   ├── flatpak.md
│   ├── gtk.md
│   ├── nftables-docker-libvirt.md  # Актуальное решение (systemd path)
│   ├── nftables.md           # Альтернативное/устаревающее решение
│   ├── nm-iwd.md
│   ├── obs-studio.md
│   ├── r2modman.md
│   └── scanner-driver.md
│
├── troubleshooting/          # Решение проблем и аудит
│   └── system-vs-docs-drift-2026-06-13.md
│
├── .codex/                   # Служебный контекст для агентов
│   ├── project-context.md
│   ├── actual-system.md
│   └── extracted-docs.md
│
├── .history/                 # Ручное версионирование документов
└── screenshots/              # Скриншоты только для README.md
```

---

## 3. Стилевые соглашения

### Язык и тон

- **Язык**: русский.
- **Тон**: личный, инструктивный, иногда разговорный; обращение «ты» допустимо.
- Пиши так, как будто объясняешь себе — кратко, по делу, без маркетинговой воды.

### Структура документа

- **H1** — название темы.
- **H2** — крупные разделы, часто с номерами (`## 1. Установка`).
- **H3** — подразделы.
- Большие документы могут начинаться с **оглавления**.
- Используй **таблицы** для сравнений, опций, USE-флагов, команд.
- Перед конфигом указывай путь: `Файл: /etc/portage/make.conf`.

### Форматирование

- Блоки кода с языком: `bash`, `makefile`, `conf`, `ini`, `toml`, `kdl`, `nft`, `css`, `apparmor`, `c`.
- Команды с привилегиями: преимущественно `doas` (система настроена на doas).
- Исключения возможны, но должны быть явно обоснованы.
- Пути к файлам указывай явно.

### Callouts (выделения)

- `> **Примечание**: ...`
- `> **Важно**: ...`
- `> ⚠️ **Важный нюанс**: ...`

### Соглашения по содержанию

- **USE-флаги**: списком с обратным слэшем переноса строк.
- **Пакеты Gentoo**: в формате `category/package`.
- **Версии/слоты**: указывай актуальные (`LLVM 22`, `llvm_slot_22`). На системе переходный период — слоты 21/22/23/24, основной 22.
- **Скриншоты**: только в `README.md`.
- **Ссылки**: внешние — на Gentoo Wiki, GitHub, официальную документацию; внутренние — из `README.md`.

### Повторяющиеся шаблоны

- «Файл: `<path>`» перед конфигом.
- Раздел «Основные команды» в виде таблицы.
- Чек-листы в конце инструкций.
- «Шпаргалка» для быстрых команд.
- Блок «Environment» в конце сложных гайдов.

---

## 4. Рабочий процесс

### Перед изменениями

```bash
git status --short --branch
```

### Что полезно проверить

```bash
# Список всех markdown-файлов
find . -path './.git' -prune -o -name '*.md' -type f -print

# Поиск TODO/FIXME/черновиков
rg -n "TODO|FIXME|WIP|чернов|draft|TBD|устар|deprecated|XXX" -S . --glob '!/.git/**'
```

### Использование sub-агентов

Для широкого анализа, аудита, проверки связей между файлами — используй sub-агентов (`explore`).
Критический путь (ключевые конфиги, безопасность, загрузка) проверяй самостоятельно.

### Коммиты

- Сохраняй текущий стиль сообщений: `add:`, `update:`, `change:`, `fix:`.
- Делай маленькие атомарные коммиты по темам.

---

## 5. Важные предостережения

### Не запускай команды из документации как тесты

Многие сниппеты нацелены на живую систему и содержат деструктивные или привилегированные команды:

```text
doas
emerge
systemctl
nft
mount
dracut
sbctl
systemd-cryptenroll
```

### Особенно опасные операции

- `sbctl enroll-keys -m` — перезапись ключей UEFI.
- `systemd-cryptenroll --tpm2-device=auto ...` — изменение LUKS.
- `doas btrfs scrub start /` — долгая операция на живой ФС.
- Пересборка мира с изменением линкера (`mold` ↔ `lld`).

Для рискованных гайдов добавляй:

- applicability (когда применимо);
- prerequisites (что нужно сделать до);
- exact config paths;
- verification commands;
- rollback path;
- risk notes;
- references.

### Дрейф документации

Главная проблема проекта — расхождение между документами и реальной системой.
Актуальный аудит: `troubleshooting/system-vs-docs-drift-2026-06-13.md` и `CHECKPOINT.md`.

---

## 6. Известные проблемы и нерешённые вопросы

- `ROADMAP.md` пустой.
- `desktop/noctalia-shell.md` — черновик из 4 строк.
- `settings/obs-studio.md` — USE-флаги актуализированы (2026-08-01), но пакет `media-video/obs-studio` не установлен.
- Дублирование nftables: `settings/nftables.md` vs `settings/nftables-docker-libvirt.md`.
- `settings/nftables.md` не указан в `README.md`.
- `.gitignore`, `.kilocodemodes`, `.markdownlint.json` имеют executable bit.
- `.markdownlint.json` игнорируется `.gitignore`.
- Нет автоматических проверок (lint, ссылки).

Подробности и план — в `CHECKPOINT.md`.

---

## 7. Контакты и быстрые ссылки

- Конфиги управляются через `chezmoi`: [vovanbl411/dotfiles](https://github.com/vovanbl411/dotfiles)
- Быстрые ссылки: см. `README.md` → «Быстрые ссылки»

---

*Обновляй этот файл, если меняешь структуру проекта, стиль или ключевые соглашения.*

# CHECKPOINT.md — Текущее состояние проекта

> Файл состояния для ассистентов и автора.
> Показывает, что сейчас происходит в проекте, что синхронизировано, а что требует внимания.

---

## Метаданные

| Параметр | Значение |
|----------|----------|
| Дата последнего аудита | 2026-09-12 — политика `make.conf` и первый срез USE; аудиты `make.conf` и глобального USE — 2026-09-11; baseline ASUS B5402 — 2026-09-10 |
| Дата последнего рабочего checkpoint | 2026-09-09 |
| Ветка | `main` |
| Состояние рабочего дерева | изменения документации этой сессии не закоммичены |
| Последнее записанное состояние системы | Gentoo Linux, ядро `7.2.4-bdsm`, BIOS `B5402CBA.314`, systemd-boot, Secure Boot + TPM2; BIOS, Secure Boot и TPM-разблокировка проверены 2026-09-09, загрузочная цепочка — 2026-09-10 |
| Аппаратура | ASUS ExpertBook B5402, Intel Core i7-1260P (Alder Lake) |

---

## Общее состояние

В этой сессии проведён baseline-аудит ASUS B5402. Его результаты хранятся в
`systems/asus-b5402/audits/2026-09-10-system-audit.md`. Прежний аудит и
подготовленный вне Git каталог `configs/` отсутствуют и признаны устаревшими
источниками. Старые утверждения ниже сохраняют исторический контекст, но не
подтверждают текущее состояние машины.

Firewall и AppArmor отложены отдельными решениями. Этап установки и загрузки
закрыт 2026-09-10: Dracut является генератором UKI, Secure Boot и TPM2-
разблокировка проверены после пересборки UKI. Устаревший параметр
`security=apparmor` удалён; порядок LSM задан через `lsm=`. Аудит `make.conf`
завершён 2026-09-11: исправлены флаги GNU Fortran и параметры ccache. Очистка
2026-09-11 после сверки с официальными источниками: из живого `make.conf`
удалены невалидный токен `iris` в `VIDEO_CARDS` и no-op
`GOFLAGS="-buildmode=pie"` (PIE для Go-ebuild'ов добавляет `go-env.eclass`);
повторная проверка подтвердила итоговое состояние, документация
синхронизирована. Вопрос `GOFLAGS` закрыт. Аудит глобального USE зафиксирован:
устаревшие правила LLVM для `xwayland-satellite` и `rust-bin` удалены
владельцем системы, а остальные кандидаты ожидают отдельных решений.
`savedconfig` уже обновлён владельцем системы. 2026-09-12 владелец подтвердил
политику `-O3`/ThinLTO с исключениями `package.env`, явный набор `-mno-*` и
`MAKEOPTS="-j14 -l10"`; из глобального `USE` удалены семь флагов без
установленных потребителей (`mapi`, `vpp`, `zink`, `networkmanager`,
`udisks2`, `libnotify`, `acpi`), resolver-план подтвердил отсутствие
пересборок. Решение по политике ccache отложено владельцем. Следующий этап —
сужение оставшихся USE-флагов и пакетная политика Portage; живая система не
изменяется без отдельного согласования.

---

## Активная задача: оставшиеся параметры make.conf и Portage policy

Закрыто 2026-09-11/12: `GOFLAGS` удалён; политика `-O3`/ThinLTO, набор
`-mno-*` и `MAKEOPTS -j14 -l10` подтверждены владельцем; из глобального
`USE` удалены семь флагов без потребителей. Остались: решение по политике
ccache (глобально или точечно; отложено владельцем), сужение оставшихся
USE-кандидатов (`sound-server`, `screencast`, `lto`, `gles2`, `egl`,
`ffmpeg`, `v4l`, `pgo`, `custom-cflags`, `btrfs`) и пакетная политика
Portage: запись `gui-apps/noctalia::noctalia-local` в world-файле,
`video_cards_i915` у mesa, ядро и временные LLVM-исключения. Сначала собирать
доказательства, затем принимать отдельные решения; не выполнять обновления,
ребилды или очистку пакетов без согласования.

---

## Завершённая задача: публичная документация и системный журнал

Решение согласовано и реализовано локально 2026-09-09. Репозиторий
должен стать публичным практическим руководством по Gentoo с одной явно
обозначенной эталонной системой — ASUS ExpertBook B5402. Общие инструкции
нельзя смешивать с текущим состоянием этой машины и историей работ.

### Согласованная модель

- Тематические каталоги (`installation/`, `desktop/`, `networking/` и другие)
  содержат общие руководства: как установить, настроить и проверить компонент.
- `systems/asus-b5402/` хранит фактическое состояние и особенности эталонной
  машины, включая датированные аудиты.
- `troubleshooting/` содержит повторяемые решения проблем, применимые другим
  пользователям.
- `incidents/` предназначен для датированных расследований конкретных событий,
  а `archive/` — для устаревших материалов.
- `AGENTS.md` и `CHECKPOINT.md` остаются служебными файлами и не считаются
  пользовательскими инструкциями.

Для новых и существенно изменяемых документов планируется минимальная
метаинформация: `kind`, `scope`, `status`, `last_verified` и `verified_on`.
Массово добавлять её во все документы не нужно.

Основной контракт записан в `DOCUMENTATION_POLICY.md`, а правила для
участников — в `CONTRIBUTING.md`. `AGENTS.md` ссылается на этот контракт и не
является его заменой.

OpenSpec пока не внедрять. Вернуться к нему можно после появления стабильной
политики или необходимости согласовывать крупные изменения между несколькими
участниками.

### С чего начать

1. ~~Составить инвентаризацию Markdown-файлов и классифицировать каждый как
   общий, системный, смешанный, исторический или устаревший. На этом шаге
   ничего не перемещать.~~ **Выполнено 2026-09-09:** результат записан в
   `DOCUMENTATION_INVENTORY.md`; файлы не перемещались.
2. ~~Подготовить `DOCUMENTATION_POLICY.md`, `CONTRIBUTING.md` и шаблон
   метаинформации.~~ **Выполнено локально 2026-09-09.**
3. Проверить модель на пилотных документах. **Выполнено локально** для
   `desktop/noctalia-shell.md`,
   `troubleshooting/docker-29-iptables-missing.md` и
   `systems/asus-b5402/hardware/asus-expertbook.md`. Пилот на датированном
   системном аудите отложен: подтверждённого аудита нет, создавать его по
   старому handoff нельзя.
4. ~~Перенести смешанный и системный контент по принятой структуре.~~
   **Выполнено локально 2026-09-09:** общие руководства отделены от записей
   ASUS B5402, troubleshooting перенесён в свой каталог, исторические файлы —
   в `archive/`.

### Результат миграции

- Системные материалы находятся в `systems/asus-b5402/`; неподтверждённые
  записи явно помечены `status: draft` и `last_verified: null`.
- `hardware/asus-expertbook.md`, `hardware/cpu-optimization.md` и
  `hardware/second-disk.md` перенесены в системный раздел.
- Документы Docker/Libvirt и NetworkManager/iwd перенесены из `settings/` в
  `troubleshooting/`.
- BOLT и вариант nftables для OpenRC перенесены в `archive/`; пустой
  `ROADMAP.md` удалён.
- README и внутренние ссылки обновлены под новую структуру.

### Результат инвентаризации

- Классифицированы все 38 отслеживаемых Markdown-файлов: 10 общих,
  3 системных, 20 смешанных, 1 исторический, 2 устаревших и 2 служебных.
- `troubleshooting/system-vs-docs-drift-2026-06-13.md`, на который ссылаются
  `AGENTS.md` и этот checkpoint, отсутствует в рабочем дереве и истории Git.
- Упомянутые ниже `configs/README.md` и `configs/etc/portage/` также
  отсутствуют и никогда не отслеживались в текущей истории Git.
- 2026-09-09 решено не восстанавливать отсутствующие материалы. Они не
  используются как источники для новой политики или метаданных.

---

## Завершено: Noctalia Shell v5.0.1

- Миграция с Noctalia Shell `4.7.7` на стабильный релиз `5.0.1` применена.
- Установлен пакет `gui-apps/noctalia-5.0.1`; `noctalia --version` возвращает
  `noctalia v5.0.1`.
- Пакет установлен из `::guru`; Portage DB содержит источник `guru`.
- Локальный overlay `/var/db/repos/noctalia-local` и его запись в
  `/etc/portage/repos.conf/` удалены.
- Правила для testing-ветки перенесены в
  `/etc/portage/package.accept_keywords/noctalia` и не привязаны к имени
  репозитория.
- Noctalia v5 работает как нативная Wayland-оболочка с TOML-конфигурацией;
  прежний handoff для beta.9 больше не актуален.
- Переход на GURU завершён 2026-09-09.
- Общая инструкция оставлена в `desktop/noctalia-shell.md`, а подтверждённое
  состояние перенесено в `systems/asus-b5402/desktop/noctalia.md`.

---

## Устаревший handoff: очистка `/etc/portage`

> **Статус:** исторический и непроверенный. Описанный ниже каталог `configs/`
> отсутствует, поэтому этот раздел нельзя использовать как план применения или
> источник текущего состояния `/etc/portage`. Для возврата к теме потребуется
> новая инвентаризация живой системы.

### Граница изменений

- Живой `/etc/portage` **не изменялся**.
- `doas` и другие способы повышения привилегий не использовались.
- Новые конфиги подготовлены только в `configs/etc/portage/` для
  последующего ручного переноса владельцем системы.
- `configs/` пока untracked; коммит и применение не выполнялись.
- Подробный порядок ручного переноса и отката находится в
  `configs/README.md`.

### Согласованная политика toolchain

- Основной toolchain до официального LLVM 23: **LLVM/Clang/LLD 22**.
- Сохранены проверенные на этой системе `-O3`, ThinLTO, PGO,
  `custom-cflags`, CPU-флаги Alder Lake и ccache.
- BOLT, `/opt/llvm-bolt`, `bolt-clang`, `llvm-bolt` и `bolt-profiling`
  отсутствуют в активной кандидатной конфигурации.
- Перепрофилирование BOLT отложено до официального стабильного LLVM 23.
- `mold` используется только в целевых Rust-env (`p-cores` и
  `no-lto-llvm`); основной linker — LLD.
- `xwayland-satellite-0.8.1` пока поддерживает только LLVM 17–21, поэтому
  для него оставлено узкое исключение `rust-bin-1.94.1 + llvm_slot_21`.
  Это не основной toolchain; исключение нужно удалить после обновления
  ebuild с поддержкой LLVM 22.

### Что уже подготовлено

- `configs/etc/portage/make.conf` — явные пути LLVM 22, очищенный
  многострочный `USE`, оптимизационные флаги и HTTPS mirrors.
- `configs/etc/portage/env/` — только используемые env-файлы; сохранены
  проверенные `no-lto-llvm`, GCC/BFD, systemd, kernel, P-core и SSD
  исключения без BOLT.
- `configs/etc/portage/package.env/` — удалены активные `full.txt`,
  `*.save`, глобальное `*/* bolt-clang`, повторяющиеся atoms и конфликтующие
  linker-флаги; возвращён проверенный compatibility-набор.
- `configs/etc/portage/package.accept_keywords/` — 62 файла и 104 правила
  сведены к 7 файлам и 48 правилам без `**` и unbounded live LLVM;
  возвращены `~amd64` для установленных testing-пакетов `nspr`,
  `spirv-llvm-translator`, `gmmlib`, `intel-microcode`.
- `configs/etc/portage/package.use/` — 55 файлов и 83 правила сведены к
  7 тематическим файлам и 75 валидным правилам; удалены устаревшие флаги,
  пустой kernel-файл и дубли QEMU/OBS/installkernel.
- В `configs/README.md` записаны перенос, резервная копия, очистка world,
  проверки и ограничение: не запускать сразу `emerge -e @world`.

### Что уже проверено

- `bash -n` проходит для `make.conf`, `bashrc` и всех env-файлов.
- Clang `22.1.8` собрал тестовый C-бинарник с `-O3 -flto=thin` через
  LLD `22.1.8`.
- В конфигурации нет отсутствующих env-ссылок, повторяющихся atoms,
  неизвестных package USE-флагов, `**` keywords и активных BOLT-ссылок.
- `eix-test-obsolete` не нашёл non-matching entries в кандидатных
  `package.accept_keywords`, `package.use` и `package.env`.
- Изолированный Portage resolver на копии конфигурации в `/tmp` завершился
  с кодом `0`: `@system` плюс 216 отфильтрованных world-atoms, 24 операции
  (15 upgrades, 6 downgrades, 1 new slot, 2 reinstalls).
- Лучшие видимые версии основного toolchain: Clang `22.1.8`, LLD
  `22.1.8-r1`, LLVM `22.1.8`.
- После добавления compatibility-исключения исчез resolver-конфликт
  `xwayland-satellite` с Rust/LLVM.
- **Аудит 2026-07-31 (живая система vs кандидат):** bare `clang` на PATH
  разрешается в **LLVM 24 git** (`/usr/lib/llvm/24/bin/clang`), а живой
  `*/* bolt-clang` переопределяет его на BOLT'd LLVM 23 — то есть система
  реально собрана BOLT'd LLVM 23, не 22. Кандидат чинит это пиннингом
  абсолютных путей `/usr/lib/llvm/22/bin/`.
- `libclc-22.1.8`, `compiler-rt:22` и `rust-bin-1.94.1` — **stable** на
  amd64, keyword'ы не требуются; `package.license/` остаётся вне scope
  замены (применение мержем, не полной заменой).

### Что осталось доделать

> **Ребилд `@world` завершён успешно (2026-08-01).** Пункты 1, 3–6, 8, 9
> выполнены. Актуальные: п.2 (перенос `package.mask` и др. в `configs/`),
> п.7 (BOLT после LLVM 23).

1. ~~Продолжить аудит остальных каталогов `/etc/portage`, начиная с
   `package.license`.~~ **Решено (2026-07-31):** `package.license/`,
   `repos.conf/`, `binrepos.conf/` остаются как есть — применяется мерж
   шести согласованных областей, а не полная замена `/etc/portage`
   (см. `configs/README.md`). Неустановленные записи (`obsidian`,
   `chromium`) в `package.license` безвредны.
2. Проверить и при необходимости подготовить `package.mask`,
   `package.unmask`, `package.accept_restrict`, `package.cflags`, sets и
   остальные ещё не перенесённые части Portage.
3. После завершения всех частей повторить полный изолированный resolver и
   `eix-test-obsolete`, затем вручную просмотреть весь pretend-план.
4. Отдельно решить судьбу ожидаемых downgrade из текущего live LLVM 23 и
   testing-пакетов. Ничего из 24 операций автоматически не применять.
5. Только после финального review сделать Snapper-снимок, перенести файлы
   из `configs/` в root-shell и повторить проверки уже на живой системе.
6. Сначала собрать один-два некритичных пакета; полную пересборку мира не
   запускать до smoke-тестов и проверки `emerge --pretend --depclean`.
7. После официального LLVM 23 вернуться к переходу toolchain и заново
   выполнить BOLT-профилирование — не использовать старый профиль вслепую.
8. **PGO отключён на ребилде (2026-07-31), возвращён (2026-08-01):** при
   установленных LLVM 21+22 `llvm-profdata` из слота 22 не принимал профили
   формата v10 (LLVM 21) — `raw profile version mismatch: v10 vs expected
   v11`. Корневая причина — абсолютные пути в `CC` при поиске
   `llvm-profdata`/profiling-runtime через PATH попадали на слот 21. После
   возврата к bare `clang` + `eselect llvm` → 22 подтверждено: `clang` и
   `llvm-profdata` оба резолвятся в LLVM 22.1.8, форматы выровнены (v11).
   PGO возвращён, но с нюансами по совместимости с clang:
   - **binutils**: PGO через GCC (`env/gcc-fallback bfd`) — upstream
     `--enable-pgo-build` передаёт `-fprofile-use` без пути → clang ищет
     `default.profdata` в CWD → падает.
   - **bash**: PGO через GCC (`env/gcc-fallback bfd`) — ebuild GCC-style PGO
     без `llvm-profdata merge`, при clang ломается.
   - **xz-utils**: clang PGO ✓ (ebuild вызывает `llvm-profdata merge`).
   - **python**: upstream CPython PGO ✓ (clang-aware).
9. **Bare `CC`/`CXX` вместо абсолютных путей (2026-07-31), подтверждено
   (2026-08-01):** абсолютные пути ломают ebuild'ы, вставляющие
   `$(tc-getCPP)`/`$(tc-getCC)` в `sed` (`apparmor` и др.). Вернулись к bare
   `clang`/`clang++`. Подтверждено: `/usr/bin/clang` не существует — bare
   `clang` и `llvm-profdata` резолвятся через PATH (`/usr/lib/llvm/22/bin`)
   в LLVM 22.1.8. `clang-toolchain-symlinks` :21 и :22 создают versioned
   symlinks без конфликта за bare имя; :21 нужен для `xwayland-satellite`.

---

## Что совпадает с документацией

- Gentoo profile: `default/linux/amd64/23.0/no-multilib/hardened/systemd`
- Clang/LLVM toolchain, `COMMON_FLAGS`, `RUSTFLAGS`, `GOFLAGS`, ccache
- `CPU_FLAGS_X86`, `VIDEO_CARDS="intel iris zink"`
- Все задокументированные `CONFIG_*` параметры ядра
- `systemd-boot`, Secure Boot, measured UKI, TPM2 + LUKS2
- Btrfs layout и mount options
- Snapper config `root`
- NetworkManager + iwd
- `doas.conf`
- AppArmor, auditd, usbguard сервисы включены
- Niri 26.04 + Wayland + Noctalia 5.0.1
- PipeWire 1.6.8 + WirePlumber 0.5.15
- Intel i7-1260P, Vulkan `anv`

---

## Что расходится с документацией

| # | Компонент | Документация | Фактическое состояние | Источник аудита | Статус |
|---|-----------|--------------|----------------------|-----------------|--------|
| 1 | GPU driver | `xe`, `force_drivers+=" xe "` | `i915`, `add_drivers+=" i915 "`, `force_drivers+=" xe "` закомментирован | `troubleshooting/system-vs-docs-drift-2026-06-13.md` | ✅ Отражено в документации как "цель Xe / текущее состояние i915" |
| 2 | Линкер | `mold` | `lld` | `troubleshooting/system-vs-docs-drift-2026-06-13.md` | ✅ `installation/base-system.md`, `README.md` обновлены |
| 3 | BOLT Portage env | `/etc/portage/env/bolt-compiler` + `*/* bolt-compiler` | Файла нет; используются `bolt-clang`, `llvm-bolt`, `p-cores`, `ssd`, `no-lto-llvm`, `lld`, `gcc-fallback` | `troubleshooting/system-vs-docs-drift-2026-06-13.md` | ⚠️ Историческое состояние live `/etc`; новый кандидат отключает BOLT, но ещё не применён |
| 4 | OBS Studio | Подробный раздел `settings/obs-studio.md` | `media-video/obs-studio` не установлен | `troubleshooting/system-vs-docs-drift-2026-06-13.md` | ✅ Добавлено предупреждение prospective |
| 5 | Sysctl файл | `/etc/sysctl.d/99-security.conf` | `/etc/sysctl.d/99-hardened-kernel.conf` | `troubleshooting/system-vs-docs-drift-2026-06-13.md` | ✅ Исправлен путь в `security/kernel-hardening.md` |
| 6 | Kernel cmdline | `lsm=landlock,bpf,apparmor` | `lsm=landlock,lockdown,yama,integrity,apparmor,bpf` | `troubleshooting/system-vs-docs-drift-2026-06-13.md` | ✅ Обновлено в `installation/systemd-uki-setup.md` |
| 7 | Global USE | Частичный набор | Дополнительно: `icu udisks2 dist-kernel btrfs zstd libnotify policykit acpi libinput openssl` | `troubleshooting/system-vs-docs-drift-2026-06-13.md` | ✅ `USE=` в `installation/base-system.md` актуализирован |
| 8 | Per-package USE | Упрощённые флаги | Реальные флаги шире и используют `llvm_slot_22` вместо `llvm_slot_21` | `troubleshooting/system-vs-docs-drift-2026-06-13.md` | ✅ Добавлен раздел 9.5 в `managed/portage.md`; `firefox.md`, `systemd-uki-setup.md` обновлены |

---

## Структурные проблемы

| Проблема | Место | Приоритет |
|----------|-------|-----------|
| `ROADMAP.md` пустой | корень | Средний |
| Дублирование nftables Docker+Libvirt | `settings/nftables.md` vs `settings/nftables-docker-libvirt.md` | Средний |
| `settings/nftables.md` не указан в `README.md` | `README.md` | Низкий |
| `settings/obs-studio.md` — возможен битый fenced code block ~834 строка | `settings/obs-studio.md` | Средний |
| `.gitignore` имеет executable bit | корень | Низкий |
| `.markdownlint.json` в `.gitignore` | корень | Низкий |
| Нет `AGENTS.md` и `CHECKPOINT.md` | корень | **Решено** |
| Нет автоматических проверок | корень | Низкий |

---

## План действий

### Перед началом работы над синхронизацией

```bash
# Выполнять в root-shell: сделать снапшот системы на случай отката
snapper -c root create -d "pre-docs-sync-YYYY-MM-DD"
```

### 1. Решить судьбу GPU-драйвера

- **Вариант А**: оставить `i915` (сейчас работает) — убрать `xe` из доки и dracut.
- **Вариант Б**: перейти на `xe` — раскомментировать `force_drivers+=" xe "`, убрать `add_drivers+=" i915 "`, пересобрать UKI.

Затронутые файлы:
- `hardware/intel-graphics.md`
- `installation/systemd-uki-setup.md`
- `/etc/dracut.conf.d/10-drivers.conf` (на системе)

### 2. Синхронизировать линкер — кандидат подготовлен

- Основной linker: LLD 22.
- `mold` оставлен только для выбранных Rust-сборок через package env.
- Кандидат находится в `configs/etc/portage/`; в живую систему не перенесён.

### 3. BOLT — отложено до официального LLVM 23

- Не переносить текущие `bolt-clang`, `llvm-bolt` и `bolt-profiling` в
  очищенную конфигурацию.
- После официального LLVM 23 заново собрать профиль и только затем вернуть
  BOLT в package env.

### 4. Разобраться с OBS Studio

- Либо `emerge -av media-video/obs-studio` с нужными USE-флагами.
- Либо переместить `settings/obs-studio.md` в `.history/` и убрать из навигации.

### 5. Мелкие правки документации

- Исправить путь `sysctl.d` (`99-hardened-kernel.conf`).
- Обновить kernel cmdline.
- Добавить полный актуальный `USE=`.
- Обновить per-package USE для `gentoo-kernel`, `installkernel`, `firefox`, `ffmpeg`, `pipewire`.
- Исправить `llvm_slot_21` → `llvm_slot_22` где актуально, кроме временного
  compatibility-исключения `xwayland-satellite`.

### 6. Проверить под root

- `nft list ruleset` — соответствует ли доке.
- `aa-status`, `usbguard list-rules`.
- `/etc/audit/rules.d/security.rules` vs `/etc/audit/rules.d/*.rules`.

### 7. Структурные улучшения

- Заполнить или удалить `ROADMAP.md`.
- Консолидировать nftables-документы.
- Проверить и исправить `settings/obs-studio.md` на битые блоки кода.
- Убрать executable bit с `.gitignore`, `.kilocodemodes`, `.markdownlint.json`.
- Решить судьбу `.markdownlint.json` (вынести из игнора или удалить).

### 8. Добавить Perplexity в chezmoi

> Запланировано на ближайшее будущее после первоначальной интеграции AppImage.

Чтобы интеграция Perplexity воспроизводилась при `chezmoi init --apply`, нужно перенести соответствующие файлы в `vovanbl411/dotfiles`:

- `~/.local/share/applications/perplexity.desktop` → `dotfiles/dot_local/share/applications/perplexity.desktop`
- `~/.local/share/icons/hicolor/*/apps/Perplexity.png` → `dotfiles/dot_local/share/icons/hicolor/*/apps/Perplexity.png`
- Скрипт установки/обновления AppImage:
  - либо `run_once_install-perplexity.sh` в `dotfiles/.chezmoiscripts/`,
  - либо `dot_local/bin/Perplexity.AppImage` как managed binary (если не боятся коммитить 120 МБ).

Рекомендуемый подход:

1. В `dotfiles` создать `.chezmoiscripts/run_once_after_install-perplexity.sh`.
2. Скрипт должен:
   - проверять наличие `~/.local/bin/Perplexity.AppImage`;
   - при отсутствии скачивать последнюю версию (например, через `curl`/`wget`) или копировать из резервной копии;
   - делать файл исполняемым;
   - извлекать иконки;
   - обновлять `.desktop` при изменении пути/версии.
3. Добавить `.desktop` и иконки в `dot_local/share/...` как обычные managed-файлы chezmoi.

После переноса обновить `settings/perplexity.md`: заменить ручные шаги на ссылку на `chezmoi apply` и описание скрипта.

---

## Что не удалось проверить без root

- Содержимое `/boot/`, `/boot/loader/entries/`
- `btrfs subvolume list /`
- `aa-status`, `usbguard list-rules`, `nft list ruleset`
- `/etc/audit/rules.d/`, `/etc/usbguard/rules.conf`, `/etc/usbguard/usbguard-daemon.conf`
- Рантайм `net.core.bpf_jit_harden`
- Wayland portals, greetd, GTK-конфиги, Firefox PSD, Flatpak remotes

---

## Источники правды

- Контракт документации: `DOCUMENTATION_POLICY.md`.
- Правила подготовки изменений: `CONTRIBUTING.md`.
- Классификация текущих файлов: `DOCUMENTATION_INVENTORY.md`.
- Состояние эталонной системы: `systems/asus-b5402/`.
- Техническое состояние системы требует новой фактической проверки. Файлы в
  `.codex/` остаются локальным рабочим контекстом и не подтверждают публичные
  утверждения сами по себе.

---

## История изменений

| Дата | Событие |
|------|---------|
| 2026-09-12 | Подтверждена политика `make.conf` (`-O3`/ThinLTO, `-mno-*`, `-l10`); из глобального USE удалены 7 флагов без потребителей, resolver-план без пересборок; зафиксированы кандидаты: world-запись `noctalia-local`, `video_cards_i915` у mesa |
| 2026-09-11 | Аудиты `make.conf` и глобального USE; сверка с официальными источниками (GCC, ccache, вики Gentoo); из `make.conf` удалены невалидный `VIDEO_CARDS`-токен `iris` и no-op `GOFLAGS`; `base-system.md` и `boot-and-portage.md` синхронизированы |
| 2026-09-09 | BIOS ASUS B5402CBA обновлён с `313` до `314`; ошибка проверки образа устранена временным отключением Secure Boot, после обновления Secure Boot включён, автоматическая TPM2-разблокировка LUKS подтверждена |
| 2026-09-09 | Завершена структурная миграция: общие руководства отделены от `systems/asus-b5402/`, troubleshooting и архивные материалы перенесены в свои каталоги, `ROADMAP.md` удалён |
| 2026-09-09 | Noctalia разделена на общее руководство и состояние `systems/asus-b5402/desktop/noctalia.md`; создана начальная страница эталонной системы |
| 2026-09-09 | Отсутствующие аудит 2026-06-13 и `configs/` признаны устаревшими источниками; добавлены политика, правила участия и frontmatter трём доступным пилотным документам |
| 2026-09-09 | Добавлен `DOCUMENTATION_INVENTORY.md`: классифицированы все 38 отслеживаемых Markdown-файлов без перемещений; обнаружено отсутствие датированного аудита и `configs/`, на которые ссылается handoff |
| 2026-09-09 | Согласована модель публичной документации с отдельными слоями для общей информации, эталонной системы, troubleshooting и истории; реализация перенесена на следующую сессию, OpenSpec отложен |
| 2026-09-09 | Noctalia `5.0.1` переведена на `::guru`; локальный overlay `noctalia-local` и его `repos.conf` удалены, правила для testing-ветки сохранены в `/etc/portage/package.accept_keywords/noctalia` |
| 2026-09-08 | Миграция с Noctalia Shell `4.7.7` на стабильный релиз `5.0.1` закрыта; локально подтверждены установленный пакет, версия CLI и overlay `/var/db/repos/noctalia-local` |
| 2026-08-01 | Документация синхронизирована с системой: ffmpeg/obs-studio USE (мёртвые `vpl`/`av1`/`shaderc`/`pgo` → `dav1d`); BOLT помечен как отключённый (`cpu-optimization.md`, `bolt.md`); RUSTFLAGS → bare `clang`; `.gitignore` дополнен (`.kilocodemodes`, `result-rebuild.md`, `graphify-out/`) |
| 2026-08-01 | **Ребилд `@world` с PGO завершён успешно.** Итоговая PGO-конфигурация: `bash`/`binutils` — GCC PGO+LTO (`gcc-fallback bfd`, upstream PGO несовместим с clang); `xz-utils`/`python` — clang PGO (`llvm-profdata` / upstream CPython). Глобальный `pgo` в `make.conf` оставлен — прочие `IUSE pgo` пакеты прошли с clang без ошибок. Bare `CC`/`CXX` (`clang`/`clang++`) подтверждены, `eselect llvm` → 22 |
| 2026-08-01 | Ребилд `@world` завершён; PGO возвращён (clang+llvm-profdata → LLVM 22, v11); bare `CC`/`CXX` подтверждены — `/usr/bin/clang` отсутствует, резолвится через PATH в `/usr/lib/llvm/22/bin` |
| 2026-07-31 | Ребилд `@world` запущен: `neovim ~amd64` (tree-sitter conflict); USE-аудит — `liblc3`→pipewire, `dav1d`→ffmpeg, keepassxc убран (flatpak); **PGO временно отключён** — `llvm-profdata` v22 не принимает профили v10 (смешение слотов LLVM 21+22) |
| 2026-07-31 | Сверка живой системы с кандидатом: bare `clang` → LLVM 24 (PATH-дрейф), реальная сборка — BOLT'd LLVM 23; добавлены 4 потерянных keyword'а (`nspr`, `spirv-llvm-translator`, `gmmlib`, `intel-microcode`); подтверждено, что `libclc`/`compiler-rt:22`/`rust-bin-1.94.1` stable; `package.license` вынесен из scope замены |
| 2026-07-26 | `configs/etc/portage/` отревьюены: возвращены потерянные правила (`docker`/`libvirt -iptables`, `libclc` slot-pin, `cpptrace`/`libdwarf` keywords и др.); выявлено 4 слота LLVM на системе (21/22/23/24-live), фокус на 22 |
| 2026-07-19 | Подготовлен и изолированно проверен кандидат очистки Portage на LLVM 22; применение отложено |
| 2026-06-13 | Проведён аудит дрейфа `system-vs-docs-drift-2026-06-13.md` |
| 2026-06-14 | Созданы `AGENTS.md` и `CHECKPOINT.md` |
| 2026-06-14 | Добавлен `settings/perplexity.md`, интегрирован Perplexity AppImage в меню приложений |

---

*Обновляй этот файл после каждой сессии синхронизации или крупных изменений.*

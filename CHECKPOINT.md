# CHECKPOINT.md — Текущее состояние проекта

> Файл состояния для ассистентов и автора: что сделано, что синхронизировано,
> что требует внимания.

---

## Метаданные

| Параметр | Значение |
|----------|----------|
| Дата последнего аудита | 2026-09-14 — `/etc/portage` целиком (USE, `package.use`, `package.env`/`env`, keywords, license, savedconfig); baseline системы — 2026-09-10 |
| Ветка | `main` |
| Рабочее дерево | изменения этой сессии не закоммичены |
| Система | Gentoo, ядро `7.2.5-bdsm`, BIOS `B5402CBA.314`, systemd-boot + UKI, Secure Boot + TPM2 (авторазблокировка LUKS реально проверена 2026-09-14) |
| Аппаратура | ASUS ExpertBook B5402, i7-1260P (Alder Lake) |

---

## Состояние системы

- **Профиль**: `default/linux/amd64/23.0/no-multilib/hardened/systemd`.
- **Toolchain**: Clang/LLD 22 основной (`-O3`, ThinLTO, PGO); LLVM 23.1.1 —
  им намеренно собирается ядро (env `kernel-llvm`, пилот); слоты 21/24
  удалены; `rust-bin-1.97.1`; BOLT отложен.
- **make.conf** (политика 2026-09-12): `-O3`/ThinLTO с исключениями
  `package.env`, явный `-mno-*`, `MAKEOPTS="-j14 -l10"`, ccache глобально.
- **/etc/portage** — закрыт аудитами 2026-09-14: `package.use` — батчи
  1–9; `package.env` — 4 файла, 117 правил, `env/` — 8 файлов; keywords —
  10 доменных файлов, 104 правила; license и savedconfig почищены.
- **Resolver-эталон** (2026-09-14, утро): `emerge -pvuDN @world` — 0 пакетов.
  Вечером принято world-обновление (`libpcap-1.10.7`, `wayland-1.25.0` +
  выделенный `dev-util/wayland-scanner`, soft block решён автоматически) —
  эталон перепроверить.
- **Загрузка**: systemd-boot + UKI (генератор — Dracut, `dracut-cpio`); LSM
  через `lsm=` (без `security=apparmor`); cmdline дополнен
  `audit_backlog_limit=8192` (2026-09-14).
- **Ядро 7.2.5 пересобрано 2026-09-14**: `RT_GROUP_SCHED_DEFAULT_DISABLED=y`
  (rtkit получил realtime, RR 99), `BT_HIDP=m`, `uinput` в
  `/etc/modules-load.d/uinput.conf`. Ошибки rtkit и kauditd-overflow в
  журнале — 0; hidp/uinput ждут проверки живым BT-устройством.
- **TPM2-разблокировка LUKS**: токен перезачислен на PCR 7 (sha256) 2026-09-14,
  проверена реальной загрузкой. Известно: смена cmdline/UKI может ломать
  анлок (эпизоды марта/апреля и 2026-09-14). Решение 2026-09-14 — остаёмся
  на PCR 7, переход на ukify/PCR-подпись отклонён.
- **Рабочий стол**: Pure Wayland — Niri + Noctalia 5.0.1 (`::guru`),
  PipeWire, `xwayland-satellite-0.8.2`.
- Firewall и AppArmor отложены отдельными решениями; живая система не
  изменяется без согласования.

---

## Хвосты и календарь

- Удалить пустой каталог `/etc/portage/profile/package.use.force`.
- Waydroid: маска `=1.6.3` (верхняя версия в `::guru`) — снять, когда
  выйдет исправленный релиз.
- cpptrace — prospective (Noctalia crash-handler): правила в
  `package.use/30-graphics-desktop` и `keywords/90-prospective`.
- `savedconfig/sys-kernel/linux-firmware-20260910` оставлен владельцем
  осознанно (USE `savedconfig` выключен).
- ccache: замер hit rate — окно середина октября…начало ноября 2026
  (`--zero-stats` от 2026-09-12).
- LLVM 23: перевод пакетов, когда ebuild'ы потребителей объявят
  `llvm_slot_23`.
- LLVM 23 rollout (`env/llvm-23`): осознанно отложен до завершения
  Experiment B (-O2 vs -O3) и выбора optimization baseline — сначала
  оптимизационная политика, потом постоянный compiler policy
  (`experiments/llvm23-toolchain/`).
- Backup-UKI `/boot/EFI/Linux/gentoo-7.2.5-bdsm-backup.efi` — оставить или
  удалить, решает владелец.
- Версионированный savedconfig `gentoo-kernel-7.2.5` удалён; конфиг живёт
  только в rolling-файле `gentoo-kernel`. Если удаление было случайным —
  восстановить копированием.
- При следующем изменении cmdline: снять `tpm2_pcrread sha256:7` до/после и
  сравнить — подтвердит, что cmdline меняет PCR 7 (quirk прошивки ASUS).
- Если после пересборки UKI/cmdline снова запрошен пароль LUKS —
  перезачислить токен: `systemd-cryptenroll --tpm2-device=auto
  --tpm2-pcrs=7 --wipe-slot=tpm2 /dev/nvme1n1p2`.
- Косметика прошивки ASUS, принятая как есть: ACPI `WIST`/`CNVW`,
  `ucsi_acpi` «bogus connector», ddcutil-retries, sixaxis-строка bluetoothd.

---

## Методика аудита

- Список флагов/атомов — из сплошных прогонов VDB и конфигов, не из
  ручных списков (`equery uses` неполон).
- Перед выключением флага смотреть `REQUIRED_USE`; помнить про `use.force`
  профиля (сильнее `package.use`).
- Правки владелец применяет сам; команды — без переменных и heredoc
  (его shell — fish); проверять строгими счётчиками и resolver-эталоном.
- Команды перед отдачей проверять на существование действия/флага в
  установленной версии инструмента; агент никогда не запускает `doas` сам
  (audit-логирование попыток аутентификации).

---

## Источники правды

- Контракт документации: `DOCUMENTATION_POLICY.md`; правила изменений:
  `CONTRIBUTING.md`; классификация: `DOCUMENTATION_INVENTORY.md`.
- Состояние эталонной системы: `systems/asus-b5402/`.
- Рабочие аудиты — `.history/systems/asus-b5402/audits/` (локально, вне
  Git; соглашение 2026-09-13: аудиты не публикуются).
- `.codex/` — локальный контекст, публичных утверждений не подтверждает.

---

## История изменений

| Дата | Событие |
|------|---------|
| 2026-09-20 | Эксперимент LLVM 23 (`experiments/llvm23-toolchain/`): фаза A (совместимость Clang/LLD 23 при сохранении GNU-рантайма) завершена — A1–A4 PASS (libde265, libunistring, mesa_clc, mesa через `--buildpkgonly`). Experiment B (-O2 vs -O3) в работе: B1 (libde265) — O3 ~1.2% быстрее, `.text` ~12.3% больше; B2 (zstd 1.5.7-r1) — смешанный результат: compression ~1–2% быстрее, decompression ~1–2% медленнее, `libzstd` `.text` ~9.2% больше; B3 (openssl 3.5.8, crypto, без LTO по политике ebuild) — преимущества O3 нет (AES ≈ ничья, SHA ~-0.5%, ChaCha20 ~-1%), `libcrypto` `.text` +2.6%. Каноническая методика бенчмарков зафиксирована (`benchmark-methodology.md`). Глобальное решение O2/O3 открыто. Production-политика не менялась: Clang/LLD 22, `-O3` + ThinLTO. Rollout `env/llvm-23` осознанно отложен до завершения B |
| 2026-09-14 | Диагностика журнала живой системы: ядро 7.2.5 пересобрано (`RT_GROUP_SCHED_DEFAULT_DISABLED=y` → rtkit realtime; `BT_HIDP=m` + `uinput` в modules-load), `audit_backlog_limit=8192` в cmdline UKI — шум rtkit/kauditd/bluetoothd закрыт. TPM2-токен LUKS перезачислен (PCR 7): автозаблокировка реально проверена; ломалась эпизодически (март/апрель) и 2026-09-14 после смены cmdline. Мир обновлён: `libpcap-1.10.7`, `wayland-1.25.0` + `wayland-scanner`. Решение: остаёмся на PCR 7, ukify отклонён |
| 2026-09-14 | `/etc/portage` закрыт аудитами и реорганизован: `package.env`/`env` 221→117 правил, env 11→8 файлов (no-op `lld`, сироты, мёртвые атомы); keywords — 10 доменных файлов, 104 правила (дубли, мёртвые, no-op stable-пины сняты); license и savedconfig почищены; resolver-эталон 0 пакетов. Исправлены две ошибки категории в аудите: xwayland-satellite (gui-apps, установлен), packer (dev-util, установлен — keyword/license/world восстановлены) |
| 2026-09-13 | USE-серия (батчи 1–9) закрыта: NM `-modemmanager -ppp -bluetooth`, qemu только x86_64, libvirt `virtiofsd`, глобальный USE без мёртвых флагов; руководства синхронизированы (base-system, firefox, networkmanager-iwd, systemd-uki-setup); `dracut-cpio` включён владельцем; рабочие аудиты перенесены в `.history/` |
| 2026-09-12 | Политика `make.conf` подтверждена; 7 USE-флагов без потребителей удалены; `video_cards_i915` и `llvm_slot_*` сняты; world к одной записи noctalia; ccache оставлен с замером через 4–8 недель |
| 2026-09-11 | Аудит `make.conf`: невалидный `iris` и no-op `GOFLAGS` удалены |
| 2026-09-10 | Baseline-аудит системы; загрузочная цепочка (UKI, Secure Boot, TPM2) проверена; `lsm=` вместо `security=apparmor` |
| 2026-09-09 | Структурная миграция репо; политика/CONTRIBUTING/инвентаризация; Noctalia → `::guru`; BIOS 313→314 |
| 2026-08-01 | Ребилд `@world` с PGO успешен (GCC-PGO: bash/binutils; clang-PGO: xz-utils/python) |
| 2026-07-19…31 | Кандидат очистки `/etc/portage` на LLVM 22 применён; вскрыт PATH-дрейф bare `clang` |
| 2026-06-13/14 | Первый аудит дрейфа (файл утрачен); созданы `AGENTS.md` и `CHECKPOINT.md` |

---

*Обновляй после каждой сессии синхронизации или крупных изменений.*

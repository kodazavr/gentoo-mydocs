# CHECKPOINT.md — Текущее состояние проекта

> Файл состояния для ассистентов и автора.
> Показывает, что сейчас происходит в проекте, что синхронизировано, а что требует внимания.

---

## Метаданные

| Параметр | Значение |
|----------|----------|
| Дата последнего аудита | 2026-09-13 — серия USE-аудитов закрыта (батчи 1–9); политика `make.conf` и первый срез USE — 2026-09-12; baseline системы — 2026-09-10 |
| Ветка | `main` |
| Состояние рабочего дерева | изменения этой сессии не закоммичены |
| Последнее записанное состояние системы | Gentoo Linux, ядро `7.2.5-bdsm`, BIOS `B5402CBA.314`, systemd-boot + UKI, Secure Boot + TPM2; загрузочная цепочка проверена 2026-09-10 |
| Аппаратура | ASUS ExpertBook B5402, Intel Core i7-1260P (Alder Lake) |

---

## Текущее состояние системы

Подтверждено аудитами 2026-09-10…13. Заново проверять без изменений системы
не нужно; новый resolver-план нужен только после мирового обновления.

- **Профиль**: `default/linux/amd64/23.0/no-multilib/hardened/systemd`.
- **Toolchain**: Clang/LLD 22 — основной, `-O3` + ThinLTO + PGO
  (`eselect llvm` → 22); слот 23.1.1 установлен — им намеренно собирается
  ядро (env `kernel-llvm`; пилот перед переводом пакетов на LLVM 23);
  слоты 21 и 24 удалены; `xwayland-satellite` не установлен;
  `rust-bin-1.97.1`; BOLT отложен.
- **make.conf**: политика закрыта 2026-09-12 — `-O3`/ThinLTO с исключениями
  `package.env`, явный набор `-mno-*`, `MAKEOPTS="-j14 -l10"`, ccache глобально.
- **Загрузка**: systemd-boot + UKI (Dracut + ukify, `dracut-cpio` включён
  владельцем 2026-09-13 после аудита); Secure Boot и TPM2-разблокировка
  LUKS2 проверены; LSM задан через `lsm=` (устаревший `security=apparmor` удалён).
- **Рабочий стол**: Pure Wayland — Niri + Noctalia 5.0.1 (`::guru`), PipeWire.
- **Глобальный USE**: вычищен — удалены флаги без потребителей (`mapi`, `vpp`,
  `zink`, `networkmanager`, `udisks2`, `libnotify`, `acpi`, позднее `wifi`);
  `sound-server`, `screencast`, `lto`, `gles2` перенесены в `package.use`;
  правила `video_cards_i915` (mesa) и все `llvm_slot_*` удалены.
- **Отложенные решения**: firewall и AppArmor — отдельными решениями.
- Живая система не изменяется без отдельного согласования.

### Ожидает применения

- Мировое обновление применено частично: NM пересобран с новыми флагами,
  `modemmanager` и `ppp` удалены. При этом `sys-fs/virtiofsd` не установлен
  при живом правиле `app-emulation/libvirt virtiofsd` — проверить
  ближайшим `emerge -avuDN @world`.

---

## Завершено 2026-09-13: серия USE-аудитов и уборка документации

Серия по-пакетного аудита USE закрыта целиком: батчи 1–9, все тематические
файлы `package.use` (`00-toolchain` … `90-prospective`) подтверждены.
Ключевые исходы серии: NetworkManager — `-modemmanager -ppp -bluetooth`;
qemu — единственный таргет x86_64; libvirt — `virtiofsd`; X-пины GLX-стека
(mesa, libglvnd, libepoxy) подтверждены требованиями xwayland; строки
`RUBY_TARGETS` удалены владельцем. Батчи 8–9 (2026-09-13): `00-toolchain` —
все 5 правил живые, правок нет; `90-prospective` — все 7 правил валидны,
swayimg оказался пакетом `::guru`.

Уборка документации выполнена: руководства синхронизированы с итогами
аудита — `installation/base-system.md` (USE без `wifi`, RUSTFLAGS с абсолютным
путём LLVM), `settings/firefox.md` (правило без `llvm_slot`, пины
`-wifi -jpegxl -jumbo-build`), `networking/networkmanager-iwd.md` (пины NM),
`installation/systemd-uki-setup.md` (заметка про `dracut-cpio`); frontmatter
синхронизированных документов получил `status: current` и дату проверки.
Рабочие аудиты перенесены в `.history/systems/asus-b5402/audits/` (локально,
вне Git): в публичном репо их нет, факты живут в руководствах и здесь.

### Решения владельца из серии — применены 2026-09-13

Перенос правила wireshark в тематический файл, уборка дубля libjxl и строки
`bash llvm-22`, снятие всех llvm-22-пинов в package.env — выполнено
владельцем. cpptrace оставлен как prospective.

---

## Завершено 2026-09-14: уборка package.env и env

Аудит 2026-09-13 (рабочий файл —
`.history/systems/asus-b5402/audits/2026-09-13-package-env-audit.md`),
правки применены владельцем и перепроверены 2026-09-14. Итог:

- `env/` — 8 файлов (bfd, gcc-fallback, java, kernel-llvm, no-lto-llvm,
  p-cores, problem-llvm, ssd), каждый используется, сирот нет.
- `20-compatibility` — 100 правил `no-lto-llvm` (+ `ssd` у mesa) и шапка;
  env `lld` и его 82 no-op-правила удалены, systemd переведён на
  `no-lto-llvm`.
- Мёртвые атомы удалены: `zed`, `yajl`, `libdwarf`, `libunwind`,
  `systemtap`, `cyrus-sasl`, env-строка cpptrace (use/keywords-правила
  cpptrace остаются prospective).
- `env/kernel-llvm` оставлен на LLVM 23 — намеренный пилот; в будущем на
  слот 23 переедут и другие пакеты.
- make.conf: комментарий переписан без ссылки на несуществующий
  `configs/README.md`.
- Всего правил: 221 → 117 (00-toolchain 4, 10-performance 3,
  20-compatibility 100, 30-gcc-fallback 10). Пересборок не требуется.

### Методика серии аудитов USE

- Список флагов брать из VDB `IUSE` (`equery uses` неполон).
- Перед выключением флага смотреть `REQUIRED_USE`.
- Помнить про `use.force` профиля (сильнее `package.use`).

---

## Календарь и отложенные решения

- **Замер ccache** (старт 2026-09-12, снятие — середина октября…начало ноября
  2026): сначала `CCACHE_DIR=/var/tmp/ccache ccache --zero-stats`, затем
  4–8 недель обычной работы и снятие hit rate.
- **Переход на LLVM 23**: когда ebuild'ы потребителей объявят `llvm_slot_23`
  (сигнал — дефолты сами перевернутся на 23).
- **Осознанно оставлены владельцем**: `savedconfig/sys-kernel/linux-firmware-20260810`
  (USE `savedconfig` выключен) и `*.bak` рядом с ним.

---

## Источники правды

- Контракт документации: `DOCUMENTATION_POLICY.md`.
- Правила подготовки изменений: `CONTRIBUTING.md`.
- Классификация файлов: `DOCUMENTATION_INVENTORY.md`.
- Состояние эталонной системы: `systems/asus-b5402/`.
- Рабочие аудиты серии — локально в `.history/systems/asus-b5402/audits/`,
  вне Git (соглашение 2026-09-13: аудиты — рабочий материал, не публикуется).
- Файлы в `.codex/` — локальный рабочий контекст, публичных утверждений
  самостоятельно не подтверждают.

---

## История изменений

| Дата | Событие |
|------|---------|
| 2026-09-14 | Уборка `package.env`/`env` применена владельцем и перепроверена: `env/lld` + 82 no-op-правила удалены, systemd → `no-lto-llvm`, 6 мёртвых атомов удалены, `env/llvm-22` удалён, шапка `20-compatibility` добавлена, комментарий make.conf исправлен; kernel-llvm закреплён на LLVM 23 как пилот; правила 221 → 117, env-файлов 11 → 8 |
| 2026-09-13 | Аудит `package.env`/`env`: `env/lld` — no-op против глобального LDFLAGS (82 правила), `env/llvm-22` осиротел после чистки владельцем, `systemd-llvm` ≈ дубль `no-lto-llvm`, 6 мёртвых атомов, ядро собирается LLVM 23 при основном 22; зафиксировано: слот 21 удалён, xwayland-satellite снесён, rust-bin 1.97.1, ядро 7.2.5, modemmanager/ppp удалены, virtiofsd не установлен при живом правиле |
| 2026-09-13 | Закрыты батчи 8–9 (`00-toolchain`, `90-prospective`) — правок не потребовалось; руководства синхронизированы с итогами серии (base-system, firefox, networkmanager-iwd, systemd-uki-setup); рабочие аудиты перенесены в `.history/`; зафиксировано включение владельцем `dracut-cpio` у dracut |
| 2026-09-13 | Батчи USE 2–7 закрыты (Qt ×11, сервисы/сеть, виртуализация, системные, остаток `10-system`, графика/медиа): NM почищен, qemu сокращён до x86_64, libvirt +`virtiofsd`, батчи 5–6 без правок, `wifi` удалён из глобального USE, строки `RUBY_TARGETS` удалены владельцем; начата уборка документации — CHECKPOINT переписан без устаревших разделов |
| 2026-09-12 | Политика `make.conf` подтверждена (`-O3`/ThinLTO, `-mno-*`, `-j14 -l10`); из глобального USE удалены 7 флагов без потребителей; `sound-server`/`screencast`/`lto`/`gles2` сужены в `package.use`; пакетная политика закрыта (`video_cards_i915` и `llvm_slot_*` удалены); world-файл приведён к одной записи noctalia; ccache оставлен глобально с контрольным замером через 4–8 недель |
| 2026-09-11 | Аудиты `make.conf` и глобального USE со сверкой с официальными источниками; из `make.conf` удалены невалидный токен `iris` и no-op `GOFLAGS`; `base-system.md` синхронизирован |
| 2026-09-10 | Baseline-аудит системы ASUS B5402; загрузочная цепочка (Dracut UKI, Secure Boot, TPM2) проверена; `security=apparmor` заменён на `lsm=` |
| 2026-09-09 | Структурная миграция (общие руководства / `systems/` / `troubleshooting/` / `archive/`); приняты `DOCUMENTATION_POLICY.md`, `CONTRIBUTING.md`, инвентаризация; Noctalia 5.0.1 переведена на `::guru`; BIOS обновлён 313→314, Secure Boot включён обратно |
| 2026-08-01 | Ребилд `@world` с PGO успешен; PGO bash/binutils через GCC (`gcc-fallback`), xz-utils/python через clang; bare `CC`/`CXX` (`clang` через PATH → LLVM 22) подтверждены |
| 2026-07-19…31 | Подготовлен и изолированно проверен кандидат очистки `/etc/portage` на LLVM 22; вскрыт PATH-дрейф bare `clang` на live-слот; кандидат применён и закрыт ребилдом 2026-08-01 |
| 2026-06-13 | Первый аудит дрейфа «система vs документация» (файл впоследствии утрачен, признан устаревшим источником) |
| 2026-06-14 | Созданы `AGENTS.md` и `CHECKPOINT.md` |

---

*Обновляй этот файл после каждой сессии синхронизации или крупных изменений.*

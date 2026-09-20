---
kind: reference
scope: system
status: draft
last_verified: null
verified_on: [asus-b5402]
---

# Эксперимент: LLVM 23 toolchain

Этот каталог хранит исследовательский план перехода основной сборочной цепочки
ASUS ExpertBook B5402 с LLVM 22 на LLVM 23 и связанное исследование
optimization policy.

Материал здесь не является подтверждённым состоянием системы и не заменяет
`systems/asus-b5402/`. После завершения отдельных этапов подтверждённые
результаты должны быть перенесены в системную документацию или общие guides.

## Документы

- [Toolchain-праймер](toolchain-primer.md) — пять слоёв цепочки и фактическая
  конфигурация машины;
- [Гипотеза: -O2 против -O3](optimization-o2-o3.md) — дизайн Experiment B,
  критерии выбора пакетов, критерий решения;
- [Бенчмарки -O2/-O3](o2-o3-benchmarks.md) — методология измерений и
  результаты B1;
- [Журнал результатов](results.md) — записи по гейтам, итоги Experiment A.

## Цели

1. Совместим ли переход compiler/linker stack с Clang/LLD 22 на Clang/LLD 23
   без одновременной смены runtime-архитектуры. — **Experiment A: COMPLETE**
   (совместимость доказана для протестированных классов; производительность
   LLVM 22 vs 23 не измерялась).
2. Даёт ли LLVM 23 практический выигрыш по времени сборки, размеру бинарников
   или производительности на Alder Lake. — открытый вопрос, benchmark'ов
   нет.
3. Какой глобальный optimization baseline оправдан: `-O3` глобально или
   `-O2` глобально с package-specific `-O3`. — **Experiment B: IN PROGRESS**
   (B1 COMPLETE).
4. Есть ли практический смысл после этого переходить с GNU runtime-компонентов
   на `compiler-rt + libunwind`, не смешивая этот шаг с заменой C++ stdlib. —
   Experiment C: NOT STARTED.

Переход с `libstdc++` на `libc++` не входит в первые фазы эксперимента,
поскольку это отдельное ABI-решение с более высоким риском.

## Подтверждённый baseline перед экспериментом

На момент подготовки эксперимента живой вывод системы показал:

```text
Compiler:          Clang 22.1.8
Portage linker:    LLD через -fuse-ld=lld в LDFLAGS
Bare Clang linker: GNU ld.bfd
C++ stdlib:        GCC 15 libstdc++
Compiler runtime:  libgcc
Unwinder:          libgcc / libgcc_s
```

Clang 23.1.1 и LLD 23.1.1 уже установлены параллельно.

Конфигурация `/etc/clang/23/` перед началом эксперимента:

```text
-fuse-ld=bfd
--rtlib=libgcc
--stdlib=libstdc++
--unwindlib=libgcc
```

Это означает, что в первой фазе можно менять только compiler/linker:

```text
Clang 22 -> Clang 23
LLD   22 -> LLD   23
```

и оставить без изменений:

```text
libstdc++
libgcc
libgcc_s
```

## Текущие исключения Portage

Аудит `package.env` показал 111 записей, связанных с
`gcc-fallback`, `problem-llvm`, `llvm-22` или `no-lto-llvm`.

Это число нельзя трактовать как 111 пакетов, несовместимых с LLVM.

Явный `gcc-fallback` на момент проверки применён к девяти пакетам:

```text
app-shells/bash
sys-devel/binutils
app-containers/lxc
app-editors/nano
dev-cpp/highway
dev-java/openjdk
net-analyzer/nmap
x11-libs/pango
media-libs/libjxl
```

Большинство остальных правил означает только отключение ThinLTO или другое
точечное исключение.

## LLVM_COMPAT

VDB показал небольшой набор установленных пакетов с переменной
`LLVM_COMPAT`. Это не следует интерпретировать как список пакетов, которые
можно или нельзя компилировать конкретной версией Clang: часто
`LLVM_COMPAT` описывает совместимость с LLVM как библиотекой или tool
dependency.

Поэтому в эксперименте различаются две независимые оси:

- версия Clang/LLD, которой компилируется C/C++ код пакета;
- слот LLVM, с которым пакет линкуется или от которого зависит как от
  библиотеки/toolchain component.

## Статус экспериментов

**Experiment A — LLVM 22 → 23 (compatibility): COMPLETE.**

| Gate | Пакет | Класс | LTO | LLVM dependency | Результат |
|------|-------|-------|-----|-----------------|-----------|
| A1 | libde265-1.1.3 | C++ codec | ThinLTO | n/a | PASS |
| A2 | libunistring-1.4.2 | C library | disabled | n/a | PASS |
| A3 | mesa_clc-26.2.2 | C/C++ LLVM-dependent | ThinLTO | LLVM 22 | PASS |
| A4 | mesa-26.2.2 (`--buildpkgonly`) | large graphics stack | disabled | LLVM 22 | PASS |

A — результат совместимости, а не сравнение производительности: он не
доказывает совместимость всего `@world` и не отменяет package-specific
исключения.

**Experiment B — -O2 vs -O3: IN PROGRESS** (B1, B2 COMPLETE; B3 — planned
class crypto, NOT STARTED; B4 NOT STARTED). B1 (libde265, single-thread HEVC
decode): O3 runtime ~1.2% быстрее, instructions ~1.8% меньше, `.text` ~12.3%
больше. B2 (zstd 1.5.7-r1): `libzstd` `.text` ~9.2% больше; compression
~1–2% быстрее, decompression ~1–2% медленнее — смешанный результат. Подробности —
в [o2-o3-benchmarks.md](o2-o3-benchmarks.md).

## Дорожная карта

```text
Experiment A — LLVM 23 compatibility — COMPLETE
          ↓
Experiment B — -O2 vs -O3 — IN PROGRESS
  B1 libde265 — COMPLETE
  B2 zstd — COMPLETE
  B3 crypto — NEXT
          ↓
выбор optimization baseline
          ↓
только после этого: limited env/llvm-23 pilot
```

Постоянный `env/llvm-23` явно блокируется Experiment B: не нужно внедрять
новый постоянный compiler policy и затем вскоре менять глобальный optimization
baseline. Сначала определяется optimization policy, потом начинается
controlled LLVM 23 rollout.

Дальше, каждое — отдельным решением владельца:

- выбор пакета B3 (planned class — crypto) и проведение измерений; B4 —
  опционально крупный desktop/graphics workload;
- решение по optimization baseline;
- ограниченный `env/llvm-23` pilot; глобальный переход — только после
  resolver-аудита;
- world rebuild по контролируемой схеме: pretend/resolver-проверка, оценка
  исключений, пересборка; существующие GCC fallback сохранять до отдельной
  проверки каждого;
- Experiment C (`compiler-rt + libunwind`) после A и B, с собственным
  baseline и rollback; `libc++` не включать;
- Firefox не использовать как ранний пилот.

## Что измерять

Для сравнения конфигураций фиксируются:

- wall-clock время сборки;
- peak memory, если удобно;
- размер итоговых ELF и binpkg;
- время линковки крупных ThinLTO-пакетов, где отделимо;
- ошибки/предупреждения сборки;
- необходимость новых `package.env` исключений;
- runtime benchmark только там, где есть воспроизводимый workload.

Не объявлять LLVM 23 быстрее только по времени компиляции одного пакета.

## Правила безопасности эксперимента

- Не удалять LLVM 22 до завершения миграции.
- Не менять одновременно compiler, C++ stdlib и runtime.
- Не снимать существующие GCC fallback массово.
- Не включать `default-libcxx` в рамках первых фаз.
- Не обходить `LLVM_COMPAT` ebuild без отдельного обоснования.
- Не считать успешную компиляцию достаточной проверкой: нужен хотя бы запуск
  пакета или его штатных smoke checks, если они доступны и безопасны.
- После каждого гейта документировать результат до перехода к следующему.

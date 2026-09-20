---
kind: reference
scope: system
status: current
last_verified: null
verified_on: [asus-b5402]
---

# Бенчмарки -O2 vs -O3 (Experiment B)

Методология и результаты измерений Experiment B. Гипотеза, дизайн A/B и
критерий решения — в [optimization-o2-o3.md](optimization-o2-o3.md); журнал —
в [results.md](results.md). Статусы: B1 COMPLETE, B2/B3/B4 NOT STARTED.

B1 — это benchmark result, а не validation gate. «PASS» здесь не
используется: ни один optimization level не является «успехом теста».

## 1. Принцип измерений

В каждом A/B меняется ровно optimization level. Неизменны: compiler
(Clang 23), linker (LLD 23), `-march=alderlake`, ThinLTO,
libstdc++/libgcc/libgcc_s, версия пакета и workload.

## 2. Методология сборки

- Обе версии собираются через `--buildpkgonly` в отдельные PKGDIR — живая
  система не затрагивается.
- Toolchain вызывается только absolute paths слота 23
  (`/usr/lib/llvm/23/bin/...`).
- Постоянный `env/llvm-23` не создаётся: rollout отложен до решения по
  optimization baseline.

## 3. Методология runtime-измерений (B1)

Фиксированный HEVC benchmark:

```text
/tmp/libde265-bench.hevc
~21 MB, 1920x1080, 60 fps source, 30 секунд
```

Запуск:

```text
dec265 -q -t 1
```

- декодирование без вывода на экран;
- ровно один поток декодера.

CPU affinity:

```text
CPU 2 — P-core (core 1), max frequency 4.7 GHz; SMT-sibling — CPU 3
```

Процесс закреплён за CPU 2 через `taskset`. Счётчики — `perf stat`: task-clock,
cycles, instructions, branches, branch-misses, cache-references, cache-misses.

Порядок measured runs (перед ними обе версии прошли warm-up):

```text
1 O2, 2 O3, 3 O3, 4 O2, 5 O3, 6 O2, 7 O2, 8 O3
```

Итого 4 сэмпла на каждый уровень.

На гибридном Intel PMU строки вида `cpu_atom/... <not counted>` ожидаемы:
процесс закреплён за P-core. Валидные counters — `cpu_core/*` со 100%
measured time.

## 4. B1 — libde265-1.1.3

Почему выбран: compute-heavy codec; C++; подходит для real runtime benchmark;
поддерживает фиксированный HEVC bitstream; позволяет single-thread benchmark;
достаточно мал для повторяемых сборок.

### 4.1 Build cost (первичные timing'и)

| Метрика | O2 | O3 | O3 vs O2 |
|---------|-----|-----|----------|
| User time | 67.89 s | 69.84 s | +2.87% |
| System time | 10.63 s | 11.26 s | +5.93% |
| Wall time | 27.42 s | 28.32 s | +3.28% |
| Max RSS | 182716 KiB | 184740 KiB | +1.11% |

> ⚠️ **Важный нюанс**: эти build-time цифры вспомогательные и не являются
> устойчивым benchmark: выполнено по одному build-run каждого варианта при
> различавшемся состоянии filesystem cache (`File system inputs`: O2 = 9720,
> O3 = 0). Вывод «O2 компилируется на 3.28% быстрее» делать нельзя. Для
> серьёзного build-time вывода нужны повторные controlled builds.

### 4.2 Code size

Это прямой и воспроизводимый результат двух готовых ELF.

`libde265.so`:

| | text | data | bss | file size |
|--|------|------|------|-----------|
| O2 | 576615 | 3328 | 18275 | 582808 |
| O3 | 647595 | 3328 | 21011 | 653800 |
| O3 vs O2 | +12.31% | = | — | +12.18% |

`dec265`:

| | text | data | bss | file size |
|--|------|------|------|-----------|
| O2 | 16632 | 1816 | 2048 | 21504 |
| O3 | 18492 | 1816 | 192 | 23360 |
| O3 vs O2 | +11.18% | = | — | +8.63% |

binpkg:

```text
O2 = 337920 байт, O3 = 368640 байт → +9.09%
```

Главное size-наблюдение: на этом workload `-O3` увеличил `.text` основной
библиотеки примерно на 12.3%. Это не «проблема» сама по себе — code growth
оценивается вместе с runtime performance.

### 4.3 Raw runtime samples

O2 (runs 1, 4, 6, 7):

| Counter | Run 1 | Run 4 | Run 6 | Run 7 |
|---------|-------|-------|-------|-------|
| task-clock, ms | 21731.69 | 22003.41 | 21839.04 | 21814.05 |
| cycles | 46690276038 | 47255483294 | 46910346329 | 46946088203 |
| instructions | 141635129334 | 141635236109 | 141635425518 | 141635431312 |
| branches | 19642874220 | 19642888401 | 19642915757 | 19642910961 |
| branch-misses | 239842775 | 240134715 | 239459934 | 241801223 |
| cache-references | 942489409 | 950215150 | 943852950 | 948821984 |
| cache-misses | 687022658 | 693481193 | 691350274 | 692593020 |

O3 (runs 2, 3, 5, 8):

| Counter | Run 2 | Run 3 | Run 5 | Run 8 |
|---------|-------|-------|-------|-------|
| task-clock, ms | 21588.60 | 21463.31 | 21698.80 | 21596.33 |
| cycles | 46461951992 | 46110277119 | 46614916994 | 46438829343 |
| instructions | 139073672292 | 139073298961 | 139072953284 | 139073137924 |
| branches | 20039257780 | 20039212216 | 20039168892 | 20039191967 |
| branch-misses | 236171520 | 236463037 | 237613644 | 237622513 |
| cache-references | 934415295 | 939829363 | 949502531 | 944262287 |
| cache-misses | 684544511 | 686057321 | 693593821 | 690624986 |

### 4.4 Derived (средние по 4 прогонам)

| Метрика | O2 | O3 | O3 vs O2 |
|---------|-----|-----|----------|
| task-clock | 21.847 s | 21.587 s | -1.19% |
| cycles | 46.95 B | 46.41 B | -1.16% |
| instructions | 141.64 B | 139.07 B | -1.81% |
| IPC | ~3.017 | ~2.997 | -0.66% |
| branches | 19.64 B | 20.04 B | +2.02% |
| branch miss rate | ~1.223% | ~1.183% | чуть лучше |
| cache references | ~946.3 M | ~942.0 M | -0.46% |
| cache miss rate | ~73.03% | ~73.11% | практически без изменений |

Вариация сэмплов (task-clock): O2 CV ≈ 0.52%, O3 CV ≈ 0.45%.

Средняя effective frequency (cycles / task-clock): O2 ≈ 2.149 GHz,
O3 ≈ 2.150 GHz — практически одинаковая, поэтому измеренная разница не
выглядит следствием систематически разной средней частоты.

### 4.5 Интерпретация

Ключевой фактический результат:

```text
O3 runtime improvement ≈ 1.2%
O3 instructions        ≈ -1.8%
O3 libde265 .text      ≈ +12.3%
```

> Для этого конкретного single-thread libde265 HEVC decode workload `-O3` дал
> небольшой, но воспроизводимый runtime-выигрыш примерно 1.2%, одновременно
> увеличив `.text` основной библиотеки примерно на 12.3%.

Наблюдения:

- O3 выполняет меньше instructions и тратит немного меньше cycles;
- IPC у O3 немного ниже; branch count выше, но branch miss rate чуть лучше;
- cache miss rate практически не отличается;
- средняя effective CPU frequency одинаковая.

> ⚠️ **Важный нюанс**: не считать, что рост `.text` доказанно ухудшил
> instruction cache — текущие perf counters этого не доказали.

### 4.6 Значение для optimization policy

B1 усиливает гипотезу `global -O2 + selective -O3`: на compute-heavy codec O3
покупает небольшой runtime-выигрыш ценой заметно большего machine code
footprint. Но одного codec workload недостаточно, чтобы менять глобальную
optimization policy всей системы.

Изменений в `make.conf`, `package.env` и production-политике не сделано;
package-specific `-O3` rule для libde265 не создан — это пока только
experimental result. Выбор пакетов B2–B4 — за владельцем (критерии — в
[optimization-o2-o3.md](optimization-o2-o3.md)).

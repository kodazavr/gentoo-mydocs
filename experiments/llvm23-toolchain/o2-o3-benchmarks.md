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
в [results.md](results.md). Статусы: B1, B2 COMPLETE; B3 (planned
class — crypto) и B4 NOT STARTED.

B1 и B2 — это benchmark results, а не validation gates. «PASS» здесь не
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
experimental result. Выбор пакетов следующих гейтов — за владельцем
(критерии — в [optimization-o2-o3.md](optimization-o2-o3.md)).

## 5. B2 — app-arch/zstd-1.5.7-r1

Класс workload: compression/decompression, C, real-world compression library
и CLI.

Почему выбран: принципиально другой workload по сравнению с codec B1; есть
реальные compression и decompression пути; используется один и тот же corpus;
runtime легко измерять single-thread; пакет небольшой и дешёвый для повторных
сборок.

Обе сборки: Clang 23 + LLD 23 + `-march=alderlake` + ThinLTO + одинаковый
runtime stack, версия пакета и USE/dependencies. Единственная намеренная
разница — `-O2` ↔ `-O3`. Сборки через `--buildpkgonly` в разные PKGDIR:
`/tmp/zstd-o2-pkgs` и `/tmp/zstd-o3-pkgs`.

### 5.1 Build cost (auxiliary observation)

| Метрика | O2 | O3 | O3 vs O2 |
|---------|-----|-----|----------|
| User time | 91.75 s | 95.73 s | +4.34% |
| System time | 14.25 s | 14.58 s | +2.32% |
| Wall time | 38.08 s | 36.69 s | -3.65% |
| Max RSS | 204724 KiB | 216836 KiB | +5.92% |

> ⚠️ **Важный нюанс**: эти build-time результаты — не устойчивый benchmark:
> `File system inputs` различался (O2 = 15560, O3 = 0), CPU utilization тоже
> (O2 ≈ 278%, O3 ≈ 300%). Писать «O3 собирается быстрее» или «O2 собирается
> быстрее» как устойчивый вывод нельзя — только auxiliary observation.

### 5.2 Code size

`zstd` CLI:

| | text | data | bss | file size |
|--|------|------|------|-----------|
| O2 | 197973 | 4800 | 4032 | 205808 |
| O3 | 203330 | 4800 | 6864 | 211168 |
| O3 vs O2 | +2.71% | = | — | +2.60% |

`libzstd.so.1.5.7`:

| | text | data | bss | file size |
|--|------|------|------|-----------|
| O2 | 832540 | 2424 | 4000 | 837784 |
| O3 | 909186 | 2408 | 1088 | 914424 |
| O3 vs O2 | +9.21% | ≈ | — | +9.15% |

Главный size-результат B2: основная `libzstd.so` при `-O3` выросла примерно
на 9.2% по `.text`.

### 5.3 Corpus и изоляция

Реальный corpus из исходников текущего Linux kernel tree:

```text
/usr/src/linux → включены include, kernel, mm, fs
/tmp/zstd-bench-kernel.tar      ~53 MB (tar)
/tmp/zstd-bench-kernel.tar.zst  ~11 MB (compressed reference, zstd -3 -T1)
```

Обе экспериментальные версии запускались со своими библиотеками через
`LD_LIBRARY_PATH`; подтверждено: O2-исполняемый файл использует O2-`libzstd`,
O3 — O3-`libzstd`. Случайное использование установленной системной
`libzstd` исключено. sha256 результатов в записи не фиксировался — значение
не подставляется.

### 5.4 Методология runtime

Как и в B1: CPU 2 (P-core), `taskset -c 2`, `perf stat`, warm-up обеих
версий, порядок measured runs `1 O2, 2 O3, 3 O3, 4 O2, 5 O3, 6 O2, 7 O2,
8 O3` — 4 сэмпла на уровень. Счётчики `cpu_core/*` (task-clock, cycles,
instructions, branches, branch-misses, cache-references, cache-misses).

Повторы внутри одного measured run:

```text
compression:   zstd -3 -T1, 50 повторов
decompression: zstd -d,      150 повторов
```

Compression и decompression измерялись отдельно.

### 5.5 Raw compression samples

O2 (runs 1, 4, 6, 7):

| Counter | Run 1 | Run 4 | Run 6 | Run 7 |
|---------|-------|-------|-------|-------|
| task-clock, ms | 18286.78 | 18497.96 | 18374.85 | 18439.38 |
| cycles | 35530101132 | 35956814961 | 35790875150 | 35897949117 |
| instructions | 71524689048 | 71799279991 | 71711122335 | 71583323202 |
| branches | 7409139778 | 7474375647 | 7453762900 | 7422987741 |
| branch-misses | 279061831 | 279023257 | 279036896 | 279302147 |
| cache-references | 1219579285 | 1171009639 | 1194789038 | 1265494373 |
| cache-misses | 172547809 | 185006451 | 182128247 | 170231124 |

O3 (runs 2, 3, 5, 8):

| Counter | Run 2 | Run 3 | Run 5 | Run 8 |
|---------|-------|-------|-------|-------|
| task-clock, ms | 18077.36 | 17227.58 | 19000.05 | 18116.24 |
| cycles | 35274746771 | 34422881748 | 36839070554 | 35149848483 |
| instructions | 70085531557 | 69838802299 | 69806564589 | 69172273018 |
| branches | 7241342218 | 7181959381 | 7174395814 | 7022218791 |
| branch-misses | 278028365 | 277749107 | 278357603 | 278082232 |
| cache-references | 1241326989 | 1206209761 | 1193935364 | 1242888787 |
| cache-misses | 163883144 | 173585391 | 207527397 | 168301335 |

### 5.6 Derived compression (средние по 4 прогонам)

| Метрика | O2 | O3 | O3 vs O2 |
|---------|-----|-----|----------|
| task-clock | ~18.400 s | ~18.105 s | ~-1.60% |
| median task-clock | ~18.407 s | ~18.097 s | ~-1.69% |
| cycles | ~35.79 B | ~35.42 B | ~-1.04% |
| instructions | ~71.65 B | ~69.73 B | ~-2.69% |
| IPC | ~2.002 | ~1.968 | ~-1.67% |
| branches | ~7.440 B | ~7.155 B | ~-3.83% |
| branch miss rate | ~3.75% | ~3.89% | немного хуже |
| cache miss rate | ~14.63% | ~14.60% | практически без изменений |

Вариация сэмплов (task-clock): O2 CV ≈ 0.49%, O3 CV ≈ 4.00%.

> Compression с `-O3` примерно на 1–2% быстрее на этом workload, но вариация
> O3-сэмплов заметно выше, чем O2 (в основном за счёт run 5), поэтому точную
> величину выигрыша не следует завышать.

Наблюдения: O3 выполняет меньше instructions и тратит меньше cycles; IPC чуть
ниже; branch count ниже; branch miss rate немного хуже; cache miss rate
фактически без изменений.

### 5.7 Raw decompression samples

O2 (runs 1, 4, 6, 7):

| Counter | Run 1 | Run 4 | Run 6 | Run 7 |
|---------|-------|-------|-------|-------|
| task-clock, ms | 13789.92 | 13712.38 | 14209.12 | 13798.00 |
| cycles | 26384291959 | 26267484060 | 27120061864 | 26308901048 |
| instructions | 94824041918 | 94824066908 | 94824061984 | 94824022872 |
| branches | 10298262278 | 10298257328 | 10298266523 | 10298261676 |
| branch-misses | 223569056 | 222822396 | 223932994 | 223363940 |
| cache-references | 311863508 | 300013735 | 307793287 | 314804547 |
| cache-misses | 53753848 | 52540086 | 71666073 | 48958518 |

O3 (runs 2, 3, 5, 8):

| Counter | Run 2 | Run 3 | Run 5 | Run 8 |
|---------|-------|-------|-------|-------|
| task-clock, ms | 13774.02 | 14057.35 | 14809.65 | 13895.89 |
| cycles | 26449476930 | 26881085468 | 28257910205 | 26537616338 |
| instructions | 94756939397 | 94756946738 | 94756932413 | 94756893507 |
| branches | 10262609884 | 10262605340 | 10262609410 | 10262605615 |
| branch-misses | 234970867 | 234680362 | 234907628 | 234483988 |
| cache-references | 316081454 | 310299468 | 318353459 | 317565939 |
| cache-misses | 48256530 | 60574041 | 90462898 | 50120655 |

### 5.8 Derived decompression (средние по 4 прогонам)

| Метрика | O2 | O3 | O3 vs O2 |
|---------|-----|-----|----------|
| task-clock | ~13.877 s | ~14.134 s | ~+1.85% |
| median task-clock | ~13.794 s | ~13.977 s | ~+1.32% |
| cycles | ~26.52 B | ~27.03 B | ~+1.93% |
| instructions | ~94.824 B | ~94.757 B | ~-0.07% |
| IPC | ~3.576 | ~3.505 | ~-1.96% |
| branches | ~10.298 B | ~10.263 B | ~-0.35% |
| branch miss rate | ~2.17% | ~2.29% | хуже |
| cache metrics | noisy | noisy | без уверенного вывода |

> Decompression с `-O3` примерно на 1–2% медленнее, при почти неизменном
> количестве instructions.

Главная observation: O3 не уменьшил instruction count на decompression
сколько-нибудь значимо, но потребовал больше cycles; IPC ниже, branch miss
rate хуже, измеренный runtime медленнее. По cache-счётчикам decompression
заметный шум — глубокий вывод по ним не делается.

### 5.9 Frequency sanity check

Средняя effective frequency (cycles / task-clock):

```text
Compression:   O2 ≈ 1.945 GHz, O3 ≈ 1.956 GHz
Decompression: O2 ≈ 1.911 GHz, O3 ≈ 1.912 GHz
```

> Различия runtime не объясняются систематической разницей средней частоты
> O2/O3.

### 5.10 Центральный результат B2

```text
libzstd .text:  O3 ≈ +9.2%
compression:    O3 ≈ 1–2% быстрее
decompression:  O3 ≈ 1–2% медленнее
```

> `-O3` существенно увеличил code footprint основной библиотеки, дав при
> этом смешанные runtime-результаты: небольшое улучшение compression и
> небольшую деградацию decompression.

Это более важный результат, чем любой отдельный perf counter.

### 5.11 Интерпретация

B2 показал принципиальную вещь:

> Даже внутри одного пакета `-O3` может улучшить один hot path и ухудшить
> другой.

Отсюда: даже package-specific `-O3` нельзя автоматически считать идеальной
policy только потому, что пакет «performance-sensitive». Неверно и обратное —
«O3 всегда плох» или «O2 всегда лучше». Правильный вывод:

> Optimization level должен оцениваться по реальному workload mix и
> измеренному trade-off, а не по предположению, что более высокий optimization
> level автоматически лучше.

> ⚠️ **Важный нюанс**: больший `.text` создаёт потенциальный
> instruction-cache trade-off, но этот benchmark напрямую эффекты
> instruction cache не изолировал — причинный вывод «O3 медленнее из-за
> большего i-cache footprint» не доказан.

## 6. Сводный вид B1 + B2

| Gate | Workload | O3 runtime | Цена по code size у O3 | Итог |
|------|----------|-----------|------------------------|------|
| B1 | libde265 HEVC decode | ~1.2% быстрее | ~+12.3% `.text` | небольшой выигрыш / большой рост |
| B2-C | zstd compression | ~1–2% быстрее | ~+9.2% `.text` lib | небольшой выигрыш / заметный рост |
| B2-D | zstd decompression | ~1–2% медленнее | те же ~+9.2% `.text` lib | регрессия |

Тенденция после двух workload-классов:

> O3 последовательно заметно увеличивает code footprint, а runtime-выигрыш
> пока мал и не универсален.

Это observational trend, а не финальный system-wide conclusion.

Изменений в production-политике не сделано: глобальный `-O3` остаётся,
`make.conf`/`package.env` не тронуты, `env/llvm-23` не создан.

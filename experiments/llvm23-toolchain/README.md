---
kind: reference
scope: system
status: draft
last_verified: null
verified_on: [asus-b5402]
---

# Эксперимент: LLVM 23 toolchain

Этот каталог хранит исследовательский план перехода основной сборочной цепочки
ASUS ExpertBook B5402 с LLVM 22 на LLVM 23.

Материал здесь не является подтверждённым состоянием системы и не заменяет
`systems/asus-b5402/`. После завершения отдельных гейтов подтверждённые
результаты должны быть перенесены в системную документацию или общие guides.

## Цели

Эксперимент должен отдельно ответить на три вопроса:

1. Насколько безопасно перевести основной compiler/linker stack с
   Clang/LLD 22 на Clang/LLD 23.
2. Даёт ли LLVM 23 практический выигрыш по времени сборки, размеру бинарников
   или производительности на Alder Lake при текущей политике `-O3` +
   ThinLTO.
3. Есть ли практический смысл после этого переходить с GNU runtime-компонентов
   на `compiler-rt + libunwind`, не смешивая этот шаг с заменой C++ stdlib.

Переход с `libstdc++` на `libc++` не входит в первую фазу эксперимента,
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
LLD   22 -> LLD 23
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

Поэтому в эксперименте необходимо различать две независимые оси:

- версия Clang/LLD, которой компилируется C/C++ код пакета;
- слот LLVM, с которым пакет линкуется или от которого зависит как от
  библиотеки/toolchain component.

## Гейты

### Gate 0 — baseline

Перед изменениями зафиксировать:

```bash
portageq envvar CC
portageq envvar CXX
portageq envvar CFLAGS
portageq envvar CXXFLAGS
portageq envvar LDFLAGS

clang --version
/usr/lib/llvm/23/bin/clang --version
/usr/lib/llvm/23/bin/ld.lld --version
```

Не менять глобальную конфигурацию до успешного завершения первого пилота.

### Gate 1 — один небольшой пакет

Первый кандидат: `media-libs/libde265`.

Цель: собрать один пакет Clang 23 + LLD 23, сохранив текущие
`libstdc++ + libgcc + libgcc_s`.

После сборки проверить VDB и фактический linker/compiler provenance.

### Gate 2 — несколько классов пакетов

После успешного Gate 1 выбрать несколько пакетов разного типа:

- небольшая C library;
- C++ library;
- пакет с ThinLTO;
- пакет без ThinLTO;
- один более крупный desktop/system package.

Не использовать Firefox как ранний пилот.

### Gate 3 — постоянный env для LLVM 23

Только после успешных пилотов создать отдельный Portage env для Clang/LLD 23.

Сначала применить его к ограниченному набору пакетов. Глобальный переход делать
только после resolver-аудита.

### Gate 4 — world rebuild

Если предыдущие гейты проходят:

- сделать pretend/resolver-проверку;
- оценить список исключений;
- пересобрать `@world` по контролируемой схеме;
- сохранить существующие GCC fallback, пока каждый из них не проверен отдельно.

### Gate 5 — runtime experiment

Только после стабилизации Clang/LLD 23 отдельно исследовать:

```text
libgcc       -> compiler-rt
libgcc_s     -> libunwind
```

Этот эксперимент должен иметь собственный baseline и rollback.

`libc++` не включать в этот gate.

## Что измерять

Для сравнения LLVM 22 и LLVM 23 желательно фиксировать:

- wall-clock время сборки;
- peak memory, если удобно;
- размер итоговых ELF;
- время линковки крупных ThinLTO-пакетов;
- ошибки/предупреждения сборки;
- необходимость новых `package.env` исключений;
- runtime benchmark только там, где есть воспроизводимый workload.

Не объявлять LLVM 23 быстрее только по времени компиляции одного пакета.

## Правила безопасности эксперимента

- Не удалять LLVM 22 до завершения миграции.
- Не менять одновременно compiler, C++ stdlib и runtime.
- Не снимать существующие GCC fallback массово.
- Не включать `default-libcxx` в рамках первой фазы.
- Не обходить `LLVM_COMPAT` ebuild без отдельного обоснования.
- Не считать успешную компиляцию достаточной проверкой: нужен хотя бы запуск
  пакета или его штатных smoke checks, если они доступны и безопасны.
- После каждого гейта документировать результат до перехода к следующему.

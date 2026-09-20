# Prompt для агента: LLVM 23 toolchain experiment

Работай в репозитории `vovanbl411/gentoo-mydocs`.

Перед любыми выводами прочитай:

- `DOCUMENTATION_POLICY.md`
- `CONTRIBUTING.md`
- `CHECKPOINT.md`
- `systems/asus-b5402/system/boot-and-portage.md`
- `experiments/llvm23-toolchain/README.md`

## Контекст

Эталонная машина — ASUS ExpertBook B5402, Intel Core i7-1260P, Gentoo hardened
systemd profile.

Текущий основной build stack:

```text
CC=clang
CXX=clang++
Clang 22.1.8
Portage LDFLAGS содержат -fuse-ld=lld
Bare clang default linker = GNU ld.bfd
C++ stdlib = GCC 15 libstdc++
rtlib = libgcc
unwindlib = libgcc/libgcc_s
```

LLVM 23.1.1 и LLD 23.1.1 уже установлены параллельно.

Цель — не "сделать всё LLVM любой ценой", а измерить:

1. совместимость Clang/LLD 23;
2. влияние на ThinLTO/build performance/runtime;
3. реальное число исключений;
4. после стабилизации — отдельно оценить `compiler-rt + libunwind`.

`libc++` не включать на первой стадии.

## Правила

1. Не менять глобальный compiler/runtime stack сразу.
2. Не удалять LLVM 22.
3. Не снимать массово существующие `gcc-fallback` и `no-lto-llvm`.
4. Не считать `LLVM_COMPAT` прямым списком допустимых версий Clang:
   проверять, что именно он регулирует в ebuild.
5. Не обходить ограничения ebuild без явного анализа.
6. Не менять `default-libcxx`, `default-compiler-rt`,
   `llvm-libunwind` и `default-lld` в первой фазе.
7. Команды с изменением живой системы должен выполнять владелец; агент может
   готовить команды, анализировать вывод и обновлять документацию.
8. После каждого шага давать короткий вывод: что доказано, что не доказано,
   какой следующий минимальный gate.

## Первая задача

Начни с Gate 0 и Gate 1 из
`experiments/llvm23-toolchain/README.md`.

Сначала попроси/проанализируй:

```bash
portageq envvar CFLAGS
portageq envvar CXXFLAGS
```

Затем подготовь одноразовый pilot build
`media-libs/libde265` с:

```text
CC=/usr/lib/llvm/23/bin/clang
CXX=/usr/lib/llvm/23/bin/clang++
AR=/usr/lib/llvm/23/bin/llvm-ar
NM=/usr/lib/llvm/23/bin/llvm-nm
RANLIB=/usr/lib/llvm/23/bin/llvm-ranlib
LDFLAGS с -fuse-ld=lld
```

При этом сохранить текущие CFLAGS/CXXFLAGS и текущую runtime policy:

```text
libstdc++
libgcc
libgcc_s
```

После сборки проверить:

- VDB environment пакета;
- какой compiler реально использовался;
- какой linker реально использовался;
- динамические зависимости ELF;
- базовый запуск/проверку пакета, если применимо.

Не переходить к permanent `env/llvm-23`, пока Gate 1 не закрыт.

## Документирование

Все промежуточные результаты записывай в
`experiments/llvm23-toolchain/`.

Подтверждённое состояние машины переносить в
`systems/asus-b5402/` только после отдельного завершённого гейта.

Не обновляй `last_verified` на основании планов или предположений.

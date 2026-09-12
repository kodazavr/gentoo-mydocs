---
kind: system
scope: system
status: current
last_verified: 2026-09-11
verified_on: [asus-b5402]
---

# Аудит make.conf ASUS ExpertBook B5402 — 2026-09-11

Этот аудит фиксирует фактическое состояние `/etc/portage/make.conf` после
проверки Portage, toolchain и ccache. Он не применяет изменения, не запускает
пересборку пакетов и не заменяет отдельный разбор глобальных оптимизаций или
USE-флагов.

## Границы проверки

Подтверждение получено из эффективного окружения Portage, вывода локальных
компиляторов и инструментов кэширования, а также из синтаксической проверки
GNU Fortran. Конфигурация и ключевой материал Secure Boot не публикуются:
проверялось только наличие штатных переменных `SECUREBOOT_SIGN_KEY` и
`SECUREBOOT_SIGN_CERT`, без чтения их содержимого.

| Область | Подтверждённый факт |
|---|---|
| Основной C/C++ toolchain | Portage использует `clang`/`clang++`, `llvm-ar`, `llvm-nm` и `llvm-ranlib` из LLVM 22.1.8. Системный `ar` остаётся GNU binutils, но в окружении Portage он не выбран. |
| Архитектура | `-march=alderlake` поддерживается Clang, Rust и GNU Fortran на этой машине. Набор `CPU_FLAGS_X86` в `make.conf` совпадает с выводом `cpuid2cpuflags`. |
| C и C++ | `COMMON_FLAGS` с `-O3`, ThinLTO и заданными `-mno-*` флагами принимаются Clang. Возможность принять флаг не является оценкой выгодности глобальной оптимизации. |
| Rust | `rustc 1.97.1` знает `target-cpu=alderlake`; Rust направляется на Clang/LLD 22. |
| Go | `GOAMD64=v3` соответствует возможностям процессора. Значения `GOFLAGS` и `CGO_*` в обычной пользовательской оболочке не являются проверкой окружения Portage: ebuild передаёт их отдельно. |
| Параллелизм | `MAKEOPTS="-j14 -l10"` задан для 16 логических CPU. На момент проверки были доступны память и место для кэша; нагрузочное испытание сборкой не проводилось. |
| Подпись загрузочных артефактов | Переменные `SECUREBOOT_SIGN_KEY` и `SECUREBOOT_SIGN_CERT` имеют штатных потребителей в eclass Gentoo. Они не признаны лишними и остаются в конфигурации. |

## Исправленные параметры

В ходе проверки найдены три дефекта конфигурации. Они уже исправлены в живом
`make.conf` и подтверждены повторной проверкой эффективных значений.

| Прежнее состояние | Причина | Исправленное состояние и доказательство |
|---|---|---|
| `FCFLAGS` и `FFLAGS` наследовали `COMMON_FLAGS` с `-flto=thin`. | GNU Fortran не принимает значение `thin` у `-flto=`. | Создан отдельный `FORTRAN_FLAGS` без `-flto=thin`; `gfortran` принял итоговый набор в синтаксической проверке. `portageq envvar` вернул новые `FCFLAGS` и `FFLAGS`. |
| Указан `CCACHE_COMPRESS_LEVEL`. | ccache 4.13.5 игнорирует это имя переменной; уровень сжатия оставался значением по умолчанию. | Используется `CCACHE_COMPRESSLEVEL="3"`. В окружении ccache отображает `compression_level = 3`. |
| В `CCACHE_SLOPPINESS` был `file_macro`. | ccache 4.13.5 не включает этот элемент в эффективный список. | Неэффективный элемент удалён; итоговый список содержит только четыре распознанных значения. |

Фрагмент текущего решения для GNU Fortran:

```makefile
FORTRAN_FLAGS="-march=alderlake -O3 -pipe -mno-kl -mno-pconfig -mno-sgx -mno-widekl -mshstk"
FCFLAGS="${FORTRAN_FLAGS}"
FFLAGS="${FORTRAN_FLAGS}"
```

Фрагмент текущей настройки ccache:

```makefile
CCACHE_COMPRESSLEVEL="3"
CCACHE_SLOPPINESS="include_file_mtime,include_file_ctime,time_macros,pch_defines"
```

`CCACHE_COMPRESS` удалён как избыточный: сжатие включено по умолчанию в
проверенной версии ccache. Параметры `include_file_mtime`,
`include_file_ctime` и `time_macros` ослабляют обычную проверку свежести
входных файлов и временных меток. Они уместны только как осознанный компромисс
для повторных сборок; аудит не измерял попадания в кэш и не менял этот выбор.

## Решения, отложенные отдельно

Следующие параметры корректны в техническом смысле, но требуют решения о
политике системы, а не механической правки.

| Тема | Текущее состояние | Что нужно для решения |
|---|---|---|
| Глобальные `-O3` и ThinLTO для C/C++ | Флаги поддерживаются выбранным Clang. | Оценить влияние на проблемные пакеты, время сборки и потребление памяти; при необходимости применять исключения точечно. |
| `-mno-kl`, `-mno-pconfig`, `-mno-sgx`, `-mno-widekl`, `-mshstk` | Флаги принимаются компиляторами, а связанные возможности не заявлены процессором там, где они отключены. | Сравнить с актуальными compiler defaults и решить, нужна ли читаемая явная политика или более короткий набор флагов. |
| Глобальный `GOFLAGS="-buildmode=pie"` | Параметр допустим для установленного Go. | Проверить влияние на Go ebuild и пакеты, прежде чем менять системную политику. |
| `CCACHE_SLOPPINESS` | Четыре значения распознаны ccache. | Сначала получить статистику реальных сборок и подтвердить необходимость менее строгого ключа кэша. |
| Глобальные USE, `VIDEO_CARDS` и `INPUT_DEVICES` | Не были предметом этой проверки. | Разбирать по потребителям Portage и фактически используемому оборудованию. |

## Ограничения и повторная проверка

Проверка подтверждает синтаксис, эффективные переменные Portage и поддержку
целевых CPU/компиляторных параметров. Она не доказывает, что каждая будущая
сборка с глобальными `-O3`, ThinLTO или `GOFLAGS` будет успешна, и не измеряет
скорость, размер бинарников либо эффективность ccache. Перед изменением
отложенных параметров нужен отдельный план с resolver-проверкой и, если
параметр затрагивает сборки, ограниченной верификацией пакетов.

## Источники

- [Gentoo devmanual: make.conf](https://devmanual.gentoo.org/eclass-reference/make.conf/index.html)
- [Gentoo devmanual: USE-флаги и USE_EXPAND](https://devmanual.gentoo.org/general-concepts/use-flags/index.html)
- [ccache manual: конфигурация и sloppiness](https://ccache.dev/manual/4.14.html)
- [Clang: параметры командной строки](https://clang.llvm.org/docs/ClangCommandLineReference.html)
- [Rust: codegen options](https://doc.rust-lang.org/rustc/codegen-options/)
- [Go: минимальные требования GOAMD64](https://go.dev/wiki/MinimumRequirements)
- [GNU Fortran: invocation](https://gcc.gnu.org/onlinedocs/gfortran/Invoking-GNU-Fortran.html)

---
kind: system
scope: system
status: current
last_verified: 2026-09-11
verified_on: [asus-b5402]
---

# Очистка make.conf ASUS ExpertBook B5402 — 2026-09-11

Продолжение [аудита make.conf](2026-09-11-make-conf-audit.md). После сверки
документации и конфигурации с официальными источниками владелец системы удалил
из `/etc/portage/make.conf` два параметра, которые ни на что не влияли.

## Основания

| Параметр | Доказательство |
|---|---|
| `iris` в `VIDEO_CARDS` | Значения нет в `profiles/desc/video_cards.desc`; ebuild Mesa собирает iris и crocus по значению `intel` (`gallium_enable video_cards_intel crocus iris`). Вики Gentoo для Gen12 рекомендует `-* intel`. |
| `GOFLAGS="-buildmode=pie"` | `go-env.eclass` перезаписывает `GOFLAGS` собственным набором и сам добавляет `-buildmode=pie` для amd64 — переменная из `make.conf` не доходила до ebuild-сборок. |

## Изменения и проверка

Изменения в живой `/etc/portage/make.conf` внёс владелец системы. Подтверждение
итогового состояния:

- `bash -n /etc/portage/make.conf` — без ошибок;
- `portageq envvar VIDEO_CARDS` → `intel zink`, токен `iris` отсутствует;
- `portageq envvar GOFLAGS` → пусто;
- остальные переменные (`COMMON_FLAGS`, `FCFLAGS`/`FFLAGS`, `CCACHE_*`,
  `MAKEOPTS`) не изменились относительно [аудита](2026-09-11-make-conf-audit.md).

Оба удаления не затрагивают ни одной действующей настройки, поэтому пересборка
пакетов и изменение плана `@world` не требуются.

## Остаток

Комментарий в начале `make.conf` ссылается на отсутствующий `configs/README.md`.
Правка чисто косметическая и оставлена на усмотрение владельца.

## Подтверждения по официальным источникам

Сверка с официальными источниками 2026-09-11 дополнительно подтвердила
выводы аудита make.conf:

- GCC не поддерживает `-flto=thin` — это расширение Clang
  ([GCC: Optimize Options](https://gcc.gnu.org/onlinedocs/gcc/Optimize-Options.html));
- `CCACHE_COMPRESSLEVEL` — корректное имя переменной, сжатие включено по
  умолчанию; `file_macro` отсутствует в списке допустимых значений sloppiness
  ([ccache manual](https://ccache.dev/manual/4.14.html));
- цель `alderlake` в GCC включает SGX, KL, WIDEKL и PCONFIG, поэтому явные
  `-mno-*` реально отключают эти возможности
  ([GCC: x86 Options](https://gcc.gnu.org/onlinedocs/gcc/x86-Options.html));
- `SECUREBOOT_SIGN_KEY` и `SECUREBOOT_SIGN_CERT` потребляются
  `kernel-build.eclass` и `secureboot.eclass`.

## Источники

- [Gentoo Wiki: Intel](https://wiki.gentoo.org/wiki/Intel)
- [Gentoo Wiki: Safe CFLAGS](https://wiki.gentoo.org/wiki/Safe_CFLAGS)
- [Gentoo Wiki: Ccache](https://wiki.gentoo.org/wiki/Ccache)
- [Gentoo Wiki: Go](https://wiki.gentoo.org/wiki/Go)
- [Gentoo Wiki: Rust](https://wiki.gentoo.org/wiki/Rust)
- [Gentoo Wiki: MAKEOPTS](https://wiki.gentoo.org/wiki/MAKEOPTS)
- Дерево Gentoo: `profiles/desc/video_cards.desc`, `eclass/go-env.eclass`,
  ebuild `media-libs/mesa`.

---
kind: system
scope: system
status: current
last_verified: 2026-09-22
verified_on: [asus-b5402]
---

# Noctalia v5 на ASUS ExpertBook B5402

Файл фиксирует состояние Noctalia на эталонной системе. Установка, обновление
и общая модель конфигурации описаны в
[`desktop/noctalia-shell.md`](../../../desktop/noctalia-shell.md).

## Подтверждённое состояние

- Установлен пакет `gui-apps/noctalia-5.1.0` из репозитория
  `noctalia-overlay` (VDB: версия, repository, USE — проверено 2026-09-22).
- `USE=jemalloc` сохранён как осознанная runtime memory-allocation policy
  для long-running shell.
- Прежний локальный overlay `/var/db/repos/noctalia-local` и его запись в
  `/etc/portage/repos.conf/` удалены.
- Конфигурация хранится в `~/.config/noctalia/config.toml`.
- Настройки, изменённые через GUI, сохраняются в
  `~/.local/state/noctalia/settings.toml` и имеют более высокий приоритет.

## Переход в личный оверлей

Публичный [noctalia-overlay](https://github.com/vovanbl411/noctalia-overlay)
подключён к Portage. Кандидат был проверен `emerge --pretend` 2026-09-15,
затем обновление выполнено: `gui-apps/noctalia-5.1.0::noctalia-overlay`
заменил `5.0.1::guru` с `USE="jemalloc"`.

Структура, подключение и политика обновлений описаны в README
`noctalia-overlay`. Оверлей отслеживает только стабильные релизы; будущая
автоматизация будет создавать Issue о новом релизе и не станет менять ebuild'ы
или установленный пакет.

## Keyword-политика

Файл: `/etc/portage/package.accept_keywords/noctalia`

```text
gui-apps/noctalia                ~amd64
dev-cpp/sdbus-c++                ~amd64
```

Правила отражают план Portage на дату проверки. Перед удалением или
расширением списка нужно повторить `emerge --pretend` для текущей версии.

## Проверка

```bash
noctalia --version
cat /var/db/pkg/gui-apps/noctalia-*/repository
```

Ожидаемый результат:

```text
noctalia v5.1.0
noctalia-overlay
```

Проверка подтверждает версию бинарника и репозиторий установленного пакета. Она
не проверяет содержимое пользовательской TOML-конфигурации.

## История перехода

Версия `5.0.1` заменила Noctalia Shell `4.7.7`. После перехода на пакет из
GURU локальный overlay `noctalia-local` был удалён. Текущий
`noctalia-overlay` — отдельный публичный оверлей, созданный позднее;
`5.1.0::noctalia-overlay` заменила `5.0.1::guru` 2026-09-22.

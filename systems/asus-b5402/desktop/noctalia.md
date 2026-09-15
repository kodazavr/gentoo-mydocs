---
kind: system
scope: system
status: current
last_verified: 2026-09-15
verified_on: [asus-b5402]
---

# Noctalia v5 на ASUS ExpertBook B5402

Файл фиксирует состояние Noctalia на эталонной системе. Установка, обновление
и общая модель конфигурации описаны в
[`desktop/noctalia-shell.md`](../../../desktop/noctalia-shell.md).

## Подтверждённое состояние

- Установлен пакет `gui-apps/noctalia-5.0.1` из репозитория `guru`.
- Прежний локальный overlay `/var/db/repos/noctalia-local` и его запись в
  `/etc/portage/repos.conf/` удалены.
- Конфигурация хранится в `~/.config/noctalia/config.toml`.
- Настройки, изменённые через GUI, сохраняются в
  `~/.local/state/noctalia/settings.toml` и имеют более высокий приоритет.

## Подготовленный переход в личный оверлей

Публичный [noctalia-overlay](https://github.com/vovanbl411/noctalia-overlay)
подключён к Portage. Проверка от 2026-09-15 показала, что следующим кандидатом
на обновление выбран `gui-apps/noctalia-5.1.0::noctalia-overlay` вместо
`5.0.1::guru`:

```text
[ebuild     U ~] gui-apps/noctalia-5.1.0::noctalia-overlay [5.0.1::guru] USE="jemalloc"
```

Это только результат `emerge --pretend`: обновление ещё не выполнялось. Пока
не завершён merge, установленным пакетом остаётся `gui-apps/noctalia-5.0.1`
из `guru`.

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
noctalia v5.0.1
guru
```

Проверка подтверждает версию бинарника и репозиторий установленного пакета. Она
не проверяет содержимое пользовательской TOML-конфигурации.

## История перехода

Версия `5.0.1` заменила Noctalia Shell `4.7.7`. После перехода на пакет из
GURU локальный overlay `noctalia-local` был удалён. Текущий
`noctalia-overlay` — отдельный публичный оверлей, созданный позднее.

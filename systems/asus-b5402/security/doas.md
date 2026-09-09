---
kind: system
scope: system
status: draft
last_verified: null
verified_on: [asus-b5402]
---

# Политика doas на ASUS ExpertBook B5402

Старая запись разрешает группе `wheel` выполнять команды с `persist`,
сохраняет окружение для локального пользователя и отдельно разрешает запуск
`snapper`. Имя пользователя не публикуется. Перед применением нужно проверить
действующий `/etc/doas.conf`.

Общая конфигурация описана в [руководстве по doas](../../../security/doas-configuration.md).


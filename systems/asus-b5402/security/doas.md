---
kind: system
scope: system
status: draft
last_verified: 2026-09-22
verified_on: [asus-b5402]
---

# Политика doas на ASUS ExpertBook B5402

Действующая политика подтверждена сверкой с `/etc/doas.conf` 2026-09-22:
группа `wheel` выполняет команды с `persist`, окружение сохраняется для
локального пользователя, отдельно разрешён запуск `snapper`. Имя
пользователя не публикуется.

Общая конфигурация описана в [руководстве по doas](../../../security/doas-configuration.md).


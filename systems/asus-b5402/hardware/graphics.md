---
kind: system
scope: system
status: draft
last_verified: 2026-09-22
verified_on: [asus-b5402]
---

# Графический стек ASUS ExpertBook B5402

Записанное состояние сверено с системой 2026-09-22.

- Текущий модуль ядра — `i915`; переход на `xe` отложен.
- В Dracut явно добавлены `i915` и `nvme`, а строка `force_drivers+=" xe "`
  отключена.
- Для Mesa записаны `VIDEO_CARDS="intel zink"` и
  `MESA_LOADER_DRIVER_OVERRIDE="iris"`; Vulkan использует ANV.

Общая процедура и целевая конфигурация находятся в
[руководстве по Intel Graphics](../../../hardware/intel-graphics.md).


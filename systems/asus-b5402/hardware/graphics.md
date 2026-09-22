---
kind: system
scope: system
status: draft
last_verified: 2026-09-22
verified_on: [asus-b5402]
---

# Графический стек ASUS ExpertBook B5402

Записанное состояние сверено с системой 2026-09-22.

- GPU (Alder Lake-P Iris Xe, PCI `8086:46a6`) фактически привязан к `i915` —
  `Kernel driver in use: i915`; переход GPU на `xe` не выполнен.
- Модули `i915` и `xe` оба загружены в runtime; сама загрузка `xe` не
  означает переход GPU на Xe — driver in use остаётся `i915`.
- В Dracut явно добавлены `i915` и `nvme`, а строка `force_drivers+=" xe "`
  отключена.
- Для Mesa записаны `VIDEO_CARDS="intel zink"` и
  `MESA_LOADER_DRIVER_OVERRIDE="iris"`; Vulkan использует ANV.

Общая процедура и целевая конфигурация находятся в
[руководстве по Intel Graphics](../../../hardware/intel-graphics.md).


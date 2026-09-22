---
kind: system
scope: system
status: draft
last_verified: 2026-09-22
verified_on: [asus-b5402]
---

# Графический стек ASUS ExpertBook B5402

## Current state

Сейчас GPU работает через `i915`. Переход на Xe пока не выполнен.

- GPU: Intel Alder Lake-P Iris Xe, PCI `8086:46a6`
- Kernel driver: `i915`
- Mesa driver: `iris`
- Vulkan: `ANV`
- VIDEO_CARDS (build policy): `intel zink`
- Xe: модуль доступен и загружен, но GPU к нему не привязан

## Kernel driver

- GPU фактически привязан к `i915` — `Kernel driver in use: i915`.
- В runtime загружены оба модуля — `i915` и `xe`. Сама по себе загрузка
  `xe` не означает переход GPU на Xe: driver in use остаётся `i915`.
- В Dracut явно добавлены `i915` и `nvme`; строка `force_drivers+=" xe "`
  отключена.

## Userspace graphics

- Mesa использует драйвер `iris`; задан
  `MESA_LOADER_DRIVER_OVERRIDE="iris"`.
- Build policy для Mesa: `VIDEO_CARDS="intel zink"`.
- Vulkan использует ANV.

## Xe transition

Переход GPU с `i915` на Xe не выполнялся. Целевая конфигурация и процедура
находятся в [руководстве по Intel Graphics](../../../hardware/intel-graphics.md).

## Verification

- Состояние сверено с системой 2026-09-22.

## Related docs

- [Intel Graphics: драйвер Xe и Vulkan](../../../hardware/intel-graphics.md)

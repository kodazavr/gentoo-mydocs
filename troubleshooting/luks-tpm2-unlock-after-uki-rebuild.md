---
kind: troubleshooting
scope: general
status: current
last_verified: 2026-09-14
verified_on: [asus-b5402]
---

# TPM2-авторазблокировка LUKS не срабатывает после пересборки UKI

При загрузке внезапно запрашивается пароль LUKS, хотя авторазблокировка
через TPM2 работала. Решение проверено на эталонной системе asus-b5402
(systemd-boot + UKI с Dracut-генератором, sbctl, токен `systemd-tpm2`
на PCR 7); на другой прошивке причины и набор PCR могут отличаться.

## 1. Симптом

- При загрузке запрошен пароль LUKS вместо автоматической разблокировки.
- В журнале текущей загрузки:

```text
systemd-cryptsetup: TPM policy does not match current system state. \
Either system has been tampered with or policy out-of-date: Operation not permitted
```

## 2. Причина

Токен `systemd-tpm2` привязан к значению PCR (здесь — PCR 7, банк sha256:
состояние Secure Boot, ключи и сертификаты). Любое изменение загрузочной
цепочки, которое прошивка измеряет в этот PCR, делает токен недействительным:

- смена cmdline внутри UKI — на asus-b5402 совпала с поломкой (эпизод
  2026-09-14); прямой before/after-замер PCR 7 тогда не выполнялся, поэтому
  измеряет ли прошивка cmdline в PCR 7 напрямую — не установлено (по канону
  cmdline относится к PCR 8/12). Как проверить причинную связь — раздел 5;
- перезапись ключей Secure Boot (`sbctl enroll-keys`), обновления db/dbx;
- смена режима Secure Boot в BIOS.

Пересборка ядра с тем же сертификатом подписи сама по себе анлок не
ломала: переход 7.2.2 → 7.2.5 прошёл без последствий; с поломкой совпала
первая с момента настройки смена cmdline (2026-09-14).

## 3. Диагностика

**Шаг 1 — подтвердить класс ошибки.**

```bash
journalctl -b -u systemd-cryptsetup@cryptroot.service --no-pager
```

**Шаг 2 — понять, когда сломалось и работало ли вообще.** История
Starting/Finished по всем загрузкам (персистентный журнал):

```bash
journalctl -u systemd-cryptsetup@cryptroot.service --no-pager -o short \
  | grep -E 'Starting Crypt|Finished Crypt|does not match'
```

Тайминг — индикатор: `Starting → Finished` за 1–2 секунды — авторазблокировка;
15–25 секунд и пара `does not match` — пароль вводили руками.

**Шаг 3 — посмотреть состав токена.** Путь LUKS-раздела эталонной системы —
`/dev/nvme1n1p2` (свой найди через `lsblk -f`, раздел с `crypto_LUKS`):

```bash
doas cryptsetup luksDump /dev/nvme1n1p2 | grep -A20 '^Tokens:'
```

В блоке `Tokens:` ищи `tpm2-hash-pcrs` — это набор PCR токена.

> ⚠️ **Важный нюанс**: не трать время на эти пути (проверено 2026-09-14,
> systemd 261 / cryptsetup 2.x): у `systemd-cryptenroll` нет флага `--json`;
> в cryptsetup нет действия `token list`; **ID токена ≠ номер слота**
> (токены нумеруются отдельно и с нуля); тестовый
> `systemd-cryptsetup attach` корневого LUKS из работающей системы
> невозможен — устройство уже смонтировано («already in use»).
> Единственная честная проверка авторазблокировки — перезагрузка.

## 4. Исправление

Прежде чем применять:

- живой слот с паролем (не TPM2) — страховка, если пароль забыт,
  доступа к диску не будет;
- recovery-носитель не обязателен, но не помешает.

Перезачисление токена на текущее состояние PCR (набор подставь свой из
шага 3; команда спросит текущий пароль LUKS):

```bash
doas systemd-cryptenroll --tpm2-device=auto --tpm2-pcrs=7 \
  --wipe-slot=tpm2 /dev/nvme1n1p2
```

> **Важно**: `--wipe-slot=tpm2` удаляет **все** TPM2-слоты. Операция меняет
> LUKS2-заголовок; пароль слота 0 остаётся рабочим способом открыть диск
> при любом исходе.

Проверка: перезагрузка — пароль не запрошен; в журнале
`Starting → Finished` за 1–2 секунды без `does not match`.

Откат: предыдущий токен удалён wipe'ом и не восстанавливается — он и был
нерабочим. Если новый токен не сработал, диск открывается паролем слота 0,
а повторное зачисление выполняется той же командой.

## 5. Как определить, что именно ломает PCR

Снимай слепок PCR до и после подозрительного изменения (смена cmdline,
пересборка UKI, обновление sbctl) и сравнивай:

```bash
doas tpm2_pcrread sha256:7 > ~/pcr7-before.txt
# ... изменение загрузочной цепочки и перезагрузка ...
doas tpm2_pcrread sha256:7 > ~/pcr7-after.txt
diff ~/pcr7-before.txt ~/pcr7-after.txt
```

Значение изменилось — виновник найден; для cmdline это даёт практическое
правило: «меняю cmdline → перезачисляю токен».

Радикальная альтернатива — PCR-подпись (`--tpm2-public-key` + ukify как
генератор UKI): авторазблокировка переживает любые пересборки, ценой
перехода генератора UKI. На asus-b5402 отклонено 2026-09-14: инциденты
редкие, лечение — одна команда.

## 6. История наблюдений (asus-b5402)

- Март 2026 — 2 ошибки, апрель — 14 (эпизод прошёл сам, причину не искали).
- 2026-09-14 — первая смена cmdline (добавлен `audit_backlog_limit`)
  совпала с поломкой анлока; перезачисление на PCR 7 восстановило, проверено
  реальной загрузкой в тот же день. Before/after-замер PCR 7 не выполнялся —
  причинная связь «cmdline → PCR 7» остаётся гипотезой до замера по разделу 5.

## Environment

Gentoo, systemd 261.2, cryptsetup 2.x, systemd-boot + UKI (генератор
Dracut), sbctl, firmware TPM; токен `systemd-tpm2`: PCR 7, sha256, SRK.
Проверено 2026-09-14.

## Источники

- [`systemd-cryptenroll(8)`](https://www.freedesktop.org/software/systemd/man/latest/systemd-cryptenroll.html) — PCR-политики, повторное зачисление
- [`systemd-cryptsetup(8)`](https://www.freedesktop.org/software/systemd/man/latest/systemd-cryptsetup.html)
- [TPM2 PCR measurements (systemd)](https://systemd.io/TPM2_PCR_MEASUREMENTS/)
- [Ядро и загрузка: UKI](../installation/systemd-uki-setup.md)

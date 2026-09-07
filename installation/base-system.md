# Базовая настройка системы (Base System)

Конфигурация окружения Gentoo с упором на производительность (LLVM/LTO), современные линкеры и кэширование.

## 1. Настройка тулчейна (`/etc/portage/make.conf`)

В данной системе используется стек LLVM вместо классического GCC. Глобальный линкер — LLD; ccache включён для ускорения повторных сборок.

```makefile
# Глобальный тулчейн LLVM
LLVM_SLOT="22"
CC="clang"
CXX="clang++"
AR="llvm-ar"
NM="llvm-nm"
RANLIB="llvm-ranlib"

# CPU и общие флаги (Alder Lake + O3 + ThinLTO)
COMMON_FLAGS="-march=alderlake -O3 -flto=thin -pipe -mno-kl -mno-pconfig -mno-sgx -mno-widekl -mshstk"
CFLAGS="${COMMON_FLAGS}"
CXXFLAGS="${COMMON_FLAGS}"
FCFLAGS="${COMMON_FLAGS}"
FFLAGS="${COMMON_FLAGS}"
CPU_FLAGS_X86="aes avx avx2 avx_vnni bmi1 bmi2 f16c fma3 mmx mmxext pclmul popcnt rdrand sha sse sse2 sse3 sse4_1 sse4_2 ssse3 vpclmulqdq"

# Параллельная сборка
MAKEOPTS="-j14 -l10"

# Флаги компиляторов
RUSTFLAGS="-C target-cpu=alderlake -C opt-level=3 -C linker=clang -C link-arg=-fuse-ld=lld"
LDFLAGS="-Wl,-O1 -Wl,--as-needed -fuse-ld=lld"
GOAMD64="v3"
CGO_CFLAGS="${CFLAGS}"
CGO_CXXFLAGS="${CXXFLAGS}"
CGO_LDFLAGS="${LDFLAGS}"
GOFLAGS="-buildmode=pie"

# ccache настройки
FEATURES="${FEATURES} ccache" 
CCACHE_DIR="/var/tmp/ccache"
CCACHE_SIZE="50G"
CCACHE_COMPRESS="1"
CCACHE_COMPRESS_LEVEL="3"
CCACHE_SLOPPINESS="include_file_mtime,include_file_ctime,time_macros,file_macro,pch_defines"

USE="\
# Графика и дисплей
  wayland gles2 egl mapi opencl vpp vaapi vulkan zink \
# Оптимизация
  pgo lto custom-cflags asm \
# Аудио/видео
  alsa ffmpeg gstreamer pipewire sound-server v4l screencast icu \
# Сеть и устройства
  bluetooth wifi networkmanager udisks2 dist-kernel \
# Файловые системы и storage
  btrfs zstd \
# Системные (systemd, dbus, уведомления)
  systemd dbus libnotify policykit acpi \
# Desktop/input
  libinput \
# Безопасность
  tpm cryptsetup openssl secureboot apparmor audit bpf nftables verify-sig hardened \
# Отключенные (X11, elogind)
  -X -xwayland -elogind -consolekit -pulseaudio -telemetry"

# Видео и графика
VIDEO_CARDS="intel iris zink"
INPUT_DEVICES="libinput"

ABI_X86="64"
LC_MESSAGES="C.UTF-8"

GENTOO_MIRRORS="http://ftp.byfly.by/pub/gentoo-distfiles/ \
    ftp://ftp.byfly.by/pub/gentoo-distfiles/ \
    rsync://ftp.byfly.by/gentoo/ \
    https://mirror.yandex.ru/gentoo-distfiles/ \
    http://mirror.yandex.ru/gentoo-distfiles/ \
    ftp://mirror.yandex.ru/gentoo-distfiles/"

SECUREBOOT_SIGN_KEY="/var/lib/sbctl/keys/db/db.key"
SECUREBOOT_SIGN_CERT="/var/lib/sbctl/keys/db/db.pem"
```

> **Примечание**: ранее в качестве глобального линкера использовался `mold`. Сейчас системная сборка идёт через `lld`; `mold` остаётся в качестве линкера для Rust-флагов в `env/p-cores`.

## 2. Повышение привилегий (doas)

Вместо громоздкого sudo используется легковесный doas.

Файл: `/etc/doas.conf`

```conf
# Разрешить пользователю выполнять команды от root с сохранением пароля на время сессии
permit persist :wheel

# Сохранять переменные окружения для конкретного пользователя
permit keepenv vladimir

# Разрешить выполнение snapper без ввода пароля (для снапшотов)
permit persist :wheel as root cmd snapper
```

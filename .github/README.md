# Umbra (Vibepollo)

**Umbra's co-op host additions for Eclipse, built on [Vibepollo](https://github.com/Nonary/Vibepollo) instead of Apollo.**

[Project Hub](https://github.com/PreceptorOfMagic/Eclipse-Umbra-Project-Hub) · [Eclipse](https://github.com/PreceptorOfMagic/Eclipse) · [Umbra (Apollo-based)](https://github.com/PreceptorOfMagic/Umbra) · [Vibepollo](https://github.com/Nonary/Vibepollo)

> **Status: 2.18.9-umbra.1, built on Vibepollo 2.18.9.** Installed on two of the project's test PCs (Windows 11;
> RTX 4070, RTX 2060 SUPER) over the previous Umbra (Vibepollo) and over the Apollo-based Umbra, keeping
> configuration and pairings; streams in both directions and a co-op session opened with no errors.

[Download the latest release](https://github.com/PreceptorOfMagic/Umbra-Vibepollo/releases/latest) — the Windows
x64 installer `.exe` under **Assets**.

## Which Umbra?

Umbra comes in two versions. Both carry the same additions for Eclipse; they differ in the host they are built on.

| | Umbra | Umbra (Vibepollo) |
|---|---|---|
| Built on | [Apollo](https://github.com/ClassicOldSong/Apollo) (ClassicOldSong) | [Vibepollo](https://github.com/Nonary/Vibepollo) (Nonary), itself built on Apollo |
| Platforms | Windows x64, Linux (Flatpak) | Windows x64 |
| Installer | NSIS `.exe`; Linux Flatpak bundle | Vibepollo's MSI installer |
| Upgrades in place | an Apollo install | a Vibepollo, Apollo or Umbra install, keeping configuration and pairings |

Pick the version whose base host you would otherwise use. Everything Vibepollo adds over Apollo stays as Vibepollo ships it.

## Umbra (Vibepollo) and Vibepollo

Umbra (Vibepollo) is Vibepollo with the additions Eclipse needs for co-op, and as little else changed as possible.
Vibepollo is Nonary's project and is still maintained, so this version follows Vibepollo's releases instead of redoing
its work: the additions are kept apart from Vibepollo's own code wherever they can be, so each new Vibepollo release
can be merged in ([how](../docs/umbra-vibepollo.md)). The web interface says which Vibepollo release it is built on,
and whether a newer one is out.

It is an independent fork. It is not affiliated with or endorsed by Nonary (Vibepollo), ClassicOldSong (Apollo),
SudoMaker or LizardByte (Sunshine). Report problems with this version here, not to Vibepollo.

## What the Umbra additions provide

- The built-in **Co-op Pane** and per-launch co-op encoder tuning that Eclipse's two-host co-op uses.
- The **GPU HEVC co-op encoder** for mixed NVIDIA/AMD co-op (installed beside the host).
- **Eclipse Link**: the pad bridge and audio-cable companion, with its own firewall exclusion.
- Wired-network pinning, switching the host's physical monitor off for a stream on request, and the host log that
  Eclipse includes in its diagnostic bundle.
- Host capabilities (`UmbraCaps`) so Eclipse knows what this host supports.
- **HidHide**, installed silently by setup, so Eclipse can keep the controllers given to the other co-op PC away from
  this PC's own games when this PC is one of the two (removed on uninstall only if setup installed it).
- The mouse cursor is drawn into the stream, and Windows Mouse Keys enabled, only once the client has used a mouse.

[Eclipse/Umbra licence & notices](../LICENSES.md) · [GPL-3.0](../LICENSE)

# Umbra (Vibepollo)

**Umbra's co-op host additions for Eclipse, built on [Vibepollo](https://github.com/Nonary/Vibepollo) instead of Apollo.**

[Project Hub](https://github.com/PreceptorOfMagic/Eclipse-Umbra-Project-Hub) · [Eclipse](https://github.com/PreceptorOfMagic/Eclipse) · [Umbra (Apollo-based)](https://github.com/PreceptorOfMagic/Umbra) · [Vibepollo](https://github.com/Nonary/Vibepollo)

> **Status: first release, 2.0.0-umbra.1.** Installed and checked on the project's three test PCs (Windows 11;
> RTX 4070, RTX 3070, Radeon RX Vega): installs over Umbra in place and keeps pairings, and every Umbra component
> is present. Live streaming and co-op testing of this version is still in progress; the Apollo-based
> [Umbra](https://github.com/PreceptorOfMagic/Umbra) is the tested version.

[Download the latest release](https://github.com/PreceptorOfMagic/Umbra-Vibepollo/releases/latest) — the Windows
x64 installer `.exe` under **Assets**.

## Which Umbra?

Umbra comes in two versions. Both carry the same additions for Eclipse; they differ in the host they are built on.

| | Umbra | Umbra (Vibepollo) |
|---|---|---|
| Built on | [Apollo](https://github.com/ClassicOldSong/Apollo) (ClassicOldSong) | [Vibepollo](https://github.com/Nonary/Vibepollo) (Nonary), itself built on Apollo |
| Installer | NSIS `.exe` | Vibepollo's MSI installer |
| Upgrades in place | an Apollo install | a Vibepollo install |

Pick the edition whose base host you would otherwise use. Everything Vibepollo adds over Apollo stays as Vibepollo ships it.

## Umbra (Vibepollo) and Vibepollo

Umbra (Vibepollo) is Vibepollo with the additions Eclipse needs for co-op, and as little else changed as possible.
Vibepollo is Nonary's project and is still maintained, so this edition follows Vibepollo's releases instead of redoing
its work: the additions are kept apart from Vibepollo's own code wherever they can be, so each new Vibepollo release
can be merged in ([how](../docs/umbra-vibepollo.md)). The web interface says which Vibepollo release it is built on,
and whether a newer one is out.

It is an independent fork. It is not affiliated with or endorsed by Nonary (Vibepollo), ClassicOldSong (Apollo),
SudoMaker or LizardByte (Sunshine). Report problems with this edition here, not to Vibepollo.

## What the Umbra additions provide

- The built-in **Co-op Pane** and per-launch co-op encoder tuning that Eclipse's two-host co-op uses.
- The **GPU HEVC co-op encoder** for mixed NVIDIA/AMD co-op (installed beside the host).
- **Eclipse Link**: the pad bridge and audio-cable companion, with its own firewall exclusion.
- Wired-network pinning, switching the host's physical monitor off for a stream on request, and the host log that
  Eclipse includes in its diagnostic bundle.
- Host capabilities (`UmbraCaps`) so Eclipse knows what this host supports.

[Eclipse/Umbra licence & notices](../LICENSES.md) · [GPL-3.0](../LICENSE)

# Umbra (Vibepollo) 2.18.9-umbra.1 source manifest

Umbra (Vibepollo) is Vibepollo (Nonary) with Umbra's additions for Eclipse. This manifest records what this
release was built from. How the edition is kept in step with Vibepollo and Umbra: `docs/umbra-vibepollo.md`.

## Source

- This repository, tag `v2.18.9-umbra.1`: Vibepollo 2.18.9 (63980058) merged into the Umbra (Vibepollo) line
  after 2.0.0-umbra.1, plus the Umbra (Vibepollo) commits after the merge. The complete source, including every
  submodule at its pinned commit, is this repository.
- Version `2.18.9-umbra.1`, set through `BUILD_VERSION` (MSI ProductVersion 2.18.990.0).

## Build (Windows x64)

- MSYS2 UCRT64, GCC 16.2, Ninja, CMake Release with the configure options of Vibepollo's `ci-windows.yml`
  (WebRTC on, `-O3 -DNDEBUG -g -gdwarf-4`, the VHF gamepad driver bundled), plus
  `-DUMBRA_GPU_HEVC_DIR=<GPU HEVC payload>`; tests not built.
- .NET SDK 10.0.404 (Microsoft's signed `dotnet-install.ps1`) for the Playnite plugin, now required by Vibepollo.
- Static codec inputs: LizardByte build-deps at df4c19e82853e4168ffde8b9cab435449929db5f (submodule).
- WiX Toolset 3.14.1, installed from the .NET Foundation-signed `wix314.exe`.
- The MSI is packaged with `cpack -G WIX` and wrapped by `packaging/windows/bootstrapper/build_bootstrapper.ps1`
  (`-DisableSignPath`), as Vibepollo's `package_msi` and `package_installer` targets do; the VHF package is
  refreshed and signed (below) first.

## Pinned binary inputs (fetched with Vibepollo's own download scripts)

| Input | Release | Check |
|---|---|---|
| libwebrtc | Nonary/libwebrtc v1.0.2 | archive sha256 d178fb780c2770ea68d4664ebfe0fe8478ed9b358357bca16551c6eac5eb7148 |
| Vibepollo Display Driver | Nonary/libvirtualdisplay v1.6.5 (source b6874684) | package validated by `refresh_driver_package.ps1` against `third-party/libvirtualdisplay-release/windows-x64.json` |
| VHF virtual gamepad driver | Nonary/libvirtualgamepad v0.1.0-beta.10 | archive sha256 650cf8281d95d1fb9388f8117cadeab195727e3dcb4105607df45080b15d312c, source 5a3e4d22, DriverVer 10/29/2026,0.1.0.92 |
| usbip-win2 (optional transport) | vadimgrn/usbip-win2 v.0.9.8.1 | installer sha256 38cad6d4432b52d5bb9409d9ad03b72fdffc4ada4cd3a48fbeca1a2752a8518a; Microsoft-signed files unchanged |
| TrueHDR (RTX HDR) runtime | Nonary/vibeshine_truehdr_runtime v1.0.0 | `nvngx_truehdr.dll` sha256 9a80575f247190c05fe80eac0c4baa1d0d4d932348f26808310b5ec4bf9eeb4b, `vibeshine_truehdr.dll` sha256 17e69dc6edf0c171adea981e3fbc49199d5326c068234093860554fe5cc824b8 |
| HidHide | nefarius/HidHide v1.5.230.0 | installer sha256 f4bbbcb82e6258641b887c74bc81c4c5f66e4aa811808dfc304347687b7605f6 |
| GPU HEVC co-op encoder | the payload shipped in Umbra 0.5.0 (byte-identical to 2.0.0-umbra.1) | provenance and hashes in `gpu-hevc/BUILD-PROVENANCE.json` |
| SudoVDA, nefconc | as in Umbra 0.5.0 (byte-identical to 2.0.0-umbra.1) | `drivers/sudovda/PROVENANCE.json` |

`nvngx_truehdr.dll` is NVIDIA's RTX Video SDK runtime. It is closed source and governed by NVIDIA's SDK licence
terms, not the GPL; it is included exactly as Vibepollo includes it.

## Signing

- The installer and application are not code-signed yet.
- Vibepollo signs the VHF gamepad catalog and setup tool in its own release signing. Until this project has code
  signing, they are signed with Umbra's own certificate "CN=Umbra (Vibepollo) Driver Signing (pre-SignPath)"
  (thumbprint 53DCB6EECA685704AFA2E26E7ECE5EBC266C56F6) by `scripts/umbra_sign_vhf.ps1`, after
  `refresh_sunshine_virtual_gamepad_driver_assets` and before packaging. The driver's install script accepts only
  that thumbprint and adds the certificate to the PC's LocalMachine Root and TrustedPublisher stores.

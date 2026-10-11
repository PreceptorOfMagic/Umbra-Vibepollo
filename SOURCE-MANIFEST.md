# Umbra (Vibepollo) 2.0.0-umbra.1 source manifest

Umbra (Vibepollo) is Vibepollo (Nonary) with Umbra's additions for Eclipse. This manifest records what this
release was built from. How the edition is kept in step with Vibepollo and Umbra: `docs/umbra-vibepollo.md`.

## Source

- This repository, tag `v2.0.0-umbra.1`: a merge of Umbra `release/umbra-0.5` (82ad72cb) into Vibepollo 2.0.0
  (8a8c4b03), plus the Umbra (Vibepollo) commits after it. The complete source, including every submodule at its
  pinned commit, is this repository.
- Version `2.0.0-umbra.1`, set through `BUILD_VERSION` (MSI ProductVersion 2.0.90.0).

## Build (Windows x64)

- MSYS2 UCRT64, GCC 16.1, Ninja, CMake Release, the configure options of Vibepollo's `ci-windows.yml` with
  WebRTC on, plus `-DAPOLLO_BETA_PROFILE=OFF`, `-DUMBRA_GPU_HEVC_DIR=<GPU HEVC payload>` and
  `-DUMBRA_VHF_SIGNING_THUMBPRINT=53DCB6EECA685704AFA2E26E7ECE5EBC266C56F6`.
- Static codec inputs: LizardByte build-deps at fce763bb09c73b5952ccdcbc90efb8ba8f53a7de (submodule).
- WiX Toolset 3.14.1 (`wix314-binaries.zip`, sha256 6ac824e1642d6f7277d0ed7ea09411a508f6116ba6fae0aa5f2c7daa2ff43d31),
  byte-identical to the payload of the .NET Foundation-signed `wix314.exe`.

## Pinned binary inputs (fetched with Vibepollo's own download scripts)

| Input | Release | Check |
|---|---|---|
| libwebrtc | Nonary/libwebrtc v1.0.2 | archive sha256 d178fb780c2770ea68d4664ebfe0fe8478ed9b358357bca16551c6eac5eb7148 |
| Vibepollo Display Driver | Nonary/libvirtualdisplay v1.6.3 | package validated by `refresh_driver_package.ps1`; catalog signed "Sunshine Virtual Display Release Signing" |
| VHF virtual gamepad driver | Nonary/libvirtualgamepad v0.1.0-beta.6 | archive sha256 a45a8ae27d2764ad26a4b89d43d1e2dc43510d84bddd5899aac7c80499754782, source 4b56fb9d |
| TrueHDR (RTX HDR) runtime | Nonary/vibeshine_truehdr_runtime v1.0.0 | `nvngx_truehdr.dll` sha256 9a80575f247190c05fe80eac0c4baa1d0d4d932348f26808310b5ec4bf9eeb4b, `vibeshine_truehdr.dll` sha256 17e69dc6edf0c171adea981e3fbc49199d5326c068234093860554fe5cc824b8 |
| GPU HEVC co-op encoder | the payload shipped in Umbra 0.5.0 | provenance and hashes in `gpu-hevc/BUILD-PROVENANCE.json` |
| SudoVDA, nefconc | as in Umbra 0.5.0 | `drivers/sudovda/PROVENANCE.json` |

`nvngx_truehdr.dll` is NVIDIA's RTX Video SDK runtime. It is closed source and governed by NVIDIA's SDK licence
terms, not the GPL; it is included exactly as Vibepollo includes it.

## Signing

- The installer and application are not code-signed yet.
- Vibepollo signs the VHF gamepad catalog and setup tool in its own release signing. Until this project has code
  signing, they are signed with Umbra's own certificate "CN=Umbra (Vibepollo) Driver Signing (pre-SignPath)"
  (thumbprint 53DCB6EECA685704AFA2E26E7ECE5EBC266C56F6). The driver's install script accepts only that
  thumbprint and adds the certificate to the PC's LocalMachine Root and TrustedPublisher stores.

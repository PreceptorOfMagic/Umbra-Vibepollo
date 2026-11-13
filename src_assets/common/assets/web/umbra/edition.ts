// Umbra (Vibepollo): the edition's names and addresses, in ONE place.
//
// This tree is Vibepollo (Nonary) with Umbra's co-op additions layered on, kept as close to Vibepollo as
// possible so Vibepollo's updates merge cheaply (docs/umbra-vibepollo.md). Vibepollo's own files reach
// these constants through a handful of one-line hooks; everything else Umbra adds to the web UI lives in
// this folder.

export const PRODUCT_NAME = 'Umbra (Vibepollo)';
export const UMBRA_REPO = 'https://github.com/PreceptorOfMagic/Umbra-Vibepollo';
export const UMBRA_RELEASES_API = 'https://api.github.com/repos/PreceptorOfMagic/Umbra-Vibepollo/releases';
export const UPSTREAM_NAME = 'Vibepollo';
export const UPSTREAM_REPO = 'https://github.com/Nonary/Vibepollo';
export const UPSTREAM_RELEASES_API = 'https://api.github.com/repos/Nonary/Vibepollo/releases';
export const HUB = 'https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/';
export const ECLIPSE_REPO = 'https://github.com/PreceptorOfMagic/Eclipse';
// The release list Eclipse and Umbra share for their update notices (the hub's site/updates.json), and this
// edition's key in it. A release published there with "notify": false is not announced (umbra/updates.ts).
export const UPDATES_URL = HUB + 'updates.json';
export const UPDATES_PRODUCT = 'umbra-vibepollo';

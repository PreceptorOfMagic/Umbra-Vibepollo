# Umbra (Vibepollo): sign the VHF gamepad catalog and its root-device setup tool with Umbra's own certificate, BEFORE
# the project has SignPath signing. Vibepollo ships this package unsigned (its producer cannot sign) and signs these two
# files in its MSI signing request; without a signature the installer refuses the driver ("no intact Authenticode
# signature"). install.ps1 accepts this signer only by its pinned thumbprint and trusts it on the machine.
# Run by CMake right after refresh_driver_package.ps1 (cmake/packaging/windows.cmake, UMBRA_VHF_SIGNING_THUMBPRINT).
param(
    [Parameter(Mandatory = $true)][string] $PackageDir,
    [Parameter(Mandatory = $true)][string] $Thumbprint
)
$ErrorActionPreference = 'Stop'
$kits = Join-Path ${env:ProgramFiles(x86)} 'Windows Kits\10\bin'
$signtool = Get-ChildItem $kits -Recurse -Filter signtool.exe -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -match '\\x64\\' } | Sort-Object FullName | Select-Object -Last 1
if (-not $signtool) { throw '[umbra-sign-vhf] signtool.exe (Windows SDK) not found.' }
$files = @(
    (Join-Path $PackageDir 'driver\VibeshineVhfGamepad.cat'),
    (Join-Path $PackageDir 'tools\VibeshineVhfGamepadDeviceSetup.exe')
)
foreach ($f in $files) {
    if (-not (Test-Path -LiteralPath $f)) { throw "[umbra-sign-vhf] missing $f" }
    $args = @('sign', '/sha1', $Thumbprint, '/s', 'My', '/fd', 'sha256')
    # A timestamp keeps the signature valid after the certificate expires; signing still works offline without one.
    & $signtool.FullName @($args + @('/tr', 'http://timestamp.digicert.com', '/td', 'sha256', $f)) | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[umbra-sign-vhf] timestamp server unavailable; signing $([IO.Path]::GetFileName($f)) without a timestamp"
        & $signtool.FullName @($args + @($f)) | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "[umbra-sign-vhf] signtool failed for $f" }
    }
    $sig = Get-AuthenticodeSignature -LiteralPath $f
    if ($null -eq $sig.SignerCertificate -or $sig.SignerCertificate.Thumbprint -ne $Thumbprint) {
        throw "[umbra-sign-vhf] $f is not signed by $Thumbprint after signing"
    }
    Write-Host "[umbra-sign-vhf] signed $([IO.Path]::GetFileName($f)) ($($sig.Status) on this machine)"
}

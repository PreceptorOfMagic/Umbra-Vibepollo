# HidHide lets Eclipse keep the controllers a player gives to the other co-op PC away from this PC's own games,
# when this PC is one of the two co-op PCs. It changes nothing on its own: nothing is hidden until Eclipse asks.
# Installed silently with Umbra, and removed with Umbra only if Umbra installed it (a marker under ProgramData).
# Run by setup.exe after this product's MSI (packaging/windows/bootstrapper/UmbraHidHide.cs), never from inside it.
$ErrorActionPreference = 'Stop'
$markerDir = Join-Path $env:ProgramData 'Umbra'
$marker = Join-Path $markerDir 'hidhide-installed-by-umbra'
$retryTask = 'Umbra HidHide install after restart'

function Remove-RetryTask {
    Unregister-ScheduledTask -TaskName $retryTask -Confirm:$false -ErrorAction SilentlyContinue
}

# Runs this script once, elevated, when an administrator next signs in -- the context setup.exe runs in, where
# HidHide installs in seconds. NOT as SYSTEM: MEASURED 2026-11-19 on VEGA, HidHide's installer run as SYSTEM never
# finishes (its RegisterUpdater action, nefarius_HidHide_Updater.exe --install, sits idle; the same at boot and with
# no restart at all). The ScheduledTasks cmdlets, not schtasks /TR: PowerShell 5.1 splits a quoted path with spaces
# passed to schtasks.exe (MEASURED the same day).
function Register-RetryTask {
    $action = New-ScheduledTaskAction -Execute 'powershell.exe' `
        -Argument "-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    $trigger = New-ScheduledTaskTrigger -AtLogOn
    $principal = New-ScheduledTaskPrincipal -GroupId 'S-1-5-32-544' -RunLevel Highest  # BUILTIN\Administrators
    Register-ScheduledTask -TaskName $retryTask -Action $action -Trigger $trigger -Principal $principal -Force | Out-Null
}

$runningAsSystem = [Security.Principal.WindowsIdentity]::GetCurrent().User.Value -eq 'S-1-5-18'

if (Get-Service -Name 'HidHide' -ErrorAction SilentlyContinue) {
    # A HidHide that was just uninstalled (by Umbra or by hand) keeps its service until Windows restarts: the
    # service is only marked for deletion. MEASURED 2026-11-19 on VEGA: uninstall, then setup before a restart
    # skipped HidHide as "already installed", and the restart would have left the PC without it. Install it
    # once after the restart instead, at the next administrator sign-in (Register-RetryTask).
    $deleteFlag = (Get-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Services\HidHide' -Name DeleteFlag -ErrorAction SilentlyContinue).DeleteFlag
    if ($deleteFlag -eq 1) {
        try {
            Register-RetryTask
        } catch {
            Write-Host "HidHide is pending removal and its after-restart install could not be scheduled: $_"
            exit 1
        }
        Write-Host 'HidHide is pending removal until Windows restarts; it will be installed after the restart.'
        exit 3010
    }
    Write-Host 'HidHide is already installed; leaving it as it is.'
    Remove-RetryTask
    exit 0
}

if ($runningAsSystem) {
    # Setup run as SYSTEM (a deployment tool): never start HidHide's installer here, it would hang (see above).
    try { Register-RetryTask } catch {
        Write-Host "Running as SYSTEM; HidHide's install could not be scheduled for the next administrator sign-in: $_"
        exit 1
    }
    Write-Host 'Running as SYSTEM; HidHide will be installed when an administrator next signs in.'
    exit 0
}

$installerPath = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) 'hidhide_installer.exe'
$installer = Start-Process -FilePath $installerPath -ArgumentList '/quiet', '/norestart' -Wait -PassThru
$code = $installer.ExitCode
if ($code -eq 0 -or $code -eq 3010) {
    New-Item -ItemType Directory -Force -Path $markerDir | Out-Null
    Set-Content -Path $marker -Value 'HidHide was installed by Umbra setup; Umbra removes it when Umbra is uninstalled.'
    # HidHide's installer puts its configuration tool on every user's desktop (MEASURED 2026-11-15). Umbra users
    # never need it -- Eclipse sets HidHide up itself -- so the shortcut goes; the tool stays in HidHide's folder.
    Remove-Item -Force -ErrorAction SilentlyContinue (Join-Path $env:PUBLIC 'Desktop\HidHide Configuration Client.lnk')
}
# One attempt after a restart, whatever its result: a failing install must not retry at every boot.
Remove-RetryTask
Write-Host "HidHide installer exit $code"
# 3010 = installed, a restart completes it; setup records it without restarting the PC.
exit $code

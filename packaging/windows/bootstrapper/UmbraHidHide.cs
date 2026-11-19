// Umbra (Vibepollo): HidHide with this product, from the bootstrapper.
//
// HidHide (Nefarius, MIT) lets Eclipse keep the controllers a player gives to the other co-op PC away from this PC's
// own games when this PC is one of the two co-op PCs. It changes nothing on its own: nothing is hidden until Eclipse
// asks. It is installed silently with this product and removed with it only if this product installed it (the
// scripts keep a marker under ProgramData).
//
// WHY HERE AND NOT IN THE MSI: HidHide's installer is itself an MSI. Run from a custom action of our MSI it failed
// with 0x80070652 (ERROR_INSTALL_ALREADY_RUNNING): Windows runs one MSI install at a time. setup.exe and
// uninstall.exe (both built from this bootstrapper) run it before or after our MSI instead, when no MSI is running.
// Running our .msi directly installs no HidHide; Eclipse then reports that it is missing.
//
// A HidHide failure never fails setup. Output goes to %TEMP%\umbra_hidhide_<time>.log.

using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Security.Principal;

namespace VibepolloInstaller {
  internal static class UmbraHidHide {
    private const string InstallScript = "install-hidhide.ps1";
    private const string UninstallScript = "uninstall-hidhide.ps1";
    private static readonly TimeSpan ScriptTimeout = TimeSpan.FromMinutes(5);

    // After a successful install or upgrade. A failure leaves the result as it is (it only means Eclipse cannot
    // hide pads on this PC). 3010 -- HidHide still pending removal from an uninstall, so the script scheduled its
    // install for after the restart, or HidHide's own installer asked for one -- becomes a restart request.
    public static InstallerResult AfterInstall(InstallerResult result) {
      if (result == null || !result.Succeeded || !IsElevated()) {
        return result;
      }
      var script = FindScript(InstallScript, false);
      if (script != null && RunScript(script, "install") == 3010 && result.ExitCode == 0) {
        result.ExitCode = 3010;
      }
      return result;
    }

    // Before a real uninstall (not an upgrade: upgrades go through AfterInstall), while the scripts still exist.
    // Returns 3010 when removing HidHide needs a restart to finish (its service is marked for deletion).
    public static int BeforeUninstall() {
      if (!IsElevated()) {
        return 0;
      }
      var script = FindScript(UninstallScript, true);
      return script == null ? 0 : RunScript(script, "uninstall");
    }

    // Folds BeforeUninstall's restart request into the product's own uninstall result.
    public static InstallerResult MergeUninstall(InstallerResult result, int hidHideCode) {
      if (result != null && hidHideCode == 3010 && result.ExitCode == 0) {
        result.ExitCode = 3010;
      }
      return result;
    }

    private static string FindScript(string name, bool includeOwnDirectory) {
      var roots = new System.Collections.Generic.List<string>();
      try {
        var product = InstallerRunner.GetInstalledVibepolloProduct();
        if (product != null && !string.IsNullOrWhiteSpace(product.InstallLocation)) {
          roots.Add(product.InstallLocation);
        }
      } catch (Exception) {
        // fall through to the other locations
      }
      if (includeOwnDirectory) {
        roots.Add(AppDomain.CurrentDomain.BaseDirectory);  // uninstall.exe runs from the install folder
      }
      try {
        roots.Add(InstallerRunner.DefaultInstallDirectory);
      } catch (Exception) {
      }
      return roots
        .Where(root => !string.IsNullOrWhiteSpace(root))
        .Select(root => Path.Combine(root.Trim().Trim('"'), "scripts", name))
        .FirstOrDefault(File.Exists);
    }

    private static int RunScript(string script, string operation) {
      var log = Path.Combine(Path.GetTempPath(), "umbra_hidhide_" + operation + "_" + DateTime.Now.ToString("yyyyMMdd_HHmmss") + ".log");
      try {
        var info = new ProcessStartInfo {
          FileName = ResolvePowerShellPath(),
          Arguments = "-NoProfile -NonInteractive -ExecutionPolicy Bypass -File \"" + script + "\"",
          UseShellExecute = false,
          CreateNoWindow = true,
          RedirectStandardOutput = true,
          RedirectStandardError = true,
          WorkingDirectory = Path.GetDirectoryName(script)
        };
        using (var process = Process.Start(info)) {
          var stdout = process.StandardOutput.ReadToEndAsync();
          var stderr = process.StandardError.ReadToEndAsync();
          if (!process.WaitForExit((int) ScriptTimeout.TotalMilliseconds)) {
            try { process.Kill(); } catch (Exception) { }
            File.WriteAllText(log, "HidHide " + operation + ": timed out after " + ScriptTimeout + "\r\n");
            return 0;
          }
          File.WriteAllText(log, "HidHide " + operation + " (" + script + "): exit " + process.ExitCode + "\r\n"
            + stdout.Result + "\r\n" + stderr.Result);
          return process.ExitCode;
        }
      } catch (Exception ex) {
        try { File.WriteAllText(log, "HidHide " + operation + " failed to start: " + ex); } catch (Exception) { }
        return 0;
      }
    }

    private static string ResolvePowerShellPath() {
      var windows = Environment.GetFolderPath(Environment.SpecialFolder.Windows);
      var system = Environment.Is64BitOperatingSystem && !Environment.Is64BitProcess ? "Sysnative" : "System32";
      return Path.Combine(windows, system, "WindowsPowerShell", "v1.0", "powershell.exe");
    }

    private static bool IsElevated() {
      try {
        using (var identity = WindowsIdentity.GetCurrent()) {
          return new WindowsPrincipal(identity).IsInRole(WindowsBuiltInRole.Administrator);
        }
      } catch (Exception) {
        return false;
      }
    }
  }
}

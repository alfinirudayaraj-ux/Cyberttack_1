# ShieldLux clipboard + toast bridge (ASCII-only file).
# Runs as ONE persistent process: polls the real system clipboard, emits changes
# as base64 lines on stdout, shows real Windows toasts on stdin commands.
$ErrorActionPreference = 'SilentlyContinue'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Write-Output 'READY'
$last = ''
$n = 0
while ($n -lt 1000000) {
  if ([Console]::In.Peek() -ge 0) {
    $line = [Console]::In.ReadLine()
    if ($null -ne $line) {
      if ($line -eq 'QUIT') { Write-Output 'BYE'; break }
      elseif ($line.StartsWith('TOAST ')) {
        $parts = $line.Substring(6).Split('|')
        try {
          $title = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($parts[0]))
          $body  = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($parts[1]))
          [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
          [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
          $e1 = [System.Security.SecurityElement]::Escape($title)
          $e2 = [System.Security.SecurityElement]::Escape($body)
          $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
          $xml.LoadXml('<toast><visual><binding template="ToastGeneric"><text>' + $e1 + '</text><text>' + $e2 + '</text></binding></visual><audio src="ms-winsoundevent:Notification.Default"/></toast>')
          $tn = [Windows.UI.Notifications.ToastNotification]::new($xml)
          [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\WindowsPowerShell\v1.0\powershell.exe').Show($tn)
          Write-Output 'TOAST_OK'
        } catch {
          Write-Output ('TOAST_ERR ' + $_.Exception.Message)
        }
      }
    }
  }
  $clip = Get-Clipboard -Raw 2>$null
  $s = ''
  if ($null -ne $clip) { $s = [string]$clip }
  if ($s -ne $last) {
    $last = $s
    if ($s.Length -ge 3) {
      $b64 = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($s))
      Write-Output ('CLIP ' + $b64)
    }
  }
  Start-Sleep -Milliseconds 350
  $n++
}

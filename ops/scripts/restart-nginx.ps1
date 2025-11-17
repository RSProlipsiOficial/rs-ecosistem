$ErrorActionPreference = 'Stop'
Write-Host "Restarting nginx (expects Linux environment)"
Try {
  & bash -lc "sudo systemctl restart nginx" | Out-String | Write-Host
} Catch {
  Write-Warning "Could not restart nginx from Windows. Run on VPS: sudo systemctl restart nginx"
}
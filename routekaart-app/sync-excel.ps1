# sync-excel.ps1 - Genereert js/data.js vanuit de Excel routekaart-database
# Gebruik: dubbelklik op "SYNC - Excel naar app.bat"

$excelPath  = Join-Path (Split-Path $PSScriptRoot) "Database_routekaart_v3_elementaire leerdoelen en breuken uitgewerkt.xlsx"
$outputPath = Join-Path $PSScriptRoot "js\data.js"

$sectieKleuren = @{
  'B' = '#E06C20'; 'P' = '#8E44AD'; 'V' = '#2980B9'; 'A' = '#27AE60'
  'M' = '#C0392B'; 'S' = '#16A085'; 'K' = '#D4A017'; 'D' = '#2C3E50'; 'G' = '#6C3483'
}

function EscJson([string]$s) {
  $s -replace '\\','\\' -replace '"','\"' -replace "`r`n",'\n' -replace "`n",'\n' -replace "`t",'\t'
}

function ParseLeerdoelen([string]$cel) {
  if ([string]::IsNullOrWhiteSpace($cel)) { return @() }
  $m = [regex]::Matches($cel, '[A-Z]+\.[0-9]+')
  return @($m | ForEach-Object { $_.Value })
}

function ParseVoorkennis([string]$cel) {
  if ([string]::IsNullOrWhiteSpace($cel)) { return @() }
  return @($cel -split '[,\s]+' | Where-Object { $_ -match '^[A-Z]+\.[0-9]+$' } | ForEach-Object { $_.Trim() })
}

Write-Host "Verbinden met Excel..." -ForegroundColor Cyan
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

try {
  $wb = $excel.Workbooks.Open($excelPath)

  Write-Host "Leerdoelen inlezen..." -ForegroundColor Cyan
  $sheet   = $wb.Sheets["Leerdoelen"]
  $lastRow = $sheet.UsedRange.Rows.Count
  $secties = [System.Collections.ArrayList]::new()
  $huidigeSectie = $null

  for ($r = 2; $r -le $lastRow; $r++) {
    $nummer = $sheet.Cells($r, 1).Text.Trim()
    $naam   = $sheet.Cells($r, 2).Text.Trim()
    $vk     = $sheet.Cells($r, 3).Text.Trim()
    if ([string]::IsNullOrWhiteSpace($naam)) { continue }

    # Sectie-header: kolom A leeg, kolom B heeft naam zonder punt-notatie
    if ([string]::IsNullOrWhiteSpace($nummer) -and $naam -notmatch '\.') {
      # ID nog niet bekend: wordt gezet bij eerste leerdoel
      $huidigeSectie = [PSCustomObject]@{ id=''; naam=$naam; kleur=''; leerdoelen=[System.Collections.ArrayList]::new() }
      [void]$secties.Add($huidigeSectie)
      continue
    }

    # Leerdoel-rij
    if ($nummer -match '^([A-Z]+)\.[0-9]+$' -and $huidigeSectie) {
      $sectieId = $Matches[1]
      # Stel sectie-ID in op het ID van het EERSTE leerdoel in de groep
      if ([string]::IsNullOrWhiteSpace($huidigeSectie.id)) {
        $huidigeSectie.id    = $sectieId
        $huidigeSectie.kleur = if ($sectieKleuren[$sectieId]) { $sectieKleuren[$sectieId] } else { '#607D8B' }
      }
      # Voeg leerdoel toe aan de HUIDIGE sectie (ongeacht prefix)
      [void]$huidigeSectie.leerdoelen.Add([PSCustomObject]@{
        id=$nummer; naam=$naam; voorkennis=(ParseVoorkennis $vk)
      })
    }
  }

  Write-Host "Activiteiten inlezen..." -ForegroundColor Cyan
  $sheetA   = $wb.Sheets["Activiteiten"]
  $lastRowA = $sheetA.UsedRange.Rows.Count
  $activiteiten = [System.Collections.ArrayList]::new()
  $actTeller = 1

  for ($r = 2; $r -le $lastRowA; $r++) {
    $ldCel    = $sheetA.Cells($r, 1).Text.Trim()
    $url      = $sheetA.Cells($r, 2).Text.Trim()
    $info     = $sheetA.Cells($r, 3).Text.Trim()
    $bijz     = $sheetA.Cells($r, 4).Text.Trim()
    $niveau   = $sheetA.Cells($r, 6).Text.Trim()
    $inloggen = $sheetA.Cells($r, 7).Text.Trim()
    $soort    = $sheetA.Cells($r, 8).Text.Trim()
    $bronNaam = $sheetA.Cells($r, 9).Text.Trim()
    if ([string]::IsNullOrWhiteSpace($url)) { continue }
    $naamRaw = ($info -split ';')[0].Trim()
    if ([string]::IsNullOrWhiteSpace($naamRaw)) { $naamRaw = "Activiteit $actTeller" }
    [void]$activiteiten.Add([PSCustomObject]@{
      id=$("act_{0:D3}" -f $actTeller); leerdoelen=(ParseLeerdoelen $ldCel); naam=$naamRaw
      bron=$bronNaam; url=$url; niveau=$niveau
      soort=if($soort){$soort}else{'overig'}; inloggen=($inloggen -eq 'ja').ToString().ToLower(); bijz=$bijz
    })
    $actTeller++
  }
  $wb.Close($false)

  Write-Host "data.js genereren..." -ForegroundColor Cyan
  $sb = [System.Text.StringBuilder]::new()
  [void]$sb.AppendLine("// Automatisch gegenereerd door sync-excel.ps1 - niet handmatig aanpassen")
  [void]$sb.AppendLine("// Bronbestand: $(Split-Path $excelPath -Leaf)")
  [void]$sb.AppendLine("// Gegenereerd op: $(Get-Date -Format 'yyyy-MM-dd HH:mm')")
  [void]$sb.AppendLine("")
  [void]$sb.AppendLine("const CURRICULUM = {")
  [void]$sb.AppendLine("  secties: [")
  foreach ($s in $secties) {
    if ([string]::IsNullOrWhiteSpace($s.id)) { continue }
    [void]$sb.AppendLine("    {")
    [void]$sb.AppendLine("      id: '$(EscJson $s.id)',")
    [void]$sb.AppendLine("      naam: '$(EscJson $s.naam)',")
    [void]$sb.AppendLine("      kleur: '$(EscJson $s.kleur)',")
    [void]$sb.AppendLine("      leerdoelen: [")
    foreach ($l in $s.leerdoelen) {
      $vkJs = ($l.voorkennis | ForEach-Object { "'$_'" }) -join ', '
      [void]$sb.AppendLine("        { id: '$(EscJson $l.id)', naam: `"$(EscJson $l.naam)`", voorkennis: [$vkJs] },")
    }
    [void]$sb.AppendLine("      ]")
    [void]$sb.AppendLine("    },")
  }
  [void]$sb.AppendLine("  ],")
  [void]$sb.AppendLine("")
  [void]$sb.AppendLine("  activiteiten: [")
  foreach ($a in $activiteiten) {
    $ldJs  = ($a.leerdoelen | ForEach-Object { "'$_'" }) -join ', '
    $bijzJs = if ($a.bijz) { ", bijzonderheden: `"$(EscJson $a.bijz)`"" } else { "" }
    [void]$sb.AppendLine("    { id: '$(EscJson $a.id)', leerdoelen: [$ldJs], naam: `"$(EscJson $a.naam)`", bron: `"$(EscJson $a.bron)`", url: '$(EscJson $a.url)', niveau: '$(EscJson $a.niveau)', soort: '$(EscJson $a.soort)', inloggen: $($a.inloggen)$bijzJs },")
  }
  [void]$sb.AppendLine("  ]")
  [void]$sb.AppendLine("};")

  [System.IO.File]::WriteAllText($outputPath, $sb.ToString(), [System.Text.Encoding]::UTF8)

  $totaalLd = ($secties | ForEach-Object { $_.leerdoelen.Count } | Measure-Object -Sum).Sum
  Write-Host ""
  Write-Host "data.js bijgewerkt!" -ForegroundColor Green
  Write-Host "  Secties:      $($secties.Count)"
  Write-Host "  Leerdoelen:   $totaalLd"
  Write-Host "  Activiteiten: $($activiteiten.Count)"
  Write-Host ""
  Write-Host "Vernieuw de browser (F5) om de wijzigingen te zien." -ForegroundColor Yellow

} catch {
  Write-Host "FOUT: $_" -ForegroundColor Red
} finally {
  $excel.Quit()
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
}

Write-Host ""
Write-Host "Druk op een toets om af te sluiten..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
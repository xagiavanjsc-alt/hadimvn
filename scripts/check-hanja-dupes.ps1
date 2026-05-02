$lines = Get-Content src\mocks\data\hanja-data.ts
$koreans = $lines | Select-String -Pattern 'korean:\s*"([^"]+)"' | ForEach-Object { $_.Matches.Groups[1].Value }
$total = $koreans.Count
$unique = ($koreans | Sort-Object -Unique).Count
$dupes = $koreans | Group-Object | Where-Object { $_.Count -gt 1 }
Write-Host "Total entries: $total"
Write-Host "Unique korean: $unique"
Write-Host "Duplicate korean words: $($dupes.Count)"
if ($dupes.Count -gt 0) {
    Write-Host "--- First 30 duplicates: ---"
    $dupes | Select-Object -First 30 | ForEach-Object {
        Write-Host "  $($_.Name) ($($_.Count) lan)"
    }
}

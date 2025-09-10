$carMatData = Get-Content 'scripts/carmat-data.json' -Raw | ConvertFrom-Json
$body = @{ carMatData = $carMatData } | ConvertTo-Json -Depth 10
$response = Invoke-RestMethod -Uri 'http://localhost:3000/api/carmat/bulk-insert' -Method POST -Body $body -ContentType 'application/json'
Write-Output ($response | ConvertTo-Json -Depth 3)

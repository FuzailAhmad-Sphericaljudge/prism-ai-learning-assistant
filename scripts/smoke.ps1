# ========================================================
# PRISM API Production Smoke Test Suite (PowerShell)
# Team The Falcons — Hackathon 2026
# ========================================================
param (
    [string]$BaseUrl = $env:PRISM_API_URL
)

if (-not $BaseUrl) {
    $BaseUrl = "https://prism-api-z7c9.onrender.com"
}
$BaseUrl = $BaseUrl.TrimEnd("/")

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Starting PRISM Smoke Test Suite (PowerShell)" -ForegroundColor Cyan
Write-Host " Target Endpoint: $BaseUrl" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$FailedCount = 0

function Run-Check {
    param (
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [string]$Body
    )

    Write-Host -NoNewline "Checking $Name ($Method $Endpoint)... "
    $Url = "$BaseUrl$Endpoint"

    try {
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri $Url -Method GET -TimeoutSec 20
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Body $Body -ContentType "application/json" -TimeoutSec 30
        }
        Write-Host "PASS [200 OK]" -ForegroundColor Green
    } catch {
        Write-Host "FAIL" -ForegroundColor Red
        $script:FailedCount++
    }
}

Run-Check -Name "Health Check" -Method "GET" -Endpoint "/health"
Run-Check -Name "Root Welcome" -Method "GET" -Endpoint "/"
Run-Check -Name "Course Listing" -Method "GET" -Endpoint "/courses"

$RetrievePayload = '{"course_id":"00000000-0000-0000-0000-000000000002","query":"What is a binary search tree?","playback_sec":1122.0,"mode":"learn_so_far"}'
Run-Check -Name "Firewall Retrieval Debug" -Method "POST" -Endpoint "/retrieve/debug" -Body $RetrievePayload

$ChatPayload = '{"course_id":"00000000-0000-0000-0000-000000000002","query":"What is an attention head?","playback_sec":300.0,"mode":"learn_so_far"}'
Run-Check -Name "Grounded Chat Generation" -Method "POST" -Endpoint "/chat" -Body $ChatPayload

Run-Check -Name "Admin Observability Metrics" -Method "GET" -Endpoint "/admin/metrics"

Write-Host "==================================================" -ForegroundColor Cyan
if ($FailedCount -eq 0) {
    Write-Host " All Smoke Tests Passed Successfully!" -ForegroundColor Green
    Write-Host " PRISM API is Production Ready." -ForegroundColor Green
} else {
    Write-Host " Smoke Test Suite Finished with $FailedCount Failures." -ForegroundColor Red
}
Write-Host "==================================================" -ForegroundColor Cyan

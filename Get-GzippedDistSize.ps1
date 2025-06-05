# Get-GzippedDistSize.ps1

# --- Configuration ---
$SourceFolderName = "openRetic-pwa\dist"
$TargetFolderName = "openRetic-pwa\dist-gzipped" # Changed from dist-gzipped-temp for clarity
$ExtensionsToGzip = @(".html", ".css", ".js", ".svg", ".webmanifest", ".json", ".txt", ".xml", ".map")

# --- Get Base Path ---
$BasePath = $PSScriptRoot # Assumes script is in c:\GitHub\openReticApp
if (-not $BasePath) {
    $BasePath = Get-Location # Fallback if $PSScriptRoot is not available (e.g. ISE)
}
$SourcePath = Join-Path -Path $BasePath -ChildPath $SourceFolderName
$TargetPath = Join-Path -Path $BasePath -ChildPath $TargetFolderName

# --- Script Start ---
Write-Host "Starting GZip size calculation..."
Write-Host "Source directory: $SourcePath"
Write-Host "Target directory: $TargetPath"

# 1. Validate Source Path
if (-not (Test-Path -Path $SourcePath -PathType Container)) {
    Write-Error "Source directory '$SourcePath' not found. Please build the project first (e.g., npm run build in openRetic-pwa)."
    exit 1
}

# 2. Prepare Target Directory (Clean if exists, then recreate)
if (Test-Path -Path $TargetPath) {
    Write-Host "Removing existing target directory: $TargetPath"
    Remove-Item -Path $TargetPath -Recurse -Force
}
Write-Host "Creating target directory: $TargetPath"
New-Item -Path $TargetPath -ItemType Directory -Force | Out-Null

# 3. Copy all files from Source to Target
Write-Host "Copying files from $SourcePath to $TargetPath..."
Copy-Item -Path (Join-Path $SourcePath "*") -Destination $TargetPath -Recurse -Force

# 4. Gzip specified file types in the Target directory
Write-Host "Gzipping files in $TargetPath..."
Get-ChildItem -Path $TargetPath -Recurse -File | ForEach-Object {
    $file = $_ 
    if ($ExtensionsToGzip -contains $file.Extension.ToLower()) {
        $originalFilePath = $file.FullName
        $gzippedFilePath = $originalFilePath + ".gz"

        try {
            Write-Host "  Gzipping: $($file.Name)"
            $inputStream = New-Object System.IO.FileStream($originalFilePath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::Read)
            $outputStream = New-Object System.IO.FileStream($gzippedFilePath, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write, [System.IO.FileShare]::None)
            $gzipStream = New-Object System.IO.Compression.GZipStream($outputStream, [System.IO.Compression.CompressionMode]::Compress)

            $inputStream.CopyTo($gzipStream)

            $gzipStream.Close()
            $outputStream.Close()
            $inputStream.Close()

            # Remove the original uncompressed file after successful gzipping
            Remove-Item -Path $originalFilePath -Force
        }
        catch {
            Write-Warning "Failed to gzip file: $($originalFilePath). Error: $($_.Exception.Message)"
        }
    } else {
        Write-Host "  Skipping (not gzipping): $($file.Name)"
    }
}

# 5. Calculate total size of the Target directory
Write-Host "Calculating total size of $TargetPath..."
$totalSize = (Get-ChildItem -Path $TargetPath -Recurse -File | Measure-Object -Property Length -Sum).Sum

if ($totalSize -gt 0) {
    $totalSizeKB = [Math]::Round($totalSize / 1KB, 2)
    $totalSizeMB = [Math]::Round($totalSize / 1MB, 2)
    Write-Host "--------------------------------------------------"
    Write-Host "Total gzipped size of '$TargetFolderName':"
    Write-Host "  $totalSize Bytes"
    Write-Host "  $totalSizeKB KB"
    Write-Host "  $totalSizeMB MB"
    Write-Host "--------------------------------------------------"
} else {
    Write-Warning "Target directory is empty or size calculation failed."
}

Write-Host "Script finished."

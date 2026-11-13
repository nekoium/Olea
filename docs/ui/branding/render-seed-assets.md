# Selected Seed asset renderer

**OBSERVED:** Reuses the original geometry, fonts and banner composition from `render-study-01.md`. The larger exports are rendered from drawing commands, not enlarged from the comparison PNG. The study crop preserves its original pixels. Source code uses the repository MIT license; font provenance is in `directions-01.md`.

Run the fenced PowerShell source from the repository root, supplying `FontRoot` with the canvas-design `canvas-fonts` directory. Requires Windows/System.Drawing and the existing comparison PNG. Writes only the three named assets under `docs/ui/branding/`.

```powershell
param([Parameter(Mandatory=$true)][string]$FontRoot)
$ErrorActionPreference = 'Stop'
$dir = Join-Path (Get-Location) 'docs/ui/branding'
$original = [System.IO.File]::ReadAllText((Join-Path $dir 'render-study-01.md'))
$source = $original.Split(@('```powershell'),[System.StringSplitOptions]::None)[1].Split(@('```'),[System.StringSplitOptions]::None)[0]
$prefix = $source.Substring(0,$source.IndexOf('$g.Clear('))
# Reuse drawing helpers without invoking the original parameter block.
$prefix = $prefix.Substring($prefix.IndexOf('Add-Type'))
Invoke-Expression $prefix
$g.Dispose(); $img.Dispose()
$img = [System.Drawing.Bitmap]::new(1024,1024)
$g = [System.Drawing.Graphics]::FromImage($img)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.ColorTranslator]::FromHtml('#32472D'))
Mark 'A' 0 0 1024 '#E8ECCD' '#32472D' '#C8DC83'
$img.Save((Join-Path $dir 'seed-icon.png'),[System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $img.Dispose()
$img = [System.Drawing.Bitmap]::new(1560,798)
$g = [System.Drawing.Graphics]::FromImage($img)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.Clear([System.Drawing.ColorTranslator]::FromHtml('#32472D'))
$g.ScaleTransform([single]3,[single]3)
Mark 'A' 250 -42 360 '#65744D' '#32472D' '#65744D'
Text 'Olea' 28 28 62 '#E8ECCD' $outfit
Text 'Agents on Android' 31 191 22 '#E8ECCD'
$img.Save((Join-Path $dir 'seed-banner.png'),[System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $img.Dispose(); $fonts.Dispose()
$comparison = [System.Drawing.Bitmap]::new((Join-Path $dir 'directions-01.png'))
$crop = $comparison.Clone([System.Drawing.Rectangle]::new(60,180,520,970),$comparison.PixelFormat)
$crop.Save((Join-Path $dir 'seed-study.png'),[System.Drawing.Imaging.ImageFormat]::Png)
$crop.Dispose(); $comparison.Dispose()
```

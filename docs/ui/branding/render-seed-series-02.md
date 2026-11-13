# Seed promotional series renderer

Original source, MIT licensed under the repository license. Reuses the selected Seed geometry and locally installed OFL fonts documented in `directions-01.md`. No network access or new dependencies.

Run the fenced PowerShell source from the repository root, passing `FontRoot` as the canvas-design `canvas-fonts` directory. Requires Windows/System.Drawing. Writes the four compositions and contact sheet in this folder. Text measurement assertions reject overflowing text. Digital RGB PNG output; no print color profile or bleed is implied.

```powershell
param([Parameter(Mandatory=$true)][string]$FontRoot)
$ErrorActionPreference = 'Stop'
$dir = Join-Path (Get-Location) 'docs/ui/branding'
$original = [System.IO.File]::ReadAllText((Join-Path $dir 'render-study-01.md'))
$source = $original.Split(@('```powershell'),[System.StringSplitOptions]::None)[1].Split(@('```'),[System.StringSplitOptions]::None)[0]
$prefix = $source.Substring(0,$source.IndexOf('$g.Clear('))
$prefix = $prefix.Substring($prefix.IndexOf('Add-Type'))
Invoke-Expression $prefix
$g.Dispose(); $img.Dispose()
$ink = '#32472D'; $pale = '#E8ECCD'; $paper = '#F5F3ED'
function Canvas($w,$h,$bg) {
  $script:img = [System.Drawing.Bitmap]::new($w,$h)
  $script:g = [System.Drawing.Graphics]::FromImage($script:img)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $g.Clear([System.Drawing.ColorTranslator]::FromHtml($bg))
}
function Text($s,$x,$y,$size,$color,$family=$sans,$maxWidth=0) {
  $f=[System.Drawing.Font]::new($family,[single]$size,[System.Drawing.FontStyle]::Regular,[System.Drawing.GraphicsUnit]::Pixel)
  $m=$g.MeasureString($s,$f)
  if($maxWidth -eq 0) { $maxWidth=$img.Width-$x }
  if($x -lt 0 -or $y -lt 0 -or $m.Width -gt $maxWidth -or ($y+$m.Height) -gt $img.Height) {
    $f.Dispose(); throw "Text exceeds its space: $s ($($m.Width) x $($m.Height))"
  }
  $b=Brush $color; $g.DrawString($s,$f,$b,[single]$x,[single]$y); $f.Dispose(); $b.Dispose()
}
function CenterText($s,$y,$size,$color,$family=$sans) {
  $f=[System.Drawing.Font]::new($family,[single]$size,[System.Drawing.FontStyle]::Regular,[System.Drawing.GraphicsUnit]::Pixel)
  $m=$g.MeasureString($s,$f); $f.Dispose()
  Text $s (($img.Width-$m.Width)/2) $y $size $color $family
}
function Save($name,$w,$h) {
  if($img.Width -ne $w -or $img.Height -ne $h) { throw "Incorrect dimensions for $name" }
  $img.Save((Join-Path $dir $name),[System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $img.Dispose()
}
# Portrait: generous vertical rhythm, complete isolated seed.
Canvas 1600 2400 $ink
Text 'Olea' 104 78 124 $pale $outfit
Mark 'A' 200 265 1200 $pale $ink $pale
Text 'The agents' 104 1510 124 $pale
Text 'you use,' 104 1654 124 $pale
Text 'running on' 104 1798 124 $pale
Text 'your phone.' 104 1942 124 $pale
Save 'seed-poster-portrait.png' 1600 2400
# Landscape: separate text and image fields, optical crop at the right edge.
Canvas 1920 1080 $paper
Text 'Olea' 92 72 104 $ink $outfit
Text 'The agents you use,' 92 486 91 $ink $sans 1010
Text 'running on' 92 602 91 $ink $sans 1010
Text 'your phone.' 92 718 91 $ink $sans 1010
Rect 1180 0 740 1080 $ink
$clip=$g.Save(); $g.SetClip([System.Drawing.Rectangle]::new(1180,0,740,1080))
Mark 'A' 1080 -20 1200 $pale $ink $pale
$g.Restore($clip)
Save 'seed-poster-landscape.png' 1920 1080
# Thin banner: a horizontal lockup with generous space between elements.
Canvas 2400 600 $ink
Text 'Olea' 94 178 148 $pale $outfit 460
Text 'The agents you use,' 682 185 67 $pale $sans 1040
Text 'running on your phone.' 682 274 67 $pale $sans 1040
Mark 'A' 1800 0 600 $pale $ink $pale
Save 'seed-banner-thin.png' 2400 600
# Square: centered emblem and a balanced two-line slogan on light paper.
Canvas 1600 1600 $paper
CenterText 'Olea' 75 116 $ink $outfit
Mark 'A' 345 300 910 $ink $paper $ink
CenterText 'The agents you use,' 1215 79 $ink
CenterText 'running on your phone.' 1324 79 $ink
Save 'seed-promo-square.png' 1600 1600
# Review sheet: retain each image's full aspect ratio, with neutral labels outside art.
Canvas 1800 1450 '#E6E5DE'
Text 'Olea / Seed' 55 32 48 $ink $outfit
Text 'Promotional series 02' 55 100 23 $ink
function Thumbnail($name,$x,$y,$w,$h) {
  $asset=[System.Drawing.Bitmap]::new((Join-Path $dir $name))
  if([Math]::Abs(($asset.Width/$asset.Height)-($w/$h)) -gt 0.001) { throw "Distorted preview: $name" }
  $g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($asset,[System.Drawing.Rectangle]::new($x,$y,$w,$h)); $asset.Dispose()
}
Text 'Portrait / 2:3' 55 163 21 $ink
Thumbnail 'seed-poster-portrait.png' 55 205 600 900
Text 'Landscape / 16:9' 710 163 21 $ink
Thumbnail 'seed-poster-landscape.png' 710 205 1024 576
Text 'Square / 1:1' 710 817 21 $ink
Thumbnail 'seed-promo-square.png' 710 859 460 460
Text 'Thin banner / 4:1' 55 1150 21 $ink
Thumbnail 'seed-banner-thin.png' 55 1192 600 150
Text 'The agents you use,' 1220 997 32 $ink
Text 'running on your phone.' 1220 1040 32 $ink
Save 'seed-series-02.png' 1800 1450
$fonts.Dispose()
```

# Rendering source — study 01

**AGENT PLAN:** Local, reproducible PowerShell/System.Drawing renderer. Produces only the comparison PNG. Requires Windows and the two font families listed in `directions-01.md`. No network access. Original drawing code, MIT licensed under the repository license.

Run the fenced PowerShell source from the repository root. The optional `FontRoot` parameter locates the canvas-design skill's `canvas-fonts` folder. The output is `docs/ui/branding/directions-01.png`.

```powershell
param([string]$FontRoot = 'C:/Users/Aria/.agents/skills/canvas-design/canvas-fonts')
Add-Type -AssemblyName System.Drawing
$img = New-Object System.Drawing.Bitmap 1800,1280
$g = [System.Drawing.Graphics]::FromImage($img)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$fonts = New-Object System.Drawing.Text.PrivateFontCollection
$fonts.AddFontFile("$FontRoot/InstrumentSans-Regular.ttf")
$fonts.AddFontFile("$FontRoot/Outfit-Regular.ttf")
$sans = $fonts.Families | Where-Object { $_.Name -like '*Instrument*' } | Select-Object -First 1
$outfit = $fonts.Families | Where-Object { $_.Name -like '*Outfit*' } | Select-Object -First 1
function Brush($hex) { return [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml($hex)) }
function Rect($x,$y,$w,$h,$color) { $b=Brush $color; $g.FillRectangle($b,[single]$x,[single]$y,[single]$w,[single]$h); $b.Dispose() }
function Text($s,$x,$y,$size,$color,$family=$sans) {
  $f=[System.Drawing.Font]::new($family,[single]$size,[System.Drawing.FontStyle]::Regular,[System.Drawing.GraphicsUnit]::Pixel)
  $b=Brush $color; $g.DrawString($s,$f,$b,[single]$x,[single]$y); $f.Dispose(); $b.Dispose()
}
function Ellipse($x,$y,$w,$h,$color) { $b=Brush $color; $g.FillEllipse($b,[single]$x,[single]$y,[single]$w,[single]$h); $b.Dispose() }
function Poly($coords,$color) {
  $pts = [System.Drawing.PointF[]]@(for($i=0;$i -lt $coords.Count;$i+=2){ [System.Drawing.PointF]::new([single]$coords[$i],[single]$coords[$i+1]) })
  $b=Brush $color; $g.FillPolygon($b,$pts); $b.Dispose()
}
function Mark($kind,$x,$y,$s,$fg,$bg,$secondary) {
  $state=$g.Save(); $g.TranslateTransform([single]$x,[single]$y); $g.ScaleTransform([single]$s,[single]$s)
  if($kind -eq 'A') {
    $g.ScaleTransform([single]0.01,[single]0.01)
    $p=[System.Drawing.Drawing2D.GraphicsPath]::new()
    $p.AddBezier([single]22,[single]79,[single]10,[single]39,[single]39,[single]17,[single]78,[single]21)
    $p.AddBezier([single]78,[single]21,[single]90,[single]61,[single]61,[single]83,[single]22,[single]79)
    $b=Brush $fg; $g.FillPath($b,$p); $b.Dispose(); $p.Dispose()
    $pen=[System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml($bg),[single]4.2)
    $g.DrawLine($pen,[single]25,[single]76,[single]73,[single]24); $pen.Dispose()
  } elseif($kind -eq 'B') {
    Ellipse .18 .18 .64 .64 $fg
    Ellipse .34 .34 .32 .32 $bg
    Poly @(.53,.49,.92,.49,.92,.86,.76,.86) $bg
    Rect .55 .55 .28 .105 $fg
  } else {
    Poly @(.18,.35,.52,.15,.82,.33,.82,.68,.49,.87,.18,.68) $fg
    Poly @(.18,.35,.52,.15,.67,.24,.34,.44,.34,.61,.18,.70) $secondary
    Poly @(.49,.51,.67,.41,.67,.59,.49,.69,.34,.61) $bg
    Poly @(.49,.69,.67,.59,.82,.68,.49,.87,.18,.68,.34,.59) $fg
  }
  $g.Restore($state)
}
$g.Clear([System.Drawing.ColorTranslator]::FromHtml('#F5F3ED'))
Text 'Olea' 56 32 64 '#20251F' $outfit
Text 'Three directions for an independent Android agent app' 58 108 23 '#60645B'
Text 'BRAND STUDY 01  /  PROPOSALS' 1320 60 17 '#60645B'
Rect 60 159 1680 1 '#C9CCC2'
$directions = @(
  @{kind='A'; name='Seed'; bg='#E8ECCD'; ink='#32472D'; accent='#C8DC83'; stage='#ECEEE4'; note='Warm / organic / quiet'; line1='An olive-like form with an open seam.'; line2='Closest to the current interface palette.'},
  @{kind='B'; name='Aperture'; bg='#DCE6FA'; ink='#152A45'; accent='#4269E8'; stage='#E9EDF3'; note='Precise / technical / direct'; line1='An open O with a command-like cursor.'; line2='A stronger developer-tool character.'},
  @{kind='C'; name='Fold'; bg='#EBDEF2'; ink='#48304E'; accent='#AF88BE'; stage='#F0E9ED'; note='Expressive / tactile / editorial'; line1='A folded ribbon, compact and angular.'; line2='The boldest departure from olive.'}
)
for($i=0;$i -lt 3;$i++) {
  $d=$directions[$i]; $x=60+$i*580
  Text ($d.kind+'  /  '+$d.name) $x 188 30 $d.ink $outfit
  Text $d.note $x 235 19 '#60645B'
  Rect $x 286 520 256 $d.stage
  Rect ($x+30) 314 200 200 $d.ink
  Mark $d.kind ($x+30) 314 200 $d.bg $d.ink $d.accent
  Ellipse ($x+293) 319 96 96 $d.ink
  Mark $d.kind ($x+293) 319 96 $d.bg $d.ink $d.bg
  Rect ($x+290) 450 48 48 $d.ink
  Mark $d.kind ($x+290) 450 48 $d.bg $d.ink $d.bg
  Rect ($x+363) 458 32 32 $d.ink
  Mark $d.kind ($x+363) 458 32 $d.bg $d.ink $d.bg
  Text '48' ($x+298) 504 12 '#60645B'
  Text '32' ($x+368) 504 12 '#60645B'
  Text 'Olea' ($x-3) 565 81 $d.ink $outfit
  Text 'WORDMARK + SYMBOL' ($x+277) 612 13 '#60645B'
  for($j=0;$j -lt 3;$j++) {
    $colors=@($d.ink,$d.bg,$d.accent)
    Rect ($x+$j*51) 681 40 12 $colors[$j]
  }
  Text 'Banner language' $x 722 17 '#60645B'
  Rect $x 762 520 266 $d.ink
  $clip=$g.Save(); $g.SetClip([System.Drawing.Rectangle]::new($x,762,520,266))
  if($i -eq 0) {
    Mark 'A' ($x+250) 720 360 '#65744D' $d.ink '#65744D'
  } elseif($i -eq 1) {
    Mark 'B' ($x+235) 717 365 '#2C4262' $d.ink '#2C4262'
  } else {
    Mark 'C' ($x+265) 730 340 '#72537D' $d.ink '#9672A2'
  }
  $g.Restore($clip)
  Text 'Olea' ($x+28) 790 62 $d.bg $outfit
  Text 'Agents on Android' ($x+31) 953 22 $d.bg
  Text $d.line1 $x 1062 21 $d.ink
  Text $d.line2 $x 1098 20 '#60645B'
}
Rect 60 1174 1680 1 '#C9CCC2'
Text 'Original geometric studies. Icon silhouettes, wordmarks and banner compositions for discussion.' 60 1203 18 '#60645B'
Text 'No brand selected.' 1517 1203 18 '#60645B'
$img.Save((Join-Path (Get-Location) 'docs/ui/branding/directions-01.png'),[System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $img.Dispose(); $fonts.Dispose()
```

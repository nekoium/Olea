# Gentle olive photographic poster renderer

Original layout and source code use the repository MIT license. The photograph retains its separate Pexels license; see `../../sources/README.md`. Fonts and original Seed geometry are documented in `../../directions-01.md`.

Run the fenced PowerShell source from the repository root, passing `FontRoot` as the canvas-design `canvas-fonts` folder. Windows/System.Drawing only; no network requests, paid services or dependencies. Retains the source JPEG unchanged and renders the gentler refinement inside `variants/olive-refined-04/`. Pixel grading uses a fixed random seed so the noise is reproducible.

```powershell
param([Parameter(Mandatory=$true)][string]$FontRoot)
$ErrorActionPreference = 'Stop'
$dir = Join-Path (Get-Location) 'docs/ui/branding'
$archiveDir = Join-Path $dir 'variants/olive-refined-04'
$original = [System.IO.File]::ReadAllText((Join-Path $dir 'render-study-01.md'))
$source = $original.Split(@('```powershell'),[System.StringSplitOptions]::None)[1].Split(@('```'),[System.StringSplitOptions]::None)[0]
$prefix = $source.Substring(0,$source.IndexOf('$g.Clear('))
$prefix = $prefix.Substring($prefix.IndexOf('Add-Type'))
Invoke-Expression $prefix
$g.Dispose(); $img.Dispose()
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
public static class OleaPhotoGrade03 {
  static byte Clamp(double n) { return (byte)Math.Max(0, Math.Min(255, Math.Round(n))); }
  static double[,] Field(int w,int h,int scale,Random rng,double strength) {
    double[,] field=new double[h/scale+2,w/scale+2];
    for(int y=0;y<field.GetLength(0);y++)
      for(int x=0;x<field.GetLength(1);x++)
        field[y,x]=(rng.NextDouble()+rng.NextDouble()+rng.NextDouble()-1.5)*strength;
    return field;
  }
  static double Sample(double[,] field,int x,int y,int scale) {
    int gx=x/scale, gy=y/scale;
    double fx=(x%scale)/(double)scale, fy=(y%scale)/(double)scale;
    fx=fx*fx*(3-2*fx); fy=fy*fy*(3-2*fy);
    double a=field[gy,gx]*(1-fx)+field[gy,gx+1]*fx;
    double b=field[gy+1,gx]*(1-fx)+field[gy+1,gx+1]*fx;
    return a*(1-fy)+b*fy;
  }
  public static void Apply(Bitmap bitmap) {
    BitmapData data = bitmap.LockBits(new Rectangle(0,0,bitmap.Width,bitmap.Height), ImageLockMode.ReadWrite, PixelFormat.Format24bppRgb);
    try {
      int w=bitmap.Width, h=bitmap.Height, stride=data.Stride;
      if(stride<=0) throw new InvalidOperationException("Positive bitmap stride required.");
      byte[] bytes=new byte[stride*h]; Marshal.Copy(data.Scan0,bytes,0,bytes.Length);
      Random rng=new Random(6231906);
      // Paper has diffuse tooth and uneven density at several physical scales.
      double[,] tooth=Field(w,h,4,rng,6);
      double[,] paper=Field(w,h,28,rng,4);
      double[,] clouds=Field(w,h,150,rng,1.5);
      for(int y=0;y<h;y++) {
        double v=(double)y/(h-1);
        // Deep olive veil behind the upper-left copy, tapering smoothly below it.
        double top=0.52*Math.Pow(Math.Max(0,1-v/0.59),1.2);
        double bottom=0.09*Math.Pow(Math.Max(0,(v-0.78)/0.22),1.3);
        for(int x=0;x<w;x++) {
          int i=y*stride+x*3;
          double b=bytes[i], g=bytes[i+1], r=bytes[i+2];
          double l=0.2126*r+0.7152*g+0.0722*b;
          // Preserve the original photographic colors, then add a restrained olive bias.
          r=17+0.90*(0.78*r+0.22*l);
          g=21+0.86*(0.78*g+0.22*l);
          b=17+0.74*(0.78*b+0.22*l);
          double nx=((double)x/(w-1)-0.5)*2;
          double ny=(v-0.5)*2;
          double vignette=0.065*(nx*nx+ny*ny);
          double veil=Math.Min(0.75,0.10+top+bottom+vignette);
          r=r*(1-veil)+50*veil; g=g*(1-veil)+71*veil; b=b*(1-veil)+45*veil;
          // Soft paper texture replaces the sharp, high-contrast film speckle.
          double grain=Sample(tooth,x,y,4)+Sample(paper,x,y,28)+Sample(clouds,x,y,150)
            +(rng.NextDouble()+rng.NextDouble()+rng.NextDouble()-1.5)*5;
          bytes[i]=Clamp(b+grain); bytes[i+1]=Clamp(g+grain); bytes[i+2]=Clamp(r+grain);
        }
      }
      Marshal.Copy(bytes,0,data.Scan0,bytes.Length);
    } finally { bitmap.UnlockBits(data); }
  }
}
'@
$photo=[System.Drawing.Bitmap]::new((Join-Path $dir 'sources/pexels-6231906.jpeg'))
if($photo.Width -ne 3360 -or $photo.Height -ne 5040) { throw 'Unexpected source dimensions.' }
$img=[System.Drawing.Bitmap]::new(1600,2400,[System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g=[System.Drawing.Graphics]::FromImage($img)
$g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($photo,[System.Drawing.Rectangle]::new(0,0,1600,2400))
$photo.Dispose(); $g.Dispose()
[OleaPhotoGrade03]::Apply($img)
$g=[System.Drawing.Graphics]::FromImage($img)
$g.SmoothingMode=[System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint=[System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
# Faint short fibers sit within the paper layer, beneath the clean typography.
$fibers=[System.Random]::new(6231907)
$lightFiber=[System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(6,221,225,195),[single]0.65)
$darkFiber=[System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(5,27,43,24),[single]0.65)
for($i=0;$i -lt 14000;$i++) {
  $x=$fibers.NextDouble()*1600; $y=$fibers.NextDouble()*2400
  $angle=$fibers.NextDouble()*[Math]::PI*2; $length=3+$fibers.NextDouble()*12
  $dx=[Math]::Cos($angle)*$length; $dy=[Math]::Sin($angle)*$length
  $pen=$lightFiber; if(($i%2) -eq 0) { $pen=$darkFiber }
  $g.DrawBezier($pen,[single]$x,[single]$y,[single]($x+$dx*0.3-$dy*0.12),[single]($y+$dy*0.3+$dx*0.12),[single]($x+$dx*0.7),[single]($y+$dy*0.7),[single]($x+$dx),[single]($y+$dy))
}
$lightFiber.Dispose(); $darkFiber.Dispose()
function PhotoText($s,$x,$y,$size,$family) {
  $f=[System.Drawing.Font]::new($family,[single]$size,[System.Drawing.FontStyle]::Regular,[System.Drawing.GraphicsUnit]::Pixel)
  $m=$g.MeasureString($s,$f)
  if($x -lt 0 -or $y -lt 0 -or ($x+$m.Width) -gt 1500 -or ($y+$m.Height) -gt 2300) { throw "Text outside margins: $s" }
  $b=Brush '#F4F0DA'; $g.DrawString($s,$f,$b,[single]$x,[single]$y)
  $b.Dispose(); $f.Dispose()
}
# A transparent seam preserves the filtered photograph beneath the icon.
# Use a path with an excluded seam rather than painting a solid background stroke.
$state=$g.Save(); $g.TranslateTransform([single]78,[single]64); $g.ScaleTransform([single]1.25,[single]1.25)
$p=[System.Drawing.Drawing2D.GraphicsPath]::new()
$p.AddBezier([single]22,[single]79,[single]10,[single]39,[single]39,[single]17,[single]78,[single]21)
$p.AddBezier([single]78,[single]21,[single]90,[single]61,[single]61,[single]83,[single]22,[single]79)
$seam=[System.Drawing.Drawing2D.GraphicsPath]::new()
$seam.AddLine([single]25,[single]76,[single]73,[single]24)
$pen=[System.Drawing.Pen]::new([System.Drawing.Color]::Black,[single]4.2)
$seam.Widen($pen)
$region=[System.Drawing.Region]::new($p); $region.Exclude($seam)
$brush=Brush '#F4F0DA'; $g.FillRegion($brush,$region)
$brush.Dispose(); $region.Dispose(); $pen.Dispose(); $seam.Dispose(); $p.Dispose(); $g.Restore($state)
PhotoText 'Olea' 220 70 90 $outfit
$headline=@('Your agents.','In your hands.')
if(($headline -join ' ') -cne 'Your agents. In your hands.') { throw 'Campaign copy mismatch.' }
PhotoText $headline[0] 95 370 138 $sans
PhotoText $headline[1] 95 532 138 $sans
if($img.Width -ne 1600 -or $img.Height -ne 2400) { throw 'Incorrect poster dimensions.' }
$img.Save((Join-Path $archiveDir 'seed-poster-in-your-hands.png'),[System.Drawing.Imaging.ImageFormat]::Png)
$preview=[System.Drawing.Bitmap]::new(800,1200)
$pg=[System.Drawing.Graphics]::FromImage($preview)
$pg.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$pg.DrawImage($img,[System.Drawing.Rectangle]::new(0,0,800,1200))
$preview.Save((Join-Path $archiveDir 'seed-poster-in-your-hands-preview.png'),[System.Drawing.Imaging.ImageFormat]::Png)
$pg.Dispose(); $preview.Dispose(); $g.Dispose(); $img.Dispose(); $fonts.Dispose()
```

param([string]$Title,[string]$Output)
Add-Type -AssemblyName System.Drawing
Add-Type @'
using System;
using System.Runtime.InteropServices;
using System.Text;
public static class EvidenceWindow {
 [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
 public delegate bool EnumWindowsProc(IntPtr hwnd,IntPtr data);
 [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc proc,IntPtr data);
 [DllImport("user32.dll",CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr hwnd,StringBuilder text,int length);
 [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hwnd,int command);
 [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hwnd);
 [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
 [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr hwnd,IntPtr after,int x,int y,int width,int height,uint flags);
 [StructLayout(LayoutKind.Sequential)] public struct RECT {public int Left,Top,Right,Bottom;}
 [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hwnd,out RECT rect);
}
'@
[void][EvidenceWindow]::SetProcessDPIAware()
$script:matchedWindow=[IntPtr]::Zero
[EvidenceWindow]::EnumWindows({param($handle,$data) $text=[Text.StringBuilder]::new(1024);[void][EvidenceWindow]::GetWindowText($handle,$text,1024);if($text.ToString().Contains($Title)){$script:matchedWindow=$handle;return $false};return $true},[IntPtr]::Zero) | Out-Null
if($script:matchedWindow -eq [IntPtr]::Zero){throw "Evidence window not found: $Title"}
[void][EvidenceWindow]::ShowWindow($script:matchedWindow,9)
[void][EvidenceWindow]::SetWindowPos($script:matchedWindow,[IntPtr]::Zero,40,40,1600,980,0)
[void][EvidenceWindow]::SetForegroundWindow($script:matchedWindow)
Start-Sleep -Milliseconds 800
if([EvidenceWindow]::GetForegroundWindow() -ne $script:matchedWindow){throw 'Own evidence window is not foreground; refusing to capture other content'}
$rectangle=[EvidenceWindow+RECT]::new();[void][EvidenceWindow]::GetWindowRect($script:matchedWindow,[ref]$rectangle)
$bitmap=[Drawing.Bitmap]::new($rectangle.Right-$rectangle.Left,$rectangle.Bottom-$rectangle.Top)
$graphics=[Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen($rectangle.Left,$rectangle.Top,0,0,$bitmap.Size)
$bitmap.Save($Output,[Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose();$bitmap.Dispose()
Write-Host "Captured genuine application window: $Title"

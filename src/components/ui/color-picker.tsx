import { useState, useCallback, memo, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Palette, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  presets?: string[];
  className?: string;
}

// Preset colors based on our theme
const defaultPresets = [
  '262 60% 55%',   // Primary purple
  '38 92% 55%',    // Secondary gold
  '262 70% 65%',   // Accent purple
  '152 69% 45%',   // Success green
  '0 72% 51%',     // Destructive red
  '222 30% 12%',   // Background dark
  '45 100% 96%',   // Foreground light
  '220 14% 65%',   // Muted
];

// HSL to Hex conversion
const hslToHex = (hsl: string): string => {
  if (!hsl) return '#000000';
  
  const parts = hsl.split(' ');
  if (parts.length < 3) return '#000000';
  
  const h = parseFloat(parts[0]) / 360;
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Hex to HSL conversion
const hexToHsl = (hex: string): string => {
  if (!hex || !hex.startsWith('#')) return '0 0% 0%';
  
  let r = 0, g = 0, b = 0;
  
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const ColorPickerComponent = ({
  value = '',
  onChange,
  label,
  presets = defaultPresets,
  className,
}: ColorPickerProps) => {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(50);
  const [lightness, setLightness] = useState(50);
  const [hexInput, setHexInput] = useState('');

  // Parse initial value
  useEffect(() => {
    if (value) {
      const parts = value.split(' ');
      if (parts.length >= 3) {
        setHue(parseFloat(parts[0]) || 0);
        setSaturation(parseFloat(parts[1]) || 50);
        setLightness(parseFloat(parts[2]) || 50);
        setHexInput(hslToHex(value));
      }
    }
  }, [value]);

  const handleSliderChange = useCallback((type: 'h' | 's' | 'l', val: number) => {
    let newH = hue, newS = saturation, newL = lightness;
    
    if (type === 'h') {
      newH = val;
      setHue(val);
    } else if (type === 's') {
      newS = val;
      setSaturation(val);
    } else {
      newL = val;
      setLightness(val);
    }
    
    const hslValue = `${newH} ${newS}% ${newL}%`;
    onChange(hslValue);
    setHexInput(hslToHex(hslValue));
  }, [hue, saturation, lightness, onChange]);

  const handleHexChange = useCallback((hex: string) => {
    setHexInput(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex) || /^#[0-9A-Fa-f]{3}$/.test(hex)) {
      const hsl = hexToHsl(hex);
      onChange(hsl);
      const parts = hsl.split(' ');
      setHue(parseFloat(parts[0]));
      setSaturation(parseFloat(parts[1]));
      setLightness(parseFloat(parts[2]));
    }
  }, [onChange]);

  const handlePresetClick = useCallback((preset: string) => {
    onChange(preset);
    const parts = preset.split(' ');
    setHue(parseFloat(parts[0]));
    setSaturation(parseFloat(parts[1]));
    setLightness(parseFloat(parts[2]));
    setHexInput(hslToHex(preset));
  }, [onChange]);

  const handleReset = useCallback(() => {
    onChange('');
    setHue(0);
    setSaturation(50);
    setLightness(50);
    setHexInput('');
  }, [onChange]);

  const currentColor = value || `${hue} ${saturation}% ${lightness}%`;
  const currentHex = hslToHex(currentColor);

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label className="text-sm font-medium">{label}</Label>}
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-10"
          >
            <div
              className="w-6 h-6 rounded border border-border"
              style={{ backgroundColor: value ? `hsl(${value})` : 'transparent' }}
            />
            <span className="text-sm text-muted-foreground">
              {value ? currentHex : 'Selecionar cor...'}
            </span>
            <Palette className="ml-auto h-4 w-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            {/* Color Preview */}
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded-lg border border-border shadow-inner"
                style={{ backgroundColor: `hsl(${currentColor})` }}
              />
              <div className="flex-1 space-y-1">
                <Input
                  value={hexInput}
                  onChange={(e) => handleHexChange(e.target.value)}
                  placeholder="#000000"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  HSL: {currentColor}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                title="Resetar"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {/* Hue Slider */}
            <div className="space-y-1">
              <Label className="text-xs">Matiz (H): {hue}°</Label>
              <input
                type="range"
                min="0"
                max="360"
                value={hue}
                onChange={(e) => handleSliderChange('h', parseInt(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                }}
              />
            </div>

            {/* Saturation Slider */}
            <div className="space-y-1">
              <Label className="text-xs">Saturação (S): {saturation}%</Label>
              <input
                type="range"
                min="0"
                max="100"
                value={saturation}
                onChange={(e) => handleSliderChange('s', parseInt(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, hsl(${hue} 0% ${lightness}%), hsl(${hue} 100% ${lightness}%))`,
                }}
              />
            </div>

            {/* Lightness Slider */}
            <div className="space-y-1">
              <Label className="text-xs">Luminosidade (L): {lightness}%</Label>
              <input
                type="range"
                min="0"
                max="100"
                value={lightness}
                onChange={(e) => handleSliderChange('l', parseInt(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, hsl(${hue} ${saturation}% 0%), hsl(${hue} ${saturation}% 50%), hsl(${hue} ${saturation}% 100%))`,
                }}
              />
            </div>

            {/* Preset Colors */}
            <div className="space-y-1">
              <Label className="text-xs">Cores do Tema</Label>
              <div className="grid grid-cols-8 gap-1">
                {presets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handlePresetClick(preset)}
                    className={cn(
                      'w-7 h-7 rounded border-2 transition-all hover:scale-110',
                      value === preset ? 'border-primary ring-2 ring-primary/30' : 'border-border'
                    )}
                    style={{ backgroundColor: `hsl(${preset})` }}
                    title={`HSL: ${preset}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export const ColorPicker = memo(ColorPickerComponent);

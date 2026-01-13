import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Upload, Download, Printer } from 'lucide-react';

interface ImageUploaderProps {
  onImageLoad: (image: HTMLImageElement) => void;
}

export function ImageUploader({ onImageLoad }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => onImageLoad(img);
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors bg-[#F8F4E9] ${
          dragActive
            ? 'border-primary bg-primary/10'
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground mb-4">
          拖拽图片到此处，或点击上传
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="default"
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => fileInputRef.current?.click()}
        >
          选择图片
        </Button>
      </div>
    </div>
  );
}

interface ParameterControlsProps {
  gridSize: [number];
  setGridSize: (value: [number]) => void;
  colorCount: [number];
  setColorCount: (value: [number]) => void;
  showSymbols: boolean;
  setShowSymbols: (value: boolean) => void;
  showGridLines: boolean;
  setShowGridLines: (value: boolean) => void;
}

export function ParameterControls({
  gridSize,
  setGridSize,
  colorCount,
  setColorCount,
  showSymbols,
  setShowSymbols,
  showGridLines,
  setShowGridLines,
}: ParameterControlsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="gridSize" className="text-foreground">
          格子大小: {gridSize[0]} x {gridSize[0]}
        </Label>
        <div className="flex items-center gap-2">
          <Slider
            id="gridSize"
            min={10}
            max={100}
            step={5}
            value={gridSize}
            onValueChange={setGridSize}
            className="flex-1"
          />
          <input
            type="number"
            id="gridSizeInput"
            min={10}
            max={100}
            step={5}
            value={gridSize[0]}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              if (!isNaN(value) && value >= 10 && value <= 100) {
                setGridSize([value]);
              }
            }}
            className="w-16 px-2 py-1 border rounded text-sm border-border bg-background text-foreground"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          控制图纸的格子数量，数值越大格子越多
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="colorCount" className="text-foreground">颜色数量: {colorCount[0]}</Label>
        <div className="flex items-center gap-2">
          <Slider
            id="colorCount"
            min={4}
            max={64}
            step={4}
            value={colorCount}
            onValueChange={setColorCount}
            className="flex-1"
          />
          <input
            type="number"
            id="colorCountInput"
            min={4}
            max={64}
            step={4}
            value={colorCount[0]}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              if (!isNaN(value) && value >= 4 && value <= 64) {
                setColorCount([value]);
              }
            }}
            className="w-16 px-2 py-1 border rounded text-sm border-border bg-background text-foreground"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          控制使用的颜色数量，颜色越多细节越丰富
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="showSymbols" className="text-foreground">显示符号</Label>
          <input
            id="showSymbols"
            type="checkbox"
            checked={showSymbols}
            onChange={(e) => setShowSymbols(e.target.checked)}
            className="h-4 w-4 rounded border-border bg-background text-primary"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="showGridLines" className="text-foreground">显示网格线</Label>
          <input
            id="showGridLines"
            type="checkbox"
            checked={showGridLines}
            onChange={(e) => setShowGridLines(e.target.checked)}
            className="h-4 w-4 rounded border-border bg-background text-primary"
          />
        </div>
      </div>
    </div>
  );
}

interface ActionButtonsProps {
  onExport: () => void;
  onPrint: () => void;
  disabled: boolean;
}

export function ActionButtons({ onExport, onPrint, disabled }: ActionButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button onClick={onExport} disabled={disabled} variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1">
        <Download className="mr-2 h-4 w-4" />
        导出图片
      </Button>
      <Button onClick={onPrint} disabled={disabled} variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1">
        <Printer className="mr-2 h-4 w-4" />
        打印图纸
      </Button>
    </div>
  );
}

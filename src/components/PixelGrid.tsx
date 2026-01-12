import { useRef, useEffect } from 'react';
import { RGB } from '@/utils/imageProcessing';

interface PixelGridProps {
  pixels: RGB[][];
  symbolMap: Map<string, string>;
  showSymbols: boolean;
  showGridLines: boolean;
  cellSize?: number;
}

export function PixelGrid({
  pixels,
  symbolMap,
  showSymbols,
  showGridLines,
  cellSize = 20,
}: PixelGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || pixels.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const height = pixels.length;
    const width = pixels[0].length;

    canvas.width = width * cellSize;
    canvas.height = height * cellSize;

    // 清空画布
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制格子
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = pixels[y][x];
        const posX = x * cellSize;
        const posY = y * cellSize;

        // 填充颜色
        ctx.fillStyle = `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`;
        ctx.fillRect(posX, posY, cellSize, cellSize);

        // 绘制网格线
        if (showGridLines) {
          ctx.strokeStyle = '#cccccc';
          ctx.lineWidth = 1;
          ctx.strokeRect(posX, posY, cellSize, cellSize);
        }

        // 绘制符号
        if (showSymbols) {
          const colorKey = `${pixel.r},${pixel.g},${pixel.b}`;
          const symbol = symbolMap.get(colorKey) || '';
          
          ctx.fillStyle = getContrastColor(pixel);
          ctx.font = `${cellSize * 0.6}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(symbol, posX + cellSize / 2, posY + cellSize / 2);
        }
      }
    }
  }, [pixels, symbolMap, showSymbols, showGridLines, cellSize]);

  return (
    <div className="overflow-auto border rounded-lg bg-white">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}

// 获取对比色（黑色或白色）
function getContrastColor(rgb: RGB): string {
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
}

interface ColorPaletteProps {
  symbolMap: Map<string, string>;
}

export function ColorPalette({ symbolMap }: ColorPaletteProps) {
  const colors = Array.from(symbolMap.entries()).map(([colorKey, symbol]) => {
    const [r, g, b] = colorKey.split(',').map(Number);
    return { r, g, b, symbol };
  });

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">颜色图例</h3>
      <div className="grid grid-cols-4 gap-2">
        {colors.map((color, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 p-2 border rounded text-xs"
          >
            <div
              className="w-6 h-6 rounded border"
              style={{ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }}
            />
            <span className="font-mono font-bold">{color.symbol}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        共使用 {colors.length} 种颜色
      </p>
    </div>
  );
}

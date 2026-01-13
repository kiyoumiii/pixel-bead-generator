import { useState, useCallback } from 'react';
import { ImageUploader, ParameterControls, ActionButtons } from './components/ImageControls';
import { PixelGrid, ColorPalette } from './components/PixelGrid';
import {
  resizeImage,
  imageDataToPixels,
  quantizeColors,
  mapPixelsToPalette,
  type RGB,
} from './utils/imageProcessing';

function App() {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [pixelData, setPixelData] = useState<{
    pixels: RGB[][];
    symbolMap: Map<string, string>;
  } | null>(null);
  const [gridSize, setGridSize] = useState<[number]>([30]);
  const [colorCount, setColorCount] = useState<[number]>([16]);
  const [showSymbols, setShowSymbols] = useState(true);
  const [showGridLines, setShowGridLines] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageLoad = useCallback((image: HTMLImageElement) => {
    setOriginalImage(image);
    processImage(image, gridSize[0], colorCount[0]);
  }, [gridSize, colorCount]);

  const processImage = useCallback((image: HTMLImageElement, size: number, colors: number) => {
    setIsProcessing(true);
    
    // 使用 setTimeout 避免阻塞 UI
    setTimeout(() => {
      try {
        // 计算目标尺寸（保持宽高比）
        const aspectRatio = image.width / image.height;
        let targetWidth = size;
        let targetHeight = Math.round(size / aspectRatio);
        
        if (targetHeight > size) {
          targetHeight = size;
          targetWidth = Math.round(size * aspectRatio);
        }

        // 调整图像大小
        const imageData = resizeImage(image, targetWidth, targetHeight);
        
        // 转换为像素矩阵
        const pixels = imageDataToPixels(imageData);
        
        // 颜色量化
        const palette = quantizeColors(pixels, colors);
        
        // 映射到调色板
        const { pixels: mappedPixels, symbolMap } = mapPixelsToPalette(pixels, palette);
        
        setPixelData({ pixels: mappedPixels, symbolMap });
      } catch (error) {
        console.error('图片处理失败:', error);
        alert('图片处理失败，请重试');
      } finally {
        setIsProcessing(false);
      }
    }, 0);
  }, [originalImage, gridSize, colorCount]);

  // 当参数变化时重新处理图片
  const handleGridSizeChange = (value: [number]) => {
    setGridSize(value);
    if (originalImage) {
      processImage(originalImage, value[0], colorCount[0]);
    }
  };

  const handleColorCountChange = (value: [number]) => {
    setColorCount(value);
    if (originalImage) {
      processImage(originalImage, gridSize[0], value[0]);
    }
  };

  const handleExport = () => {
    if (!pixelData) return;
    
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'pixel-bead-pattern.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#D5EAE3' }}>
      <header className="border-b" style={{ backgroundColor: '#775C55' }}>
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>🧩 拼豆图纸生成器</h1>
          <p className="text-sm" style={{ color: 'hsl(var(--foreground))' }}>
            上传图片，生成拼豆、钻石画、十字绣图纸
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 左侧控制面板 */}
          <div className="space-y-6">
            <div className="card bg-[#FDD3D5] border rounded-lg p-6 shadow-sm" style={{ borderColor: 'hsl(var(--border))' }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'hsl(var(--foreground))' }}>上传图片</h2>
              <ImageUploader onImageLoad={handleImageLoad} />
            </div>

            {originalImage && (
              <>
                <div className="card bg-[#FDD3D5] border rounded-lg p-6 shadow-sm" style={{ borderColor: 'hsl(var(--border))' }}>
                  <h2 className="text-lg font-semibold mb-4" style={{ color: 'hsl(var(--foreground))' }}>参数设置</h2>
                  <ParameterControls
                    gridSize={gridSize}
                    setGridSize={handleGridSizeChange}
                    colorCount={colorCount}
                    setColorCount={handleColorCountChange}
                    showSymbols={showSymbols}
                    setShowSymbols={setShowSymbols}
                    showGridLines={showGridLines}
                    setShowGridLines={setShowGridLines}
                  />
                </div>

                <div className="card bg-[#FDD3D5] border rounded-lg p-6 shadow-sm" style={{ borderColor: 'hsl(var(--border))' }}>
                  <h2 className="text-lg font-semibold mb-4" style={{ color: 'hsl(var(--foreground))' }}>操作</h2>
                  <ActionButtons
                    onExport={handleExport}
                    onPrint={handlePrint}
                    disabled={!pixelData || isProcessing}
                  />
                </div>
              </>
            )}
          </div>

          {/* 右侧预览区域 */}
          <div className="lg:col-span-2 space-y-6">
            {isProcessing && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'hsl(var(--primary))' }}></div>
                <p className="mt-2 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>正在处理图片...</p>
              </div>
            )}

            {pixelData && (
              <>
                <div className="card bg-[#FDD3D5] border rounded-lg p-6 shadow-sm" style={{ borderColor: 'hsl(var(--border))' }}>
                  <h2 className="text-lg font-semibold mb-4" style={{ color: 'hsl(var(--foreground))' }}>图纸预览</h2>
                  <PixelGrid
                    pixels={pixelData.pixels}
                    symbolMap={pixelData.symbolMap}
                    showSymbols={showSymbols}
                    showGridLines={showGridLines}
                  />
                </div>

                <div className="card bg-[#FDD3D5] border rounded-lg p-6 shadow-sm" style={{ borderColor: 'hsl(var(--border))' }}>
                  <ColorPalette symbolMap={pixelData.symbolMap} />
                </div>
              </>
            )}

            {!originalImage && !isProcessing && (
              <div className="card bg-[#FDD3D5] border rounded-lg p-12 text-center shadow-sm" style={{ borderColor: 'hsl(var(--border))' }}>
                <p className="text-muted-foreground">
                  请先上传一张图片开始制作
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t mt-12 py-6 text-center" style={{ borderColor: 'hsl(var(--border))' }}>
        <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>拼豆图纸生成器 - 适用于拼豆、钻石画、十字绣等手工艺品制作</p>
      </footer>
    </div>
  );
}

export default App;

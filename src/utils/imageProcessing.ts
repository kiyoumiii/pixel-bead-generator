// 颜色量化接口
export interface ColorPalette {
  colors: RGB[];
  symbolMap: Map<string, string>;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface PixelData {
  width: number;
  height: number;
  pixels: RGB[][];
  colorPalette: ColorPalette;
}

// 将图像调整为指定宽高
export function resizeImage(
  image: HTMLImageElement,
  targetWidth: number,
  targetHeight: number
): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('无法获取 canvas context');
  }
  
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
  return ctx.getImageData(0, 0, targetWidth, targetHeight);
}

// ImageData 转换为像素矩阵
export function imageDataToPixels(imageData: ImageData): RGB[][] {
  const { width, height, data } = imageData;
  const pixels: RGB[][] = [];
  
  for (let y = 0; y < height; y++) {
    const row: RGB[] = [];
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      row.push({
        r: data[i],
        g: data[i + 1],
        b: data[i + 2],
      });
    }
    pixels.push(row);
  }
  
  return pixels;
}

// 计算两个颜色的欧氏距离
export function colorDistance(c1: RGB, c2: RGB): number {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

// 使用 K-Means 算法进行颜色量化
export function quantizeColors(pixels: RGB[][], numColors: number): RGB[] {
  // 提取所有像素颜色
  const allColors = pixels.flat();
  
  // 如果颜色数量大于总颜色数，直接返回所有颜色
  if (numColors >= allColors.length) {
    return [...allColors];
  }
  
  // 使用更稳定的初始化方法
  let centroids: RGB[] = [];
  
  // 使用 K-Means++ 初始化方法
  // 选择第一个中心点
  centroids.push({ ...allColors[Math.floor(Math.random() * allColors.length)] });
  
  // 选择剩余的中心点
  for (let i = 1; i < numColors; i++) {
    // 计算每个颜色到最近中心点的距离
    const distances = allColors.map(color => {
      let minDist = Infinity;
      for (const centroid of centroids) {
        const dist = colorDistance(color, centroid);
        if (dist < minDist) {
          minDist = dist;
        }
      }
      return minDist;
    });
    
    // 根据距离概率选择下一个中心点
    const totalDistance = distances.reduce((sum, dist) => sum + dist, 0);
    const randomValue = Math.random() * totalDistance;
    
    let cumulativeDistance = 0;
    let nextCentroidIndex = 0;
    for (let j = 0; j < distances.length; j++) {
      cumulativeDistance += distances[j];
      if (randomValue <= cumulativeDistance) {
        nextCentroidIndex = j;
        break;
      }
    }
    
    centroids.push({ ...allColors[nextCentroidIndex] });
  }
  
  // K-Means 迭代
  const maxIterations = 20;
  for (let iter = 0; iter < maxIterations; iter++) {
    // 为每个颜色分配最近的中心点
    const clusters: RGB[][] = centroids.map(() => []);
    
    for (const color of allColors) {
      let minDist = Infinity;
      let clusterIdx = 0;
      
      for (let i = 0; i < centroids.length; i++) {
        const dist = colorDistance(color, centroids[i]);
        if (dist < minDist) {
          minDist = dist;
          clusterIdx = i;
        }
      }
      
      clusters[clusterIdx].push(color);
    }
    
    // 更新中心点
    const newCentroids: RGB[] = [];
    for (const cluster of clusters) {
      if (cluster.length === 0) {
        // 如果某个聚类为空，随机选择一个颜色作为中心点
        newCentroids.push({ ...allColors[Math.floor(Math.random() * allColors.length)] });
        continue;
      }
      
      const sumR = cluster.reduce((sum, c) => sum + c.r, 0);
      const sumG = cluster.reduce((sum, c) => sum + c.g, 0);
      const sumB = cluster.reduce((sum, c) => sum + c.b, 0);
      
      newCentroids.push({
        r: Math.round(sumR / cluster.length),
        g: Math.round(sumG / cluster.length),
        b: Math.round(sumB / cluster.length),
      });
    }
    
    // 检查是否收敛
    let converged = true;
    for (let i = 0; i < centroids.length; i++) {
      if (colorDistance(centroids[i], newCentroids[i]) > 1) {
        converged = false;
        break;
      }
    }
    
    centroids = newCentroids;
    if (converged) break;
  }
  
  return centroids;
}

// 将像素映射到调色板颜色
export function mapPixelsToPalette(
  pixels: RGB[][],
  palette: RGB[]
): { pixels: RGB[][]; symbolMap: Map<string, string> } {
  const symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const symbolMap = new Map<string, string>();
  
  // 为调色板中的颜色分配符号
  palette.forEach((color, idx) => {
    const colorKey = `${color.r},${color.g},${color.b}`;
    symbolMap.set(colorKey, symbols[idx % symbols.length]);
  });
  
  // 映射每个像素
  const mappedPixels: RGB[][] = pixels.map(row =>
    row.map(pixel => {
      let minDist = Infinity;
      let closestColor = pixel;
      
      for (const paletteColor of palette) {
        const dist = colorDistance(pixel, paletteColor);
        if (dist < minDist) {
          minDist = dist;
          closestColor = paletteColor;
        }
      }
      
      return closestColor;
    })
  );
  
  return { pixels: mappedPixels, symbolMap };
}

// RGB 转 Hex
export function rgbToHex(rgb: RGB): string {
  return '#' + [rgb.r, rgb.g, rgb.b]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
}

// 图像处理详解
// 运行: node 05-image-processing.js

console.log("=== 图像处理 ===\n");

// ========== 1. 模拟像素操作 ==========
console.log("1. 模拟 ImageData 像素操作\n");

class ImageData {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    // [R, G, B, A, R, G, B, A, ...] 每像素 4 字节
    this.data = new Uint8ClampedArray(width * height * 4);
  }

  // 设置像素颜色
  setPixel(x, y, r, g, b, a = 255) {
    const idx = (y * this.width + x) * 4;
    this.data[idx] = r;
    this.data[idx + 1] = g;
    this.data[idx + 2] = b;
    this.data[idx + 3] = a;
  }

  // 获取像素颜色
  getPixel(x, y) {
    const idx = (y * this.width + x) * 4;
    return {
      r: this.data[idx],
      g: this.data[idx + 1],
      b: this.data[idx + 2],
      a: this.data[idx + 3],
    };
  }

  // 克隆
  clone() {
    const copy = new ImageData(this.width, this.height);
    copy.data.set(this.data);
    return copy;
  }
}

// 创建测试图像 (渐变)
const img = new ImageData(8, 4);
for (let y = 0; y < img.height; y++) {
  for (let x = 0; x < img.width; x++) {
    const r = Math.round((x / img.width) * 255);
    const g = Math.round((y / img.height) * 255);
    img.setPixel(x, y, r, g, 128);
  }
}

console.log(`  图像: ${img.width}x${img.height}, ${img.data.length} 字节`);
console.log(`  像素(0,0): ${JSON.stringify(img.getPixel(0, 0))}`);
console.log(`  像素(7,3): ${JSON.stringify(img.getPixel(7, 3))}`);

// ========== 2. 滤镜效果 ==========
console.log("\n2. 图像滤镜\n");

class ImageFilter {
  // 灰度化
  static grayscale(imageData) {
    const result = imageData.clone();
    for (let i = 0; i < result.data.length; i += 4) {
      const gray = Math.round(
        result.data[i] * 0.299 +
        result.data[i + 1] * 0.587 +
        result.data[i + 2] * 0.114
      );
      result.data[i] = result.data[i + 1] = result.data[i + 2] = gray;
    }
    return result;
  }

  // 反色
  static invert(imageData) {
    const result = imageData.clone();
    for (let i = 0; i < result.data.length; i += 4) {
      result.data[i] = 255 - result.data[i];
      result.data[i + 1] = 255 - result.data[i + 1];
      result.data[i + 2] = 255 - result.data[i + 2];
    }
    return result;
  }

  // 亮度调整
  static brightness(imageData, factor) {
    const result = imageData.clone();
    for (let i = 0; i < result.data.length; i += 4) {
      result.data[i] = Math.min(255, result.data[i] * factor);
      result.data[i + 1] = Math.min(255, result.data[i + 1] * factor);
      result.data[i + 2] = Math.min(255, result.data[i + 2] * factor);
    }
    return result;
  }

  // 对比度
  static contrast(imageData, factor) {
    const result = imageData.clone();
    const intercept = 128 * (1 - factor);
    for (let i = 0; i < result.data.length; i += 4) {
      result.data[i] = Math.max(0, Math.min(255, result.data[i] * factor + intercept));
      result.data[i + 1] = Math.max(0, Math.min(255, result.data[i + 1] * factor + intercept));
      result.data[i + 2] = Math.max(0, Math.min(255, result.data[i + 2] * factor + intercept));
    }
    return result;
  }

  // 模糊 (3x3 均值)
  static blur(imageData) {
    const result = imageData.clone();
    const { width, height } = imageData;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let r = 0, g = 0, b = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const pixel = imageData.getPixel(x + dx, y + dy);
            r += pixel.r; g += pixel.g; b += pixel.b;
          }
        }
        result.setPixel(x, y, Math.round(r / 9), Math.round(g / 9), Math.round(b / 9));
      }
    }
    return result;
  }
}

// 应用滤镜
const gray = ImageFilter.grayscale(img);
console.log(`  灰度化 (0,0): ${JSON.stringify(gray.getPixel(0, 0))}`);

const inverted = ImageFilter.invert(img);
console.log(`  反色   (0,0): ${JSON.stringify(inverted.getPixel(0, 0))}`);

const bright = ImageFilter.brightness(img, 1.5);
console.log(`  亮度x1.5 (0,0): ${JSON.stringify(bright.getPixel(0, 0))}`);

const blurred = ImageFilter.blur(img);
console.log(`  模糊   (1,1): ${JSON.stringify(blurred.getPixel(1, 1))}`);

// ========== 3. 卷积核 ==========
console.log("\n3. 卷积核 (Convolution)\n");
console.log(`
  常见卷积核:

  模糊 (Box Blur):          锐化:
  ┌───┬───┬───┐            ┌────┬────┬────┐
  │1/9│1/9│1/9│            │ 0  │ -1 │  0 │
  ├───┼───┼───┤            ├────┼────┼────┤
  │1/9│1/9│1/9│            │ -1 │  5 │ -1 │
  ├───┼───┼───┤            ├────┼────┼────┤
  │1/9│1/9│1/9│            │ 0  │ -1 │  0 │
  └───┴───┴───┘            └────┴────┴────┘

  边缘检测 (Sobel X):       浮雕:
  ┌────┬───┬───┐            ┌────┬────┬───┐
  │ -1 │ 0 │ 1 │            │ -2 │ -1 │ 0 │
  ├────┼───┼───┤            ├────┼────┼───┤
  │ -2 │ 0 │ 2 │            │ -1 │  1 │ 1 │
  ├────┼───┼───┤            ├────┼────┼───┤
  │ -1 │ 0 │ 1 │            │  0 │  1 │ 2 │
  └────┴───┴───┘            └────┴────┴───┘
`);

// ========== 4. Canvas 图像操作 ==========
console.log("4. Canvas 图像操作 API\n");
console.log(`
  // 加载图片到 Canvas
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0);

    // 获取像素
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // 应用滤镜
    for (let i = 0; i < imageData.data.length; i += 4) {
      const gray = imageData.data[i] * 0.3 +
                   imageData.data[i+1] * 0.59 +
                   imageData.data[i+2] * 0.11;
      imageData.data[i] = imageData.data[i+1] = imageData.data[i+2] = gray;
    }

    // 写回
    ctx.putImageData(imageData, 0, 0);

    // 导出
    const dataURL = canvas.toDataURL('image/png');
    canvas.toBlob(blob => { /* 下载或上传 */ }, 'image/jpeg', 0.8);
  };
  img.src = 'photo.jpg';
`);

console.log("=== 图像处理完成 ===");

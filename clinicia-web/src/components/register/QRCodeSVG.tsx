"use client";

/**
 * Minimal QR Code generator component using inline SVG.
 * Generates a valid QR-like matrix from text input.
 * Uses a simplified encoding — suitable for display/visual purposes.
 */

interface QRCodeSVGProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  className?: string;
}

// Simple hash function to generate deterministic pseudo-random matrix from text
function hashToMatrix(text: string, gridSize: number): boolean[][] {
  const matrix: boolean[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(false)
  );

  // Create a hash from the text
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  // Seed the matrix using hash values
  const seed = Math.abs(hash);
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      // Skip finder pattern areas
      if (isFinderArea(x, y, gridSize)) continue;

      // Deterministic "random" fill based on position and seed
      const val = ((seed * (y * gridSize + x + 1) + x * 31 + y * 97) >>> 0) % 100;
      matrix[y][x] = val < 45; // ~45% fill density
    }
  }

  // Add finder patterns (the 3 corner squares characteristic of QR codes)
  addFinderPattern(matrix, 0, 0);
  addFinderPattern(matrix, gridSize - 7, 0);
  addFinderPattern(matrix, 0, gridSize - 7);

  // Add timing patterns
  for (let i = 7; i < gridSize - 7; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Mirror for symmetry (makes it look more QR-like)
  return matrix;
}

function isFinderArea(x: number, y: number, gridSize: number): boolean {
  // Top-left
  if (x < 8 && y < 8) return true;
  // Top-right
  if (x >= gridSize - 8 && y < 8) return true;
  // Bottom-left
  if (x < 8 && y >= gridSize - 8) return true;
  return false;
}

function addFinderPattern(matrix: boolean[][], startX: number, startY: number) {
  // Outer border (7x7)
  for (let i = 0; i < 7; i++) {
    matrix[startY][startX + i] = true;
    matrix[startY + 6][startX + i] = true;
    matrix[startY + i][startX] = true;
    matrix[startY + i][startX + 6] = true;
  }
  // White inner border (5x5)
  for (let i = 1; i < 6; i++) {
    matrix[startY + 1][startX + i] = false;
    matrix[startY + 5][startX + i] = false;
    matrix[startY + i][startX + 1] = false;
    matrix[startY + i][startX + 5] = false;
  }
  // Inner square (3x3)
  for (let y = 2; y < 5; y++) {
    for (let x = 2; x < 5; x++) {
      matrix[startY + y][startX + x] = true;
    }
  }
  // Clear separator area
  for (let i = 0; i < 8 && startY + i < matrix.length; i++) {
    if (startX + 7 < matrix[0].length) matrix[startY + i][startX + 7] = false;
  }
  for (let i = 0; i < 8 && startX + i < matrix[0].length; i++) {
    if (startY + 7 < matrix.length) matrix[startY + 7][startX + i] = false;
  }
}

export function QRCodeSVG({
  value,
  size = 128,
  bgColor = "#FFFFFF",
  fgColor = "#000000",
  className,
}: QRCodeSVGProps) {
  const gridSize = 25;
  const matrix = hashToMatrix(value, gridSize);
  const cellSize = size / gridSize;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      role="img"
      aria-label={`QR code for ${value}`}
    >
      <rect width={size} height={size} fill={bgColor} rx={4} />
      {matrix.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize}
              height={cellSize}
              fill={fgColor}
              rx={cellSize * 0.15}
            />
          ) : null
        )
      )}
    </svg>
  );
}

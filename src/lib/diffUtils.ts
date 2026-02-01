export interface DiffLine {
  type: 'add' | 'remove' | 'same'
  content: string
  lineNumber: number | null
  newLineNumber: number | null
}

export function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')

  // Simple LCS-based diff
  const m = oldLines.length
  const n = newLines.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack to build diff
  const result: DiffLine[] = []
  let i = m
  let j = n

  const stack: DiffLine[] = []
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      stack.push({ type: 'same', content: oldLines[i - 1], lineNumber: i, newLineNumber: j })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({ type: 'add', content: newLines[j - 1], lineNumber: null, newLineNumber: j })
      j--
    } else {
      stack.push({ type: 'remove', content: oldLines[i - 1], lineNumber: i, newLineNumber: null })
      i--
    }
  }

  while (stack.length > 0) {
    result.push(stack.pop()!)
  }

  return result
}

export function countChanges(diff: DiffLine[]): { additions: number; deletions: number } {
  let additions = 0
  let deletions = 0
  for (const line of diff) {
    if (line.type === 'add') additions++
    if (line.type === 'remove') deletions++
  }
  return { additions, deletions }
}

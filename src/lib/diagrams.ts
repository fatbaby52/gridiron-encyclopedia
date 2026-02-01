import fs from 'fs'
import path from 'path'
import type { PlayDiagram } from '@/types'

const DIAGRAMS_DIR = path.join(process.cwd(), 'src', 'content', 'diagrams')

export function getDiagramById(id: string): PlayDiagram | null {
  const filePath = path.join(DIAGRAMS_DIR, `${id}.json`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as PlayDiagram
}

export function getAllDiagrams(): PlayDiagram[] {
  if (!fs.existsSync(DIAGRAMS_DIR)) return []
  return fs
    .readdirSync(DIAGRAMS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(DIAGRAMS_DIR, f), 'utf-8')
      return JSON.parse(raw) as PlayDiagram
    })
}

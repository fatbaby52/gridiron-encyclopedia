import type { Metadata } from 'next'
import { PlayDesigner } from '@/components/designer/PlayDesigner'

export const metadata: Metadata = {
  title: 'Play Designer',
  description:
    'Create custom football plays with our drag-and-drop play designer. Draw routes, set formations, and export your plays.',
  alternates: { canonical: '/designer' },
}

export default function DesignerPage() {
  return <PlayDesigner />
}

import type { Metadata } from 'next'
import { PlayDesigner } from '@/components/designer/PlayDesigner'
import { SITE_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: `Play Designer | ${SITE_NAME}`,
  description:
    'Create custom football plays with our drag-and-drop play designer. Draw routes, set formations, and export your plays.',
}

export default function DesignerPage() {
  return <PlayDesigner />
}

import { jsPDF } from 'jspdf'
import fs from 'fs'
import path from 'path'

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'downloads')
const MARGIN = 20
const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN

// ---------------------------------------------------------------------------
// Color palette
// ---------------------------------------------------------------------------
const COLORS = {
  grassDark: [45, 90, 39],
  grass: [74, 124, 66],
  gold: [201, 162, 39],
  fieldGreen: [61, 107, 53],
  white: [255, 255, 255],
  black: [33, 33, 33],
  gray: [120, 120, 120],
  lightGray: [220, 220, 220],
  chalk: [245, 245, 240],
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

let currentPageCount = 0

function addCoverPage(doc, title, subtitle) {
  currentPageCount = 1

  // Full-page background
  doc.setFillColor(...COLORS.grassDark)
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F')

  // Decorative gold line across top
  doc.setDrawColor(...COLORS.gold)
  doc.setLineWidth(1.5)
  doc.line(MARGIN, 45, PAGE_WIDTH - MARGIN, 45)

  // Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.setTextColor(...COLORS.gold)
  const titleLines = doc.splitTextToSize(title, CONTENT_WIDTH)
  doc.text(titleLines, PAGE_WIDTH / 2, 120, { align: 'center' })

  // Subtitle
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(14)
  doc.setTextColor(...COLORS.white)
  doc.text(subtitle, PAGE_WIDTH / 2, 140, { align: 'center' })

  // Decorative gold line below subtitle
  doc.setDrawColor(...COLORS.gold)
  doc.setLineWidth(0.75)
  doc.line(MARGIN + 30, 150, PAGE_WIDTH - MARGIN - 30, 150)

  // Branding footer
  doc.setFontSize(11)
  doc.setTextColor(...COLORS.chalk)
  doc.text('Gridiron Encyclopedia', PAGE_WIDTH / 2, PAGE_HEIGHT - 35, { align: 'center' })
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.gray)
  doc.text('gridiron-encyclopedia.netlify.app', PAGE_WIDTH / 2, PAGE_HEIGHT - 27, { align: 'center' })

  // Bottom gold accent
  doc.setDrawColor(...COLORS.gold)
  doc.setLineWidth(1.5)
  doc.line(MARGIN, PAGE_HEIGHT - 20, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 20)
}

function addSectionHeader(doc, y, title) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...COLORS.grassDark)
  doc.text(title, MARGIN, y)
  // Gold underline bar
  doc.setFillColor(...COLORS.gold)
  doc.rect(MARGIN, y + 1.5, CONTENT_WIDTH, 1, 'F')
  return y + 8
}

function addParagraph(doc, y, text, maxWidth) {
  const w = maxWidth || CONTENT_WIDTH
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...COLORS.gray)
  const lines = doc.splitTextToSize(text, w)
  doc.text(lines, MARGIN, y)
  return y + lines.length * 4.5 + 3
}

// ---------------------------------------------------------------------------
// Standard formation presets (x, y in 0-100 normalized coords)
// y=53 is LOS for players on the line, y increases toward backfield
// ---------------------------------------------------------------------------
const F = {
  SHOTGUN_2x2: [
    {l:'X',x:8,y:53},{l:'H',x:25,y:53},
    {l:'LT',x:35,y:53},{l:'LG',x:42,y:53},{l:'C',x:50,y:53},{l:'RG',x:58,y:53},{l:'RT',x:65,y:53},
    {l:'Y',x:75,y:53},{l:'Z',x:92,y:53},
    {l:'QB',x:50,y:65},{l:'RB',x:56,y:72},
  ],
  SHOTGUN_TRIPS: [
    {l:'X',x:8,y:53},
    {l:'LT',x:35,y:53},{l:'LG',x:42,y:53},{l:'C',x:50,y:53},{l:'RG',x:58,y:53},{l:'RT',x:65,y:53},
    {l:'H',x:75,y:53},{l:'Y',x:82,y:50},{l:'Z',x:92,y:53},
    {l:'QB',x:50,y:65},{l:'RB',x:44,y:72},
  ],
  PISTOL: [
    {l:'X',x:8,y:53},{l:'H',x:25,y:53},
    {l:'LT',x:35,y:53},{l:'LG',x:42,y:53},{l:'C',x:50,y:53},{l:'RG',x:58,y:53},{l:'RT',x:65,y:53},
    {l:'Y',x:75,y:53},{l:'Z',x:92,y:53},
    {l:'QB',x:50,y:61},{l:'RB',x:50,y:72},
  ],
  WING_T: [
    {l:'SE',x:8,y:53},
    {l:'LT',x:35,y:53},{l:'LG',x:42,y:53},{l:'C',x:50,y:53},{l:'RG',x:58,y:53},{l:'RT',x:65,y:53},
    {l:'TE',x:72,y:53},
    {l:'WB',x:69,y:60},{l:'FB',x:50,y:63},{l:'HB',x:40,y:67},
    {l:'QB',x:50,y:56},
  ],
  DEF_43: [
    {l:'DE',x:32,y:50},{l:'DT',x:44,y:50},{l:'DT',x:56,y:50},{l:'DE',x:68,y:50},
    {l:'S',x:28,y:42},{l:'M',x:50,y:42},{l:'W',x:64,y:42},
    {l:'CB',x:10,y:38},{l:'CB',x:90,y:38},
    {l:'SS',x:68,y:30},{l:'FS',x:38,y:28},
  ],
  DEF_34: [
    {l:'NT',x:50,y:50},{l:'DE',x:36,y:50},{l:'DE',x:64,y:50},
    {l:'J',x:25,y:48},{l:'B',x:75,y:48},
    {l:'M',x:44,y:42},{l:'W',x:56,y:42},
    {l:'CB',x:10,y:38},{l:'CB',x:90,y:38},
    {l:'SS',x:68,y:30},{l:'FS',x:38,y:28},
  ],
  KICK: [
    {l:'K',x:50,y:80},
    {l:'L1',x:35,y:72},{l:'L2',x:42,y:72},{l:'L3',x:48,y:72},{l:'L4',x:52,y:72},{l:'L5',x:58,y:72},{l:'L6',x:65,y:72},
    {l:'R1',x:20,y:68},{l:'R2',x:38,y:68},{l:'R3',x:62,y:68},{l:'R4',x:80,y:68},
  ],
  PUNT: [
    {l:'C',x:50,y:53},{l:'LG',x:42,y:53},{l:'RG',x:58,y:53},{l:'LT',x:35,y:53},{l:'RT',x:65,y:53},
    {l:'LW',x:28,y:53},{l:'RW',x:72,y:53},
    {l:'PP',x:42,y:60},{l:'UP',x:58,y:60},
    {l:'GL',x:20,y:57},{l:'P',x:50,y:72},
  ],
}

function addPlayDiagram(doc, y, playName, players, routes, blocks, notes) {
  const boxW = CONTENT_WIDTH
  const boxH = 65

  // Field rectangle
  doc.setFillColor(...COLORS.fieldGreen)
  doc.setDrawColor(...COLORS.grass)
  doc.setLineWidth(0.5)
  doc.rect(MARGIN, y, boxW, boxH, 'FD')

  // Subtle yard lines
  doc.setDrawColor(80, 130, 72)
  doc.setLineWidth(0.2)
  for (let i = 1; i < 5; i++) {
    const ly = y + (boxH / 5) * i
    doc.line(MARGIN + 2, ly, MARGIN + boxW - 2, ly)
  }

  // LOS — gold dashed line at ~53% of box height
  const losY = y + boxH * 0.53
  doc.setDrawColor(...COLORS.gold)
  doc.setLineWidth(0.7)
  for (let lx = MARGIN + 3; lx < MARGIN + boxW - 3; lx += 5) {
    doc.line(lx, losY, Math.min(lx + 2.5, MARGIN + boxW - 3), losY)
  }

  // Helper: convert normalized (0-100) coords to page coords
  const px = (nx) => MARGIN + (nx / 100) * boxW
  const py = (ny) => y + (ny / 100) * boxH

  // Draw blocking assignments first (behind everything)
  if (blocks && blocks.length > 0) {
    doc.setDrawColor(...COLORS.gold)
    doc.setLineWidth(1.2)
    for (const blk of blocks) {
      if (blk.length >= 2) {
        const [x1, y1] = [px(blk[0][0]), py(blk[0][1])]
        const [x2, y2] = [px(blk[1][0]), py(blk[1][1])]
        doc.line(x1, y1, x2, y2)
        // block terminator — short perpendicular line
        const dx = x2 - x1, dy = y2 - y1
        const len = Math.sqrt(dx * dx + dy * dy) || 1
        const nx = -dy / len * 1.5, ny = dx / len * 1.5
        doc.line(x2 - nx, y2 - ny, x2 + nx, y2 + ny)
      }
    }
  }

  // Draw routes
  if (routes && routes.length > 0) {
    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(0.7)
    for (const route of routes) {
      if (route.length < 2) continue
      for (let i = 0; i < route.length - 1; i++) {
        doc.line(px(route[i][0]), py(route[i][1]), px(route[i + 1][0]), py(route[i + 1][1]))
      }
      // Arrowhead at end
      const last = route[route.length - 1]
      const prev = route[route.length - 2]
      const ex = px(last[0]), ey = py(last[1])
      const sx = px(prev[0]), sy = py(prev[1])
      const dx = ex - sx, dy = ey - sy
      const len = Math.sqrt(dx * dx + dy * dy) || 1
      const ux = dx / len, uy = dy / len
      const aw = 1.8 // arrow width
      const al = 2.5 // arrow length
      doc.setFillColor(255, 255, 255)
      doc.triangle(
        ex, ey,
        ex - ux * al + uy * aw, ey - uy * al - ux * aw,
        ex - ux * al - uy * aw, ey - uy * al + ux * aw,
        'F'
      )
    }
  }

  // Draw players as circles with labels
  const playerR = 3.5
  for (const p of players) {
    const cx = px(p.l === undefined ? p.x : p.x)
    const cy = py(p.y)
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(...COLORS.grassDark)
    doc.setLineWidth(0.5)
    doc.circle(cx, cy, playerR, 'FD')
    // Label inside circle
    const label = p.l || ''
    const fontSize = label.length > 2 ? 5 : label.length > 1 ? 5.5 : 7
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(fontSize)
    doc.setTextColor(...COLORS.grassDark)
    doc.text(label, cx, cy + fontSize * 0.16, { align: 'center' })
  }

  // Play name below diagram
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.gold)
  doc.text(playName, MARGIN + boxW / 2, y + boxH + 5, { align: 'center' })

  let newY = y + boxH + 9

  // Notes as bullet points below
  if (notes && notes.length > 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.black)
    notes.forEach((note) => {
      const wrapped = doc.splitTextToSize('\u2022 ' + note, CONTENT_WIDTH - 5)
      doc.text(wrapped, MARGIN + 3, newY)
      newY += wrapped.length * 4 + 1.5
    })
  }

  return newY + 3
}

function addWorkoutTable(doc, y, dayLabel, exercises) {
  const colWidths = { exercise: 50, setsReps: 25, target: 22, actualWeight: 25, repsDone: 22, notes: 26 }
  const totalW = colWidths.exercise + colWidths.setsReps + colWidths.target + colWidths.actualWeight + colWidths.repsDone + colWidths.notes
  const rowH = 7
  const headerH = 7

  // Day header row
  doc.setFillColor(...COLORS.grassDark)
  doc.rect(MARGIN, y, totalW, headerH, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...COLORS.white)
  doc.text(dayLabel, MARGIN + 3, y + 5)
  y += headerH

  // Column headers
  doc.setFillColor(...COLORS.chalk)
  doc.rect(MARGIN, y, totalW, headerH, 'F')
  doc.setDrawColor(...COLORS.lightGray)
  doc.setLineWidth(0.3)
  doc.rect(MARGIN, y, totalW, headerH, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...COLORS.black)

  let x = MARGIN
  const headers = ['Exercise', 'Sets x Reps', 'Target', 'Actual Wt', 'Reps Done', 'Notes']
  const widths = [colWidths.exercise, colWidths.setsReps, colWidths.target, colWidths.actualWeight, colWidths.repsDone, colWidths.notes]
  headers.forEach((h, i) => {
    doc.text(h, x + 2, y + 5)
    x += widths[i]
  })
  y += headerH

  // Exercise rows
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)

  exercises.forEach((ex) => {
    doc.setDrawColor(...COLORS.lightGray)
    doc.setLineWidth(0.2)

    x = MARGIN

    // Exercise name cell
    doc.setTextColor(...COLORS.black)
    doc.rect(x, y, colWidths.exercise, rowH, 'S')
    doc.text(ex.name, x + 2, y + 5)
    x += colWidths.exercise

    // Sets x Reps cell
    doc.rect(x, y, colWidths.setsReps, rowH, 'S')
    doc.text(ex.setsReps, x + 2, y + 5)
    x += colWidths.setsReps

    // Target cell
    doc.rect(x, y, colWidths.target, rowH, 'S')
    doc.text(ex.target, x + 2, y + 5)
    x += colWidths.target

    // Actual Weight — EMPTY BOX
    doc.setFillColor(...COLORS.white)
    doc.rect(x, y, colWidths.actualWeight, rowH, 'S')
    x += colWidths.actualWeight

    // Reps Done — EMPTY BOX
    doc.rect(x, y, colWidths.repsDone, rowH, 'S')
    x += colWidths.repsDone

    // Notes — EMPTY BOX
    doc.rect(x, y, colWidths.notes, rowH, 'S')

    y += rowH
  })

  return y + 5
}

function addPageFooter(doc, pageNum) {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.gray)
  doc.text('Page ' + pageNum, PAGE_WIDTH / 2, PAGE_HEIGHT - 10, { align: 'center' })
  doc.text('Gridiron Encyclopedia', PAGE_WIDTH / 2, PAGE_HEIGHT - 6, { align: 'center' })
}

function checkPageBreak(doc, y, needed) {
  if (y + needed > 275) {
    addPageFooter(doc, currentPageCount)
    doc.addPage()
    currentPageCount++
    return MARGIN
  }
  return y
}

function newContentPage(doc) {
  addPageFooter(doc, currentPageCount)
  doc.addPage()
  currentPageCount++
  return MARGIN
}

// ---------------------------------------------------------------------------
// Table of contents helper
// ---------------------------------------------------------------------------
function addTableOfContents(doc, items) {
  let y = MARGIN
  currentPageCount++
  doc.addPage()

  y = addSectionHeader(doc, y + 5, 'Table of Contents')
  y += 4

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)

  items.forEach((item, i) => {
    doc.setTextColor(...COLORS.black)
    doc.text((i + 1) + '.  ' + item, MARGIN + 5, y)
    y += 6
  })

  addPageFooter(doc, currentPageCount)
  return y
}

// ---------------------------------------------------------------------------
// Quick reference / glossary page helper
// ---------------------------------------------------------------------------
function addGlossaryPage(doc, entries) {
  let y = newContentPage(doc)

  y = addSectionHeader(doc, y + 5, 'Quick Reference / Glossary')
  y += 2

  entries.forEach((entry) => {
    y = checkPageBreak(doc, y, 12)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.grassDark)
    doc.text(entry.term, MARGIN + 2, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...COLORS.gray)
    const defLines = doc.splitTextToSize(entry.def, CONTENT_WIDTH - 10)
    doc.text(defLines, MARGIN + 5, y + 4)
    y += 4 + defLines.length * 4 + 2
  })

  addPageFooter(doc, currentPageCount)
}

// ---------------------------------------------------------------------------
// Progress tracking page helper (for workouts)
// ---------------------------------------------------------------------------
function addProgressPage(doc, title, labels) {
  let y = newContentPage(doc)

  y = addSectionHeader(doc, y + 5, title)
  y += 4

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.black)

  const colW = CONTENT_WIDTH / (labels.length + 1)
  const rowH = 8

  // Header row
  doc.setFillColor(...COLORS.chalk)
  doc.rect(MARGIN, y, CONTENT_WIDTH, rowH, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.text('Week', MARGIN + 2, y + 5.5)
  labels.forEach((label, i) => {
    doc.text(label, MARGIN + colW * (i + 1) + 2, y + 5.5)
  })
  y += rowH

  // 8 empty rows
  doc.setFont('helvetica', 'normal')
  for (let r = 1; r <= 8; r++) {
    doc.setDrawColor(...COLORS.lightGray)
    doc.rect(MARGIN, y, CONTENT_WIDTH, rowH, 'S')
    doc.setTextColor(...COLORS.gray)
    doc.text('Wk ' + r, MARGIN + 2, y + 5.5)
    // Draw individual cell borders
    for (let c = 0; c < labels.length; c++) {
      doc.rect(MARGIN + colW * (c + 1), y, colW, rowH, 'S')
    }
    y += rowH
  }

  addPageFooter(doc, currentPageCount)
}

// ===========================================================================
//  PLAYBOOK GENERATORS
// ===========================================================================

// Helper: build a full playbook document
function buildPlaybook(title, subtitle, philosophy, plays, tocItems, glossary) {
  const doc = new jsPDF()
  currentPageCount = 0

  // 1) Cover
  addCoverPage(doc, title, subtitle)

  // 2) Table of contents
  addTableOfContents(doc, tocItems)

  // 3) Philosophy / overview
  let y = newContentPage(doc)
  y = addSectionHeader(doc, y + 5, 'Philosophy & Overview')
  y = addParagraph(doc, y + 2, philosophy)

  // 4) Plays
  plays.forEach((play) => {
    y = checkPageBreak(doc, y, 100)
    if (y === MARGIN) {
      y += 5
    }
    y = addSectionHeader(doc, y, play.name)
    y = addParagraph(doc, y + 1, play.desc)
    y = addPlayDiagram(doc, y, play.name, play.players, play.routes, play.blocks, play.notes)
  })
  addPageFooter(doc, currentPageCount)

  // 5) Glossary
  addGlossaryPage(doc, glossary)

  return doc
}

// ---- 1. Spread Offense Playbook ----
function generateSpreadOffensePlaybook() {
  const philosophy = 'The spread offense is designed to spread the defense horizontally to create favorable matchups across the field. Operating primarily out of 10 and 11 personnel groupings in shotgun and pistol formations, the system relies on tempo-based execution and RPO (run-pass option) integration. By forcing the defense to account for every eligible receiver, the offense consistently isolates defenders in one-on-one situations, opening up run lanes and short-to-intermediate passing windows. This is a rules-based offense: every player reads the same key and reacts accordingly.'

  const plays = [
    {
      name: 'Inside Zone (Shotgun)',
      desc: 'The foundation of the spread run game. The offensive line steps in unison toward the play-side, creating a horizontal push. The running back reads the first down lineman past the center and cuts to daylight. The QB executes a mesh-point ride to hold the backside end.',
      players: [...F.SHOTGUN_2x2],
      routes: [
        [[56,72],[48,58],[45,45]],
      ],
      blocks: [
        [[35,53],[32,48]], [[42,53],[39,48]], [[50,53],[47,48]], [[58,53],[55,48]], [[65,53],[62,48]],
      ],
      notes: ['OL: Zone step play-side, combo to LB level.', 'RB: Aiming point is play-side A-gap; read the first DL past center.', 'QB: Ride the mesh, pull on "give" read, hand off on "keep" read.', 'Backside WR: Stalk block or run bubble route as RPO tag.'],
    },
    {
      name: 'Outside Zone (Pistol)',
      desc: 'A stretch concept that forces the defense to run sideline to sideline. The RB aims for the outside leg of the offensive tackle and reads the first defender to show outside leverage. If the defense over-pursues, the RB cuts back into the vacated lane.',
      players: [...F.PISTOL],
      routes: [
        [[50,72],[70,53],[75,45]],
      ],
      blocks: [
        [[35,53],[38,48]], [[42,53],[45,48]], [[50,53],[53,48]], [[58,53],[61,48]], [[65,53],[68,48]],
      ],
      notes: ['OL: Reach step, sustain blocks to the sideline.', 'RB: Aiming point is OT outside leg; press the edge then cut back.', 'QB: Reverse pivot, hand off deep. Can pull on zone-read tag.', 'Cutback lane is the money — patience is key.'],
    },
    {
      name: 'Zone Read',
      desc: 'The QB reads the backside defensive end after the snap. If the DE crashes down on the RB, the QB keeps and runs off the edge. If the DE stays home or widens, the QB gives to the RB on inside zone. This removes one defender from the box without blocking him.',
      players: [...F.SHOTGUN_2x2],
      routes: [
        [[56,72],[48,53],[45,45]],
        [[50,65],[60,58],[68,50]],
      ],
      blocks: [
        [[35,53],[32,48]], [[42,53],[39,48]], [[50,53],[47,48]], [[58,53],[55,48]], [[65,53],[62,48]],
      ],
      notes: ['QB: Eyes on the backside DE through the mesh.', 'RB: Run inside zone track regardless of give/keep.', 'Backside OT: Skip the DE — he is the read key.', 'If DE squeezes: QB keeps. If DE sits or widens: QB gives.'],
    },
    {
      name: 'Mesh Concept',
      desc: 'Two receivers run shallow crossing routes from opposite sides, creating a natural pick. A third receiver runs a choice or sit route over the top. The QB reads high-to-low: choice route first, then the two crossers underneath. Effective against both man and zone coverage.',
      players: [...F.SHOTGUN_2x2],
      routes: [
        [[25,53],[50,48],[75,45]],
        [[75,53],[50,48],[25,45]],
        [[92,53],[88,40],[85,30]],
        [[8,53],[8,35]],
        [[56,72],[70,68]],
      ],
      blocks: [],
      notes: ['Slot WRs: Cross at 5-6 yards, run full speed through traffic.', 'Outside WR: Sit or choice route at 10-12 yards.', 'QB: High-low read. If choice is covered, find the crosser in the window.', 'Hot route if blitz: throw to the crosser coming toward pressure.'],
    },
    {
      name: 'Spacing Concept',
      desc: 'Five receivers distribute across three levels of the field in the short-to-intermediate range. The spacing stretches zone defenders by placing receivers in every window. The QB works a simple left-to-right or triangle read.',
      players: [...F.SHOTGUN_2x2],
      routes: [
        [[8,53],[15,46]],
        [[25,53],[35,44]],
        [[92,53],[85,46]],
        [[75,53],[82,48],[88,55]],
        [[56,72],[30,65],[15,60]],
      ],
      blocks: [],
      notes: ['Receivers settle in the open windows of zone coverage.', 'QB: Identify the triangle — work high-to-low, inside-to-outside.', 'Against man coverage, receivers create natural separation with spacing.', 'Great answer to heavy blitz packages.'],
    },
    {
      name: 'Four Verticals',
      desc: 'All four wide receivers push vertical, stretching the secondary deep. The running back check-releases into the flat as a safety valve. Designed to attack Cover 2 by splitting the safeties and Cover 3 by overloading the deep thirds.',
      players: [...F.SHOTGUN_2x2],
      routes: [
        [[8,53],[8,20]],
        [[25,53],[30,20]],
        [[75,53],[70,20]],
        [[92,53],[92,20]],
        [[56,72],[70,65]],
      ],
      blocks: [],
      notes: ['Outside WRs: Win vertical on the outside, threaten the deep third.', 'Slot WRs: Push the seam, read safeties — sit if Cover 2, run by if Cover 3.', 'QB: Read the safeties post-snap. Two-high: throw the seam. One-high: throw the post.', 'RB: Block first, release to flat if clean.'],
    },
    {
      name: 'Smash Concept',
      desc: 'A hitch-corner combination that attacks Cover 2 by putting the flat defender in conflict. The outside receiver runs a 5-yard hitch while the slot runs a 12-yard corner route behind the dropping CB. The QB reads the flat defender.',
      players: [...F.SHOTGUN_2x2],
      routes: [
        [[8,53],[12,46]],
        [[25,53],[22,42],[15,32]],
        [[92,53],[88,46]],
        [[75,53],[78,42],[85,32]],
        [[56,72],[56,65]],
      ],
      blocks: [],
      notes: ['Outside WR: Hitch at 5 yards, show your numbers to the QB.', 'Slot WR: Stem inside, break on the corner route at 12 yards.', 'QB: Read the flat defender. If he squats on the hitch, throw the corner.', 'Deadly against Cover 2 shells.'],
    },
    {
      name: 'Bubble RPO',
      desc: 'An inside zone run paired with a bubble screen read. The QB reads the flat defender or overhang player pre-snap and post-snap. If the defender is in the box, throw the bubble. If he is wide, hand off inside zone.',
      players: [...F.SHOTGUN_2x2],
      routes: [
        [[56,72],[48,53],[45,45]],
        [[25,53],[18,53],[12,50]],
      ],
      blocks: [
        [[35,53],[32,48]], [[42,53],[39,48]], [[50,53],[47,48]], [[58,53],[55,48]], [[65,53],[62,48]],
      ],
      notes: ['QB: Pre-snap count box defenders vs. blockers.', 'If box is loaded (6+ in box): throw the bubble.', 'If overhang player is wide: hand off inside zone.', 'Slot WR: Be ready for the quick bubble — catch and get upfield.'],
    },
    {
      name: 'Glance RPO',
      desc: 'An inside zone run combined with a glance route by the slot receiver. The QB reads the linebacker. If the LB steps up to play the run, the QB pulls and throws the glance to the vacated area. If the LB drops, the QB gives the handoff.',
      players: [...F.SHOTGUN_2x2],
      routes: [
        [[56,72],[48,53],[45,45]],
        [[75,53],[68,48]],
      ],
      blocks: [
        [[35,53],[32,48]], [[42,53],[39,48]], [[50,53],[47,48]], [[58,53],[55,48]], [[65,53],[62,48]],
      ],
      notes: ['Slot WR: Run the glance (1-step slant) at the snap.', 'QB: Mesh with RB; eyes on the LB. Pull and throw if LB fills.', 'OL: Block inside zone — do not tip the RPO.', 'Timing must be quick — this is a 1-step throw.'],
    },
    {
      name: 'Tunnel Screen',
      desc: 'A quick perimeter screen designed to get the ball in space. The slot receiver catches a short throw behind the LOS while the outside WR and the pulling lineman create a wall of blockers. Best called against aggressive pass rushes.',
      players: [...F.SHOTGUN_TRIPS],
      routes: [
        [[75,53],[68,55]],
        [[92,53],[85,48]],
        [[82,50],[75,48]],
      ],
      blocks: [
        [[35,53],[42,50]], [[42,53],[50,50]], [[50,53],[58,50]], [[58,53],[65,50]], [[65,53],[72,50]],
      ],
      notes: ['Slot WR: Settle behind the LOS, catch and follow the wall.', 'Outside WR: Block the nearest DB aggressively.', 'OL: Sell pass block for 1 count, then release to screen side.', 'QB: Quick 1-step throw. Ball must come out fast.'],
    },
    {
      name: 'Jailbreak Screen',
      desc: 'A delayed screen to the running back. The OL initially pass sets, allowing defenders upfield, then releases into space as blockers. The RB fakes a block, then leaks to the flat for the catch. Creates a numbers advantage at the second level.',
      players: [...F.SHOTGUN_2x2],
      routes: [
        [[56,72],[56,65],[70,60]],
        [[8,53],[8,30]],
        [[92,53],[92,30]],
      ],
      blocks: [
        [[35,53],[42,50]], [[42,53],[50,50]], [[50,53],[58,50]], [[58,53],[65,50]], [[65,53],[72,50]],
      ],
      notes: ['OL: Pass set for 2 counts, let rush go, then get downfield.', 'RB: Fake blitz pickup, slip to the flat. Expect the ball at the LOS.', 'QB: Sell the deep look, then dump to RB.', 'WRs: Run deep routes to pull DBs out of the screen area.'],
    },
    {
      name: 'Quick Slant-Flat',
      desc: 'A 2-man combination on either side. The outside WR runs a quick slant at 3-5 yards while the slot or RB runs to the flat. The QB reads the flat defender — if he drops, throw the flat; if he drives on the flat, throw the slant behind him.',
      players: [...F.SHOTGUN_2x2],
      routes: [
        [[8,53],[20,45]],
        [[25,53],[15,56]],
        [[92,53],[80,45]],
        [[75,53],[85,56]],
      ],
      blocks: [],
      notes: ['Outside WR: Quick slant, 3 steps and break inside. Catch in stride.', 'Slot/RB: Push to the flat immediately. Be a clear target.', 'QB: Pre-snap identify the flat defender. React to his movement post-snap.', 'Great answer to man and zone blitzes.'],
    },
  ]

  const tocItems = plays.map((p) => p.name)
  tocItems.unshift('Philosophy & Overview')
  tocItems.push('Quick Reference / Glossary')

  const glossary = [
    { term: 'RPO', def: 'Run-Pass Option. A play where the QB can hand off or throw based on a post-snap read of a specific defender.' },
    { term: 'Mesh Point', def: 'The moment when the QB and RB come together for the handoff or keep decision on a zone read.' },
    { term: 'Overhang', def: 'A defender (usually OLB or SS) aligned between the box and the slot receiver, responsible for both run support and short pass coverage.' },
    { term: 'Tempo', def: 'The pace at which the offense operates. Fast tempo prevents defensive substitutions and adjustments.' },
    { term: 'Shotgun', def: 'QB alignment 5-6 yards behind center, receives the ball via a direct snap.' },
    { term: 'Pistol', def: 'QB alignment 3-4 yards behind center with the RB directly behind the QB.' },
    { term: 'Zone Step', def: 'Lateral first step by the OL toward the play-side, initiating zone blocking scheme.' },
    { term: '10 Personnel', def: '1 RB, 0 TEs, 4 WRs on the field.' },
    { term: '11 Personnel', def: '1 RB, 1 TE, 3 WRs on the field.' },
    { term: 'Stalk Block', def: 'A WR blocks a DB at the perimeter, maintaining inside leverage and mirroring the defender.' },
  ]

  return buildPlaybook('HS Spread Offense Playbook', 'A Complete Installation Guide', philosophy, plays, tocItems, glossary)
}

// ---- 2. Wing-T Offense Playbook ----
function generateWingTOffensePlaybook() {
  const philosophy = 'The Wing-T offense is built on the foundation of series football. Every play within a series begins with the same initial action, making it extremely difficult for the defense to diagnose the point of attack before the ball is delivered. Misdirection and pulling linemen create angles at the point of attack, while disciplined ball fakes hold defenders in place. The Wing-T does not require elite athletes — it requires disciplined, well-coached players who execute their assignments with precision. Ball fakes are not optional; they are the lifeblood of this system.'

  const plays = [
    {
      name: 'Buck Sweep',
      desc: 'The bread-and-butter play of the Wing-T. Both guards pull to the play-side. The fullback kicks out the end man on the line of scrimmage, and the halfback takes the handoff around the edge behind a wall of blockers. The center, backside tackle, and backside guard handle backside responsibilities.',
      players: [...F.WING_T],
      routes: [
        [[40,67],[30,60],[22,53],[18,45]],
      ],
      blocks: [
        [[50,63],[35,56]],
        [[42,53],[30,50]],
        [[58,53],[28,48]],
      ],
      notes: ['Both guards pull — lead guard kicks out EMOL, second guard turns up.', 'FB: Fake first, then execute kick-out block on the contain player.', 'HB: Take the handoff, follow the pulling guards, get to the edge.', 'QBs ball fake to the dive back is critical to freeze the LBs.'],
    },
    {
      name: 'Buck Sweep Pass (Waggle)',
      desc: 'A play-action pass off buck sweep action. The QB fakes the buck sweep, then bootlegs to the opposite side. The tight end runs a drag route across the formation, and the split end runs a deep post. This play punishes defenses that over-pursue the buck sweep.',
      players: [...F.WING_T],
      routes: [
        [[50,56],[25,60],[20,56]],
        [[72,53],[50,48],[25,45]],
        [[8,53],[15,40],[25,28]],
        [[69,60],[80,55],[85,50]],
      ],
      blocks: [],
      notes: ['QB: Sell the sweep fake with your eyes and body, then boot.', 'TE: Drag across the formation at 6-8 yards. Be the primary read.', 'SE: Run a post route to clear the deep middle. Secondary read.', 'WB: Release to the flat as the checkdown option.'],
    },
    {
      name: 'Guard Trap',
      desc: 'A quick-hitting interior run through the A-gap. The play-side linemen down block, and the backside guard pulls to trap (kick out) the first defender past the center. The fullback hits the hole fast and downhill. This play is designed to break the will of interior defenders.',
      players: [...F.WING_T],
      routes: [
        [[50,63],[50,53],[50,42]],
      ],
      blocks: [
        [[58,53],[48,50]],
        [[35,53],[35,48]], [[42,53],[42,48]], [[50,53],[50,48]], [[65,53],[65,48]],
      ],
      notes: ['Backside guard: Pull flat, trap the first DT past center.', 'Play-side linemen: Down block — seal everything inside.', 'FB: Fast downhill through the A-gap. No dancing.', 'QB: Quick reverse pivot, hand off deep to the FB.'],
    },
    {
      name: 'Counter Criss-Cross',
      desc: 'The fullback and halfback cross paths behind the QB, creating misdirection chaos. The guard and tackle pull to the play-side to create a wall. The ball carrier gets the handoff going opposite the initial flow, catching the linebackers flowing the wrong direction.',
      players: [...F.WING_T],
      routes: [
        [[40,67],[55,60],[60,53],[62,45]],
        [[50,63],[42,58]],
      ],
      blocks: [
        [[58,53],[62,48]],
        [[72,53],[72,48]],
      ],
      notes: ['FB and HB: Cross behind the QB — sell the misdirection.', 'QB: Open to the first back, fake, then hand to the second back.', 'Pulling guard: Kick out EMOL.', 'Pulling tackle: Turn up inside the kick-out for the LB.'],
    },
    {
      name: 'Waggle Pass',
      desc: 'A play-action bootleg pass off the Wing-T run action. The QB fakes to the backs, then rolls out to the weak side. The tight end drags across the formation as the primary target, the split end runs a deep post, and the wingback releases to the flat as a safety valve.',
      players: [...F.WING_T],
      routes: [
        [[50,56],[30,60],[22,55]],
        [[72,53],[50,47],[28,42]],
        [[8,53],[12,40],[20,28]],
        [[69,60],[78,55]],
      ],
      blocks: [],
      notes: ['QB: Sell the run fake, then boot to the weak side. Eyes downfield.', 'TE: Drag across the formation at 6-8 yards. Be the primary read.', 'SE: Run a post route to clear the deep middle. Secondary read.', 'WB: Release to the flat as the checkdown safety valve.'],
    },
    {
      name: 'Jet Sweep',
      desc: 'A quick-hitting perimeter play using a flanker in jet motion. The motion back takes the handoff from the QB on a direct path to the edge. The wingback and tight end block on the perimeter, creating a lane. The jet sweep forces the defense to widen their alignments.',
      players: [...F.WING_T],
      routes: [
        [[69,60],[50,55],[30,53],[15,48]],
      ],
      blocks: [
        [[35,53],[32,48]], [[42,53],[39,48]], [[50,53],[47,48]], [[58,53],[55,48]], [[65,53],[62,48]],
      ],
      notes: ['Motion WR: Full speed through the mesh — no slowing down.', 'QB: Catch the snap, extend the ball to the jet motion WR.', 'TE: Block the force player on the edge.', 'Timing the snap with the motion is everything.'],
    },
    {
      name: 'Jet Pass',
      desc: 'A play-action pass that uses the jet motion fake to freeze the defense. The QB fakes the jet handoff, then drops back to throw. The split end runs a go route with the defense pulled up by the jet fake. The WR in motion continues to the flat as a checkdown.',
      players: [...F.WING_T],
      routes: [
        [[69,60],[50,55]],
        [[8,53],[8,35]],
        [[72,53],[65,45],[58,38]],
        [[50,56],[50,60]],
      ],
      blocks: [],
      notes: ['QB: Sell the jet fake, pull the ball back, drop and throw.', 'SE: Go route — win on the deep ball. The fake creates a window.', 'Jet WR: Continue to the flat as an outlet after the fake.', 'TE: Run a post across the middle. Secondary read.'],
    },
    {
      name: 'Power',
      desc: 'A downhill run play with a lead blocker through the B-gap. The fullback leads through the hole as a kick-out blocker, and the halfback follows behind with a downhill track to the play-side. The backside guard pulls to the play-side to seal the linebacker. Physical, north-south football.',
      players: [...F.WING_T],
      routes: [
        [[40,67],[50,60],[58,53],[60,42]],
      ],
      blocks: [
        [[50,63],[58,56]],
        [[58,53],[60,48]],
        [[35,53],[35,48]], [[42,53],[42,48]], [[50,53],[50,48]], [[65,53],[65,48]], [[72,53],[72,48]],
      ],
      notes: ['FB: Lead block through the hole — kick out the first defender to show.', 'HB: Follow the FB downhill. Read his block and cut accordingly.', 'RG: Pull to the play-side and seal the linebacker.', 'OL: Drive blocks to the play-side — move the line of scrimmage.'],
    },
    {
      name: 'Down G (Belly)',
      desc: 'A misdirection belly play where the fullback dives straight ahead through the A-gap while the QB fakes to the halfback on a sweep path. The backside guard pulls to kick out the first defender at the point of attack. Down blocks from the play-side linemen create the lane.',
      players: [...F.WING_T],
      routes: [
        [[50,63],[50,53],[50,42]],
        [[50,56],[45,60]],
        [[40,67],[35,63]],
      ],
      blocks: [
        [[58,53],[50,48]],
        [[35,53],[35,48]], [[42,53],[42,48]], [[50,53],[50,48]], [[65,53],[65,48]], [[72,53],[72,48]],
      ],
      notes: ['FB: Dive straight ahead through the A-gap. Fast and downhill.', 'QB: Fake to the HB on the sweep path, then hand to the FB.', 'RG: Pull and kick out the first defender past the center.', 'OL: Down block scheme — seal the play-side gaps.'],
    },
  ]

  const tocItems = ['Philosophy & Overview', ...plays.map((p) => p.name), 'Quick Reference / Glossary']

  const glossary = [
    { term: 'Series Football', def: 'A concept where multiple plays share the same initial action, making it difficult for the defense to diagnose the play before commitment.' },
    { term: 'Buck Series', def: 'The primary Wing-T series featuring guard pulls and misdirection, including the sweep, trap, and pass.' },
    { term: 'Jet Series', def: 'Plays that use a receiver in fast horizontal motion across the formation at the snap.' },
    { term: 'EMOL', def: 'End Man On the Line of Scrimmage. The last defender on the line, typically the target of kick-out blocks.' },
    { term: 'Kick-Out Block', def: 'A block where a pulling lineman or back blocks the contain defender outward, creating a lane inside.' },
    { term: 'Down Block', def: 'Blocking toward the inside gap, sealing defenders away from the point of attack.' },
    { term: 'Wingback (WB)', def: 'A back aligned off the TE hip, 1 yard off the LOS. Key blocker and ball carrier in the Wing-T.' },
    { term: 'Counter', def: 'Any play that initially shows flow one direction but attacks the opposite side.' },
    { term: 'Trap Block', def: 'Allowing a defender to cross the LOS unblocked, then kicking him out from the side with a pulling lineman.' },
    { term: 'Waggle', def: 'A bootleg pass off a run fake where the QB rolls out to the opposite side of the fake.' },
  ]

  return buildPlaybook('HS Wing-T Offense Playbook', 'Series-Based Misdirection Offense', philosophy, plays, tocItems, glossary)
}

// ---- 3. 4-3 Defense Playbook ----
function generate43DefensePlaybook() {
  const philosophy = 'The 4-3 defense is the most versatile base defense in football, featuring 4 down linemen, 3 linebackers, and 4 defensive backs. Its strength lies in the ability to present multiple fronts (over, under, even) while maintaining sound run fits and flexible coverage shells. The front four generates consistent pressure, allowing linebackers to flow freely to the ball. The secondary can operate in Cover 1, Cover 2, Cover 3, or quarters to match any offensive formation. Every defender must know their gap responsibility, their coverage assignment, and their run-fit key.'

  // Basic offensive reference players for defensive diagrams
  const offRef = [
    {l:'O',x:42,y:48},{l:'O',x:46,y:48},{l:'O',x:50,y:48},{l:'O',x:54,y:48},{l:'O',x:58,y:48},
    {l:'QB',x:50,y:40},{l:'RB',x:50,y:34},
  ]
  // 4-3 base defensive positions
  const def43 = [
    {l:'DE',x:34,y:56},{l:'DT',x:44,y:56},{l:'DT',x:56,y:56},{l:'DE',x:66,y:56},
    {l:'S',x:28,y:63},{l:'M',x:50,y:63},{l:'W',x:64,y:63},
    {l:'CB',x:10,y:60},{l:'CB',x:90,y:60},
    {l:'SS',x:70,y:72},{l:'FS',x:40,y:72},
  ]

  const plays = [
    {
      name: 'Over Front Alignment',
      desc: 'The strong-side shade alignment places the defensive line strength to the tight end side. The nose aligns in a 1-technique (shade on the center to the strong side), the 3-technique DT is to the strong side, the 5-technique DE is on the strong-side OT, and the weak DE aligns in a 9-technique (wide).',
      players: [
        ...offRef,
        // Over-shifted DL
        {l:'DE',x:30,y:56},{l:'DT',x:42,y:56},{l:'DT',x:54,y:56},{l:'DE',x:66,y:56},
        {l:'S',x:28,y:63},{l:'M',x:50,y:63},{l:'W',x:64,y:63},
        {l:'CB',x:10,y:60},{l:'CB',x:90,y:60},
        {l:'SS',x:70,y:72},{l:'FS',x:40,y:72},
      ],
      routes: [],
      blocks: [
        // Gap assignments for each DL
        [[30,56],[34,52]],  // DE -> C-gap strong
        [[42,56],[44,52]],  // DT -> B-gap strong
        [[54,56],[52,52]],  // DT -> A-gap
        [[66,56],[62,52]],  // DE -> C-gap weak
      ],
      notes: ['1-tech Nose: Control the A-gap to the strong side. 2-gap vs. zone.', '3-tech DT: Penetrate the B-gap. This is your primary pass rusher inside.', '5-tech DE: Set the edge, contain. Squeeze down on runs toward you.', '9-tech DE: Wide alignment. Speed rush and containment.'],
    },
    {
      name: 'Under Front Alignment',
      desc: 'The under front shifts the DL strength to the weak side. The 3-technique moves to the weak side, the nose aligns head-up on the center (0-tech), and the strong DE plays a 5-technique. This front is designed to create confusion about gap responsibilities for the offense.',
      players: [
        ...offRef,
        // Under-shifted DL
        {l:'DE',x:34,y:56},{l:'DT',x:48,y:56},{l:'DT',x:58,y:56},{l:'DE',x:70,y:56},
        {l:'S',x:28,y:63},{l:'M',x:50,y:63},{l:'W',x:64,y:63},
        {l:'CB',x:10,y:60},{l:'CB',x:90,y:60},
        {l:'SS',x:70,y:72},{l:'FS',x:40,y:72},
      ],
      routes: [],
      blocks: [
        // Gap assignments
        [[34,56],[38,52]],  // DE -> B-gap strong
        [[48,56],[48,52]],  // DT(0) -> A-gap
        [[58,56],[56,52]],  // DT(3) -> B-gap weak
        [[70,56],[66,52]],  // DE -> C-gap weak
      ],
      notes: ['0-tech Nose: Two-gap the center. Control both A-gaps.', '3-tech (weak): Penetrate the weak B-gap on pass downs.', '5-tech DE: Play the strong C-gap, set the edge on runs.', 'Shifts allow the defense to present different looks from the same personnel.'],
    },
    {
      name: 'Cover 3 (Base)',
      desc: 'The base coverage shell. Three deep defenders (2 CBs and FS) each cover a deep third of the field. Four underneath defenders (3 LBs and SS) handle the short zones. The free safety is the center-field player. Corners play with outside leverage and funnel receivers inside.',
      players: [
        ...offRef, ...def43,
      ],
      routes: [
        // FS deep middle drop
        [[40,72],[50,88]],
        // CB left deep 1/3
        [[10,60],[15,85]],
        // CB right deep 1/3
        [[90,60],[85,85]],
        // SS rolls to flat
        [[70,72],[78,64]],
        // Sam drops to curl zone
        [[28,63],[22,68]],
        // Mike drops to hook zone
        [[50,63],[50,70]],
        // Will drops to curl zone
        [[64,63],[72,68]],
      ],
      blocks: [],
      notes: ['FS: Align at 12-14 yards. Read the QB, break on the throw. You are the center fielder.', 'CBs: Jam at the line, sink to your deep third. Keep everything in front.', 'SS: Flat responsibility — match any #2 receiver to the flat.', 'LBs: Drop to curl/hook zones. Read QB eyes and break on the ball.'],
    },
    {
      name: 'Cover 1 (Robber)',
      desc: 'Man-free coverage with a twist. The free safety plays a "robber" role in the middle of the field, looking to undercut crossing routes and post routes. Corners play man coverage on the outside WRs, and LBs have man responsibilities on the RB and TE. The SS is man-to-man on the slot.',
      players: [
        ...offRef, ...def43,
      ],
      routes: [
        // FS deep center-field
        [[40,72],[50,92]],
        // CB left man on WR (follow toward receiver area)
        [[10,60],[8,55]],
        // CB right man on WR
        [[90,60],[92,55]],
        // SS man on slot
        [[70,72],[68,62]],
        // Sam man on TE/RB
        [[28,63],[35,55]],
        // Mike man on RB
        [[50,63],[50,55]],
        // Will man on TE
        [[64,63],[58,55]],
      ],
      blocks: [],
      notes: ['FS: Play 10-12 yards deep, read the QB. Jump any crossers or post routes.', 'CBs: Press or off-man technique. Win your matchup on the outside.', 'LBs: Know your man assignment pre-snap. Carry vertical, pass off crossers.', 'The robber technique creates turnovers — the FS must be aggressive.'],
    },
    {
      name: 'Sam Fire',
      desc: 'The strong-side linebacker (Sam) walks up to the line pre-snap and blitzes through the C-gap on the strong side. The corner presses, and the free safety plays over the top. Designed to disrupt strong-side runs and pressure the QB off the edge.',
      players: [
        ...offRef, ...def43,
      ],
      routes: [
        // FS covers deep middle
        [[40,72],[50,90]],
        // CB left deep 1/3
        [[10,60],[15,85]],
        // CB right deep 1/3
        [[90,60],[85,85]],
        // SS fills Sam's vacated zone
        [[70,72],[60,65]],
        // Mike adjusts to strong hook
        [[50,63],[42,68]],
        // Will drops to curl zone
        [[64,63],[70,68]],
      ],
      blocks: [
        // Sam blitz off edge through C-gap
        [[28,63],[26,53]],
      ],
      notes: ['SLB: Walk up pre-snap, attack the C-gap outside the TE.', 'CB (strong): Press coverage. No safety help to your side — play tough.', 'FS: Shift to provide deep help over the strong-side CB.', 'DE (strong): Squeeze inside to create a lane for the SLB.'],
    },
    {
      name: 'Will Blitz',
      desc: 'The weak-side linebacker (Will) blitzes through the A-gap from the weak side. The strong safety rotates down to fill the coverage void left by the blitzing LB. The coverage behind it adjusts accordingly.',
      players: [
        ...offRef, ...def43,
      ],
      routes: [
        // FS shifts to deep middle alone
        [[40,72],[50,90]],
        // CB left deep 1/3
        [[10,60],[15,85]],
        // CB right deep 1/3
        [[90,60],[85,85]],
        // SS rotates down to replace Will
        [[70,72],[64,65]],
        // Mike shifts weak to cover
        [[50,63],[56,68]],
        // Sam drops to curl zone
        [[28,63],[22,68]],
      ],
      blocks: [
        // Will blitzes A-gap
        [[64,63],[52,53]],
      ],
      notes: ['WLB: Time the snap, attack the outside shoulder of the OT.', 'SS: Rotate down to replace the WLBs zone responsibility.', 'FS: Shift to cover the middle of the field alone.', 'CB (weak side): May need to play more aggressive technique.'],
    },
    {
      name: 'Mike Blitz',
      desc: 'The middle linebacker (Mike) blitzes through the A-gap while the defensive end on his side drops into coverage to replace the vacated underneath zone. This is a 3-under, 3-deep fire zone concept that brings 5 rushers while maintaining 6 in coverage.',
      players: [
        ...offRef, ...def43,
      ],
      routes: [
        // FS deep middle
        [[40,72],[50,90]],
        // CB left deep 1/3
        [[10,60],[15,85]],
        // CB right deep 1/3
        [[90,60],[85,85]],
        // DE drops into underneath zone
        [[66,56],[70,65]],
        // Sam drops underneath
        [[28,63],[22,68]],
        // Will drops underneath
        [[64,63],[72,68]],
      ],
      blocks: [
        // Mike blitz A-gap
        [[50,63],[50,53]],
      ],
      notes: ['MLB: Attack the A-gap at the snap. Get there fast.', 'DE (drop side): Drop to the curl/flat zone vacated by the blitzing LB.', '3-deep behind the blitz: FS middle, CBs deep thirds.', 'The key is disguise — do not tip the blitz pre-snap.'],
    },
    {
      name: 'Zone Dog (Simulated Pressure)',
      desc: 'Four rushers come, but they are not the expected four. A defensive lineman drops into coverage while a linebacker replaces him in the rush. The offense sees 4-man pressure but cannot predict which 4 are coming. This confuses pass protection schemes.',
      players: [
        ...offRef, ...def43,
      ],
      routes: [
        // DE drops into flat zone
        [[66,56],[70,65]],
        // Mike drops to hook zone
        [[50,63],[50,70]],
        // Sam drops underneath
        [[28,63],[22,68]],
        // FS deep middle
        [[40,72],[50,90]],
        // CB left deep 1/3
        [[10,60],[15,85]],
        // CB right deep 1/3
        [[90,60],[85,85]],
      ],
      blocks: [
        // Will replaces DE in rush
        [[64,63],[62,53]],
      ],
      notes: ['DE (drop): At the snap, drop into the flat zone. Sell the rush first.', 'WLB: Replace the dropping DE in the pass rush. Attack his gap.', 'The offense cannot slide or combo block effectively against unknown rushers.', 'Excellent on 3rd-and-medium. Confuse the QB reads.'],
    },
    {
      name: 'Run Fit vs Inside Zone',
      desc: 'Gap assignments for all front-seven defenders against an inside zone run. Each defender is responsible for a specific gap, maintaining the integrity of the defensive front. The safeties serve as force and alley players behind the fit.',
      players: [
        ...offRef, ...def43,
      ],
      routes: [],
      blocks: [
        // DE left -> C-gap
        [[34,56],[30,52]],
        // DT left -> B-gap
        [[44,56],[44,52]],
        // DT right -> A-gap
        [[56,56],[52,52]],
        // DE right -> C-gap
        [[66,56],[62,52]],
        // Sam -> D-gap (contain)
        [[28,63],[22,56]],
        // Mike -> A-gap
        [[50,63],[48,56]],
        // Will -> B-gap
        [[64,63],[60,56]],
        // SS -> alley
        [[70,72],[74,64]],
        // FS -> deep middle run support
        [[40,72],[44,64]],
      ],
      notes: ['DE: C-gap responsibility. Squeeze the OT and set the edge.', 'DTs: Control your gap. Do not get driven off the ball.', 'Sam: Force / D-gap. Contain anything bouncing outside.', 'Mike and Will: Fill downhill into their gaps. Read guard pull keys.'],
    },
  ]

  const tocItems = ['Philosophy & Overview', ...plays.map((p) => p.name), 'Quick Reference / Glossary']

  const glossary = [
    { term: 'Over/Under Front', def: 'Variations of the 4-3 alignment that shift the DL strength toward or away from the offensive strength.' },
    { term: '1-Tech / 3-Tech / 5-Tech', def: 'Alignment numbers for DL. 1=shade on center, 3=outside shoulder of guard, 5=outside shoulder of tackle.' },
    { term: 'Fire Zone', def: 'A blitz concept that brings 5+ rushers while playing zone coverage (typically 3-deep, 3-under) behind the pressure.' },
    { term: 'Robber', def: 'A coverage technique where the FS plays in the middle of the field, reading the QB and jumping underneath routes.' },
    { term: 'Two-Gap', def: 'A DL technique where the defender controls the blocker and is responsible for both gaps on either side of them.' },
    { term: 'Contain', def: 'The responsibility of keeping the ball carrier or QB from escaping outside the defensive structure.' },
    { term: 'Press Coverage', def: 'A DB technique where the defender lines up at the LOS and jams the receiver at the snap to disrupt timing.' },
    { term: 'Curl/Flat', def: 'Underneath zone coverage areas. Curl zone is 10-15 yards over the OT, flat zone is near the sideline at 5-8 yards.' },
  ]

  return buildPlaybook('HS 4-3 Defense Playbook', 'Base Defense with Multiple Fronts', philosophy, plays, tocItems, glossary)
}

// ---- 4. 3-4 Defense Playbook ----
function generate34DefensePlaybook() {
  const philosophy = 'The 3-4 defense uses 3 down linemen (a nose tackle and 2 defensive ends), 4 linebackers (2 inside and 2 outside), and 4 defensive backs. Its greatest asset is the ability to disguise who is rushing the passer. The nose tackle two-gaps the center, controlling both A-gaps and freeing the inside linebackers to flow to the ball. Outside linebackers are hybrid players — they can rush, drop into coverage, or play the run on any given snap. The defense thrives on deception: showing one look pre-snap, executing another post-snap.'

  // Basic offensive reference players for defensive diagrams
  const offRef = [
    {l:'O',x:42,y:48},{l:'O',x:46,y:48},{l:'O',x:50,y:48},{l:'O',x:54,y:48},{l:'O',x:58,y:48},
    {l:'QB',x:50,y:40},{l:'RB',x:50,y:34},
  ]
  // 3-4 base defensive positions
  const def34 = [
    {l:'NT',x:50,y:56},{l:'DE',x:38,y:56},{l:'DE',x:62,y:56},
    {l:'J',x:26,y:58},{l:'B',x:74,y:58},
    {l:'M',x:44,y:63},{l:'W',x:56,y:63},
    {l:'CB',x:10,y:60},{l:'CB',x:90,y:60},
    {l:'SS',x:70,y:72},{l:'FS',x:40,y:72},
  ]

  const plays = [
    {
      name: 'Base 3-4 Alignment',
      desc: 'The foundation of the defense. The nose tackle aligns in a 0-technique (head-up on center) and two-gaps. The two defensive ends play 5-techniques (outside shoulder of the offensive tackles). The OLBs align on the edge, and the ILBs stack behind the DL, reading their keys.',
      players: [
        ...offRef, ...def34,
      ],
      routes: [],
      blocks: [
        // Gap responsibility arrows for each front-7 player
        [[50,56],[48,52]],  // NT -> A-gap left
        [[50,56],[52,52]],  // NT -> A-gap right (two-gap)
        [[38,56],[36,52]],  // DE left -> B-gap
        [[62,56],[64,52]],  // DE right -> B-gap
        [[26,58],[28,53]],  // Jack -> C-gap
        [[74,58],[72,53]],  // Buck -> C-gap
      ],
      notes: ['NT: Head-up on the center. Two-gap technique — control the blocker and play both A-gaps.', 'DEs: 5-technique on the OTs. Set the edge and squeeze down on runs.', 'OLBs: Stand up on the edge. Walk up or drop based on the call.', 'ILBs: Stacked behind the DL. Read guards for run/pass keys.'],
    },
    {
      name: 'Two-Gap Technique',
      desc: 'The nose tackle demonstrates two-gap control by engaging the center and playing both A-gaps. The NT controls the blocker with his hands, reads the play flow, and sheds to the ball side. This is the anchor of the 3-4 front — if the NT loses, both A-gaps open.',
      players: [
        ...offRef, ...def34,
      ],
      routes: [],
      blocks: [
        // NT two-gap arrows — both A-gaps emphasized
        [[50,56],[46,51]],  // NT -> left A-gap
        [[50,56],[54,51]],  // NT -> right A-gap
        // DEs hold their gaps
        [[38,56],[36,52]],  // DE left -> B-gap
        [[62,56],[64,52]],  // DE right -> B-gap
      ],
      notes: ['NT: Hands inside the center\'s pads. Lock out, read the flow, shed to the ball.', 'Two-gap NT must not get driven off the ball — anchor is everything.', 'DEs: Hold your gap. The NT controls the middle so you can set edges.', 'ILBs: Free to flow to the ball because the NT occupies the center.'],
    },
    {
      name: 'Cover 2 Zone',
      desc: 'Two deep safeties each cover a deep half of the field. Five defenders handle the underneath zones. The OLBs drop to the flat zones, ILBs handle the curl/hook areas, and the remaining underneath player (often the strong-side DE or a LB) covers the middle.',
      players: [
        ...offRef, ...def34,
      ],
      routes: [
        // SS deep half right
        [[70,72],[75,88]],
        // FS deep half left
        [[40,72],[25,88]],
        // CB left squat/flat
        [[10,60],[14,65]],
        // CB right squat/flat
        [[90,60],[86,65]],
        // Jack drops to flat
        [[26,58],[18,64]],
        // Buck drops to flat
        [[74,58],[82,64]],
        // Mike drops to curl
        [[44,63],[38,69]],
        // Will drops to curl
        [[56,63],[62,69]],
      ],
      blocks: [],
      notes: ['Safeties: Align at 12 yards. Cover your deep half, break downhill on throws.', 'CBs: Squat on short routes. Re-route the #1 receiver, then sink.', 'OLBs: Drop to the flat. Match any receiver who enters your zone.', 'Vulnerable to deep middle throws — need the DL to pressure quickly.'],
    },
    {
      name: 'Cover 3 Sky',
      desc: 'The strong safety rolls down into the flat to become an underneath defender, while the free safety shifts to deep center field. The two corners each play a deep third. This gives the defense an extra defender near the LOS while maintaining three-deep coverage.',
      players: [
        ...offRef, ...def34,
      ],
      routes: [
        // FS deep center field
        [[40,72],[50,90]],
        // CB left deep 1/3
        [[10,60],[15,85]],
        // CB right deep 1/3
        [[90,60],[85,85]],
        // SS rolls down to flat
        [[70,72],[78,63]],
        // Mike drops to curl/hook
        [[44,63],[38,69]],
        // Will drops to curl/hook
        [[56,63],[62,69]],
        // Jack contains
        [[26,58],[22,55]],
      ],
      blocks: [],
      notes: ['SS: Roll down to the flat pre-snap or at the snap. Be aggressive against the run.', 'FS: You are the center fielder. Align at 14 yards, read QB, break on the throw.', 'CBs: Deep third. Keep everything in front of you.', 'This gives you an 8-man box against the run while staying in 3-deep.'],
    },
    {
      name: 'Cover 4 (Quarters)',
      desc: 'All four defensive backs drop to a deep quarter of the field. Each safety and corner is responsible for one vertical quarter. The linebackers handle all underneath zones. This is a conservative coverage that takes away deep shots and is effective against 4-vertical concepts.',
      players: [
        ...offRef, ...def34,
      ],
      routes: [
        // CB left deep quarter (far left)
        [[10,60],[10,88]],
        // FS deep quarter (left-center)
        [[40,72],[30,88]],
        // SS deep quarter (right-center)
        [[70,72],[70,88]],
        // CB right deep quarter (far right)
        [[90,60],[90,88]],
        // Jack underneath zone
        [[26,58],[20,65]],
        // Buck underneath zone
        [[74,58],[80,65]],
        // Mike hook zone
        [[44,63],[44,70]],
        // Will hook zone
        [[56,63],[56,70]],
      ],
      blocks: [],
      notes: ['CBs: Align at 7-8 yards. Bail to your deep quarter at the snap.', 'Safeties: Read #2 receiver to your side. If vertical, carry him. If not, look to help.', 'LBs: Wall off underneath routes. You have no deep help in the middle — rally to the ball.', 'Excellent against 4 verticals and deep passing concepts.'],
    },
    {
      name: 'OLB Edge Rush',
      desc: 'Both outside linebackers rush off the edge at the snap, turning the 3-4 front into a simulated 5-man pressure look. The DL occupies blockers while the speed of the OLBs creates pressure from the outside. Coverage behind it adjusts to 3-under, 3-deep.',
      players: [
        ...offRef, ...def34,
      ],
      routes: [
        // Mike drops to hook/curl
        [[44,63],[38,69]],
        // Will drops to hook/curl
        [[56,63],[62,69]],
        // FS deep middle
        [[40,72],[50,90]],
        // CB left deep 1/3
        [[10,60],[15,85]],
        // CB right deep 1/3
        [[90,60],[85,85]],
      ],
      blocks: [
        // Jack edge rush
        [[26,58],[24,52]],
        // Buck edge rush
        [[74,58],[76,52]],
      ],
      notes: ['OLBs: Attack outside shoulder of the OT. Use speed-to-power or dip-and-rip.', 'ILBs: Both drop to underneath zones — curl/hook areas.', 'DL: Occupy blockers. Do not let the OL slide to help on the edges.', 'This is the base 5-man pressure look. Everyone must know it.'],
    },
    {
      name: 'Double A-Gap Blitz',
      desc: 'Both inside linebackers creep toward the A-gaps before the snap and fire through them at the snap. This creates immediate interior pressure and chaos for the center and guards. The OLBs drop into coverage to maintain zone integrity behind the pressure.',
      players: [
        ...offRef, ...def34,
      ],
      routes: [
        // Jack drops to flat zone
        [[26,58],[18,64]],
        // Buck drops to flat zone
        [[74,58],[82,64]],
        // SS deep half
        [[70,72],[75,88]],
        // FS deep half
        [[40,72],[25,88]],
        // CB left man
        [[10,60],[8,55]],
        // CB right man
        [[90,60],[92,55]],
      ],
      blocks: [
        // Mike fires A-gap left
        [[44,63],[48,53]],
        // Will fires A-gap right
        [[56,63],[52,53]],
      ],
      notes: ['ILBs: Walk up to the LOS pre-snap. Fire through the A-gaps at the snap.', 'NT: Slant to one side to create a lane for one of the ILBs.', 'OLBs: Drop to flat zones. You must cover what the ILBs left behind.', 'This puts extreme pressure on the center — he cannot block both.'],
    },
    {
      name: 'Zone Fire (Fire Zone)',
      desc: 'A fire zone blitz bringing 5 rushers while playing 3-deep, 3-under zone coverage behind the pressure. The Buck OLB and an ILB blitz, the Jack OLB drops into a flat zone, and the secondary rotates to cover the deep thirds. Disguise is everything.',
      players: [
        ...offRef, ...def34,
      ],
      routes: [
        // Jack drops to flat zone
        [[26,58],[18,65]],
        // Mike drops to hook zone
        [[44,63],[44,70]],
        // FS deep middle
        [[40,72],[50,90]],
        // CB left deep 1/3
        [[10,60],[15,85]],
        // CB right deep 1/3
        [[90,60],[85,85]],
        // SS underneath zone (seam/curl)
        [[70,72],[65,66]],
      ],
      blocks: [
        // Buck OLB edge blitz
        [[74,58],[72,52]],
        // Will ILB A-gap blitz
        [[56,63],[54,53]],
      ],
      notes: ['Buck: Attack the edge at the snap. You are the primary pass rusher.', 'Will: Fire through the A-gap. Timing with the snap is critical.', 'Jack: Drop to the flat zone — replace the coverage left by the blitzers.', '3-deep, 3-under behind 5 rushers. The key is disguising who is coming.'],
    },
  ]

  const tocItems = ['Philosophy & Overview', ...plays.map((p) => p.name), 'Quick Reference / Glossary']

  const glossary = [
    { term: 'Two-Gap', def: 'A DL technique where the player controls the offensive lineman and is responsible for the gaps on both sides of the blocker.' },
    { term: 'One-Gap', def: 'A DL technique where the player is responsible for penetrating a single gap.' },
    { term: '0-Tech / 5-Tech', def: '0=head-up on center, 5=outside shoulder of offensive tackle.' },
    { term: 'A-Gap Creeper', def: 'A late-developing blitz through the A-gap, typically by a safety or linebacker showing coverage pre-snap.' },
    { term: 'Simulated Pressure', def: 'Showing more rushers than actually blitzing to confuse the offensive line protection scheme.' },
    { term: 'Stack', def: 'When linebackers align directly behind defensive linemen, hiding their movement until the snap.' },
    { term: 'OLB (Outside LB)', def: 'Hybrid players in the 3-4 who can rush or drop into coverage on any play.' },
    { term: 'Overload', def: 'Bringing more pass rushers to one side than the offense can block from that side.' },
  ]

  return buildPlaybook('HS 3-4 Defense Playbook', 'Versatile Odd-Front Defense', philosophy, plays, tocItems, glossary)
}

// ---- 5. Special Teams Playbook ----
function generateSpecialTeamsPlaybook() {
  const philosophy = 'Special teams is the phase of football that wins close games. A blocked punt, a long kickoff return, or a missed assignment in coverage can swing the outcome of any contest. Every player on every special teams unit must know their lane, their responsibility, and their mentality. Effort and discipline on special teams directly translates to championships. We practice these units with the same intensity and detail as offense and defense. There is no such thing as a "special teams player" — there are only football players who execute their assignments.'

  const plays = [
    {
      name: 'Kickoff Cover (5-Lane)',
      desc: 'The cover team is organized into 5 lanes across the field. Two safeties hang back as the last line of defense. The contain players on each edge force the return inside, while the lane runners squeeze the return to the middle. The wedge buster attacks the return team wedge up the middle.',
      players: [
        {l:'K',x:50,y:80},
        // Cover team spread across the field
        {l:'L5',x:10,y:72},{l:'L4',x:22,y:72},{l:'L3',x:34,y:72},{l:'L2',x:42,y:72},{l:'L1',x:48,y:72},
        {l:'L1',x:52,y:72},{l:'L2',x:58,y:72},{l:'L3',x:66,y:72},{l:'L4',x:78,y:72},{l:'L5',x:90,y:72},
        // Safeties trail
        {l:'S',x:38,y:84},{l:'S',x:62,y:84},
      ],
      routes: [
        // Each cover player runs downfield in their lane
        [[10,72],[10,20]],   // L5 left contain
        [[22,72],[22,20]],   // L4 left
        [[34,72],[34,20]],   // L3 left
        [[42,72],[42,20]],   // L2 left
        [[48,72],[48,20]],   // L1 left
        [[52,72],[52,20]],   // L1 right
        [[58,72],[58,20]],   // L2 right
        [[66,72],[66,20]],   // L3 right
        [[78,72],[78,20]],   // L4 right
        [[90,72],[90,20]],   // L5 right contain
      ],
      blocks: [],
      notes: ['L1 (contain): Force the return inside. Do not get hooked or sealed.', 'L2-L4 (lane runners): Stay in your lane. Squeeze laterally, tackle inside-out.', 'L3 (wedge buster): Attack the wedge. Disrupt the blocking scheme.', 'Safeties: Hang 15 yards behind the front. Clean up anything that breaks through.'],
    },
    {
      name: 'Kickoff Return (Wedge)',
      desc: 'A double-wedge formation at the 30-yard line creates a wall of blockers. The front wedge sets up 5 yards ahead of the rear wedge. The return man catches the kick and hits the seam between the two wedge lines, following the blockers upfield.',
      players: [
        // Return man deep
        {l:'R',x:50,y:15},
        // Back wedge (3 blockers)
        {l:'W',x:42,y:30},{l:'W',x:50,y:30},{l:'W',x:58,y:30},
        // Front wedge (4 blockers)
        {l:'W',x:36,y:38},{l:'W',x:44,y:38},{l:'W',x:56,y:38},{l:'W',x:64,y:38},
        // Front line blockers
        {l:'B',x:20,y:50},{l:'B',x:35,y:50},{l:'B',x:65,y:50},{l:'B',x:80,y:50},
      ],
      routes: [
        // Return man hits the seam upfield
        [[50,15],[50,38],[50,60]],
        // Front wedge pushes upfield
        [[36,38],[36,50]],
        [[44,38],[44,50]],
        [[56,38],[56,50]],
        [[64,38],[64,50]],
      ],
      blocks: [
        // Front line blockers engage cover men
        [[20,50],[20,55]],
        [[35,50],[35,55]],
        [[65,50],[65,55]],
        [[80,50],[80,55]],
      ],
      notes: ['Front wedge: Set up at the 35. Block the first cover man in your lane.', 'Back wedge: Set up at the 30. Seal inside-out, create the crease.', 'Return man: Catch the ball, hit the seam at full speed. Trust the wedge.', 'Front line: Attack cover men aggressively. Do not let them get to your lane.'],
    },
    {
      name: 'Punt Protection (Spread)',
      desc: 'The personal protector reads the defensive alignment and calls the protection. The wings on each side block the edge rushers. The interior linemen step to protect their gaps. The cover team releases after the punt to cover their lanes downfield.',
      players: [
        // Punt formation using F.PUNT positions
        {l:'C',x:50,y:53},{l:'LG',x:42,y:53},{l:'RG',x:58,y:53},{l:'LT',x:35,y:53},{l:'RT',x:65,y:53},
        {l:'LW',x:28,y:53},{l:'RW',x:72,y:53},
        {l:'PP',x:42,y:60},{l:'UP',x:58,y:60},
        {l:'GL',x:20,y:57},
        {l:'P',x:50,y:72},
      ],
      routes: [
        // Cover lanes after punt is away
        [[28,53],[22,20]],   // LW covers left
        [[72,53],[78,20]],   // RW covers right
        [[35,53],[30,20]],   // LT lane
        [[65,53],[70,20]],   // RT lane
        [[42,53],[40,20]],   // LG lane
        [[58,53],[60,20]],   // RG lane
        [[20,57],[12,20]],   // Gunner left
      ],
      blocks: [],
      notes: ['PP: Read the rush. Identify any overloads and adjust protection.', 'Wings: Block the edge rusher. Do not let anyone clean off the edge.', 'Interior OL: Step to your gap, absorb the rush, then release to cover.', 'Punter: Catch, 2 steps, punt. Get the ball off in 2.0 seconds or less.'],
    },
    {
      name: 'Punt Return (Wall Return)',
      desc: 'Four blockers set a wall on the return side of the field. The return man catches the punt and hits the wall at full speed. The wall blockers maintain their blocks and run in front of the return man. The non-wall players hold up gunners and slow the coverage.',
      players: [
        // Return man catches punt deep
        {l:'R',x:50,y:15},
        // Wall blockers on the right side
        {l:'W',x:72,y:30},{l:'W',x:72,y:36},{l:'W',x:72,y:42},{l:'W',x:72,y:48},
        // Jammers at the LOS to slow coverage
        {l:'J',x:20,y:53},{l:'J',x:35,y:53},{l:'J',x:50,y:53},{l:'J',x:65,y:53},{l:'J',x:80,y:53},
        // Extra blocker
        {l:'B',x:60,y:25},
      ],
      routes: [
        // Return man catches and runs to wall
        [[50,15],[65,25],[72,35],[75,55]],
        // Wall blockers maintain their blocks moving upfield
        [[72,30],[75,50]],
        [[72,36],[75,55]],
        [[72,42],[75,60]],
        [[72,48],[75,65]],
      ],
      blocks: [
        // Jammers hold up coverage at the LOS
        [[20,53],[20,50]],
        [[35,53],[35,50]],
        [[50,53],[50,50]],
        [[65,53],[65,50]],
        [[80,53],[80,50]],
      ],
      notes: ['Wall blockers: Set 10 yards from the sideline on the return side. Stay in front.', 'Return man: Catch the punt, get to the wall. Be decisive — hit it at speed.', 'Jammers: Hold up the gunners at the line. Give the wall time to set.', 'The first 10 yards of return determine the success. Quick decisions.'],
    },
    {
      name: 'Punt Block (Overload)',
      desc: 'Overload one side of the punt shield with extra rushers. The edge rusher on the overload side has a clean lane to block the punt. Interior players hold their gaps to prevent a fake. The block point is 5-7 yards in front of the punter.',
      players: [
        // Punt team (opposition)
        {l:'P',x:50,y:72},{l:'PP',x:42,y:60},
        {l:'C',x:50,y:53},{l:'G',x:42,y:53},{l:'G',x:58,y:53},{l:'T',x:35,y:53},{l:'T',x:65,y:53},
        {l:'W',x:28,y:53},{l:'W',x:72,y:53},
        // Overload rushers on the left side
        {l:'R',x:14,y:50},{l:'R',x:22,y:50},{l:'R',x:30,y:50},{l:'R',x:38,y:50},
        // Interior defenders
        {l:'D',x:52,y:50},{l:'D',x:60,y:50},{l:'D',x:68,y:50},
        // Safety stays back
        {l:'S',x:50,y:35},
      ],
      routes: [],
      blocks: [
        // Overload edge rusher targets block point
        [[14,50],[30,65]],
        [[22,50],[35,62]],
        [[30,50],[38,58]],
        [[38,50],[42,56]],
      ],
      notes: ['Edge rusher: Full speed. Aim for the block point 7 yards in front of the punter.', 'Interior rushers: Attack your gap to create chaos and prevent a fake.', 'Safety: Stay back in case of a fake punt pass or run.', 'DO NOT rough the punter. Block the ball, not the kicker.'],
    },
    {
      name: 'FG / PAT Protection',
      desc: 'Standard 7-man front protection with the center, holder, and kicker in the backfield. The wings and guards form a pocket, blocking from the inside out. The operation must be completed in 1.3 seconds from snap to kick (HS timing).',
      players: [
        // FG formation
        {l:'C',x:50,y:53},
        {l:'LG',x:42,y:53},{l:'RG',x:58,y:53},
        {l:'LT',x:35,y:53},{l:'RT',x:65,y:53},
        {l:'LW',x:28,y:53},{l:'RW',x:72,y:53},
        {l:'H',x:50,y:63},   // Holder 7 yards back
        {l:'K',x:50,y:70},   // Kicker behind holder
        // Two upbacks for extra protection
        {l:'U',x:42,y:58},{l:'U',x:58,y:58},
      ],
      routes: [],
      blocks: [
        // Inside-out protection blocks
        [[42,53],[40,50]],   // LG blocks inside-out
        [[58,53],[60,50]],   // RG blocks inside-out
        [[35,53],[33,50]],   // LT blocks outside
        [[65,53],[67,50]],   // RT blocks outside
        [[28,53],[26,50]],   // LW blocks edge
        [[72,53],[74,50]],   // RW blocks edge
      ],
      notes: ['Center: Clean snap to the holder. Hit him in the hands every time.', 'Holder: Catch, spot, and spin the laces forward. Quick hands.', 'Wings: Block the edge. Do not let anyone come clean off the outside.', 'Timing target: 1.3 seconds from snap to kick for field goals.'],
    },
    {
      name: 'FG Block (Edge Rush)',
      desc: 'Align wide outside the wing and attack the edge at the snap. The goal is to get penetration past the wing blocker and get your hands up in the kick lane. The interior defenders occupy blockers to prevent a slide to the edge.',
      players: [
        // FG team (opposition)
        {l:'C',x:50,y:53},
        {l:'G',x:42,y:53},{l:'G',x:58,y:53},
        {l:'T',x:35,y:53},{l:'T',x:65,y:53},
        {l:'W',x:28,y:53},{l:'W',x:72,y:53},
        {l:'H',x:50,y:63},{l:'K',x:50,y:70},
        // Defensive edge rushers wide
        {l:'R',x:18,y:50},{l:'R',x:82,y:50},
        // Interior defenders
        {l:'D',x:38,y:50},{l:'D',x:46,y:50},{l:'D',x:54,y:50},{l:'D',x:62,y:50},
      ],
      routes: [],
      blocks: [
        // Edge rushers attack toward kicker
        [[18,50],[35,62]],
        [[82,50],[65,62]],
        // Interior occupies blockers
        [[38,50],[40,53]],
        [[46,50],[46,53]],
        [[54,50],[54,53]],
        [[62,50],[60,53]],
      ],
      notes: ['Edge rushers: Wide alignment. Attack outside the wing at full speed.', 'Get your hands up at the block point. Do not leave your feet.', 'Interior: Occupy blockers so they cannot help on the edge.', 'If the kick is up, rally to the ball in case of a miss or short kick.'],
    },
    {
      name: 'Onside Kick',
      desc: 'Players are bunched to one side of the field for a surprise short kick. The kicker aims for the ball to travel just past 10 yards. The hands team is positioned to recover the ball immediately. Timing and ball placement are critical for success.',
      players: [
        // Kicker
        {l:'K',x:50,y:80},
        // Hands team bunched to the right
        {l:'H',x:60,y:72},{l:'H',x:66,y:72},{l:'H',x:72,y:72},{l:'H',x:78,y:72},{l:'H',x:84,y:72},
        // A few players spread left as decoys
        {l:'D',x:20,y:72},{l:'D',x:30,y:72},{l:'D',x:40,y:72},
        // Recovery target area
        {l:'T',x:72,y:58},{l:'T',x:80,y:58},
      ],
      routes: [
        // Hands team converges on recovery zone
        [[60,72],[66,58]],
        [[66,72],[70,58]],
        [[72,72],[74,58]],
        [[78,72],[78,58]],
        [[84,72],[82,58]],
      ],
      blocks: [
        // Kick trajectory
        [[50,80],[72,62]],
      ],
      notes: ['K: Drive the ball into the ground at the right hash. Ball must travel 10 yards.', 'Hands team: Sprint to the ball. First priority is recovery, not advance.', 'Decoy players: Sprint downfield to sell a normal kickoff look.', 'Only call this when the element of surprise is intact.'],
    },
  ]

  const tocItems = ['Philosophy & Overview', ...plays.map((p) => p.name), 'Quick Reference / Glossary']

  const glossary = [
    { term: 'Gunner', def: 'The fastest players on the punt team who release wide to cover the punt return. Typically line up at the widest position.' },
    { term: 'Personal Protector (PP)', def: 'The player aligned in front of the punter responsible for reading the rush and calling protection adjustments.' },
    { term: 'Wedge', def: 'A formation of blockers on kickoff return who form a wall for the returner to run behind.' },
    { term: 'Contain', def: 'The responsibility of the edge coverage players to keep the return inside and prevent a sideline breakaway.' },
    { term: 'Lane Integrity', def: 'Each cover player staying in their assigned lane to prevent big returns through gaps in coverage.' },
    { term: 'Block Point', def: 'The spot in the air where the ball can be blocked. For punts, typically 5-7 yards in front of the punter.' },
    { term: 'Operation Time', def: 'The total time from snap to kick. HS FG standard is 1.3 seconds; HS punt standard is 2.0 seconds.' },
    { term: 'Jammer', def: 'Players assigned to hold up or slow down gunners at the line of scrimmage on punt returns.' },
  ]

  return buildPlaybook('HS Special Teams Playbook', 'Complete Kicking Game Manual', philosophy, plays, tocItems, glossary)
}

// ===========================================================================
//  WORKOUT GENERATORS
// ===========================================================================

// Helper: build a full workout document
function buildWorkout(title, subtitle, overview, warmupBullets, weeks, progressLabels) {
  const doc = new jsPDF()
  currentPageCount = 0

  // 1) Cover
  addCoverPage(doc, title, subtitle)

  // 2) Program overview page
  let y = newContentPage(doc)
  y = addSectionHeader(doc, y + 5, 'Program Overview')
  y = addParagraph(doc, y + 2, overview)

  y = addSectionHeader(doc, y + 3, 'How to Use This Template')
  y = addParagraph(doc, y + 2, 'Fill in the "Actual Weight," "Reps Done," and "Notes" columns after each session. Track your progress week-over-week to ensure progressive overload. If you miss a rep target, note the reason and adjust the following session accordingly.')

  y = addSectionHeader(doc, y + 3, 'Warm-Up Protocol')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.black)
  warmupBullets.forEach((bullet) => {
    y = checkPageBreak(doc, y, 6)
    doc.text('\u2022  ' + bullet, MARGIN + 3, y)
    y += 5
  })
  addPageFooter(doc, currentPageCount)

  // 3) Weekly log pages
  weeks.forEach((week) => {
    y = newContentPage(doc)
    y = addSectionHeader(doc, y + 5, week.label)

    if (week.note) {
      y = addParagraph(doc, y + 1, week.note)
    }

    week.days.forEach((day) => {
      y = checkPageBreak(doc, y, 15 + day.exercises.length * 8)
      y = addWorkoutTable(doc, y, day.label, day.exercises)
      y += 2
    })
    addPageFooter(doc, currentPageCount)
  })

  // 4) Progress tracking page
  addProgressPage(doc, 'Progress Tracker', progressLabels)

  return doc
}

// ---- 6. Off-Season Strength Program ----
function generateOffseasonStrength() {
  const overview = 'This is a 4-day-per-week periodized strength program designed for the off-season. The loading scheme progresses from 75% of your 1RM in Week 1, to 80% in Week 2, to 85% in Week 3, followed by a 70% deload in Week 4. The focus is on compound movements that build functional football strength: squat, bench, deadlift, overhead press, and Olympic lifts. Accessory work targets weak points and injury prevention. Rest 2-3 minutes between heavy sets and 60-90 seconds between accessory sets.'

  const warmup = [
    '5 minutes of light jogging or bike',
    'Foam roll: quads, hamstrings, glutes, upper back (2 min)',
    'Band pull-aparts x 15',
    'Band dislocates x 10',
    'Bodyweight squats x 10',
    'Leg swings (front-to-back and side-to-side) x 10 each',
    'Arm circles x 10 forward and backward',
    'Movement-specific warm-up sets: 2 sets of 5 at 50% and 65%',
  ]

  const percentages = ['75%', '80%', '85%', '70%']
  const weekLabels = ['Week 1 — Base (75%)', 'Week 2 — Build (80%)', 'Week 3 — Peak (85%)', 'Week 4 — Deload (70%)']

  const weeks = percentages.map((pct, i) => ({
    label: weekLabels[i],
    note: `All main lifts at ${pct} of your tested 1-rep max. Record actual weights used.`,
    days: [
      {
        label: `Day 1 — Upper Push (${pct})`,
        exercises: [
          { name: 'Bench Press', setsReps: '4 x 5', target: pct },
          { name: 'Overhead Press', setsReps: '3 x 8', target: pct },
          { name: 'DB Incline Press', setsReps: '3 x 10', target: 'Moderate' },
          { name: 'Tricep Extension', setsReps: '3 x 12', target: 'Light' },
          { name: 'Face Pulls', setsReps: '3 x 15', target: 'Light' },
        ],
      },
      {
        label: `Day 2 — Lower Squat (${pct})`,
        exercises: [
          { name: 'Back Squat', setsReps: '4 x 5', target: pct },
          { name: 'Front Squat', setsReps: '3 x 6', target: pct },
          { name: 'Walking Lunges', setsReps: '3 x 10/leg', target: 'Moderate' },
          { name: 'Leg Curl', setsReps: '3 x 10', target: 'Moderate' },
          { name: 'Calf Raises', setsReps: '3 x 15', target: 'Moderate' },
        ],
      },
      {
        label: `Day 3 — Upper Pull (${pct})`,
        exercises: [
          { name: 'Barbell Row', setsReps: '4 x 6', target: pct },
          { name: 'Weighted Pull-ups', setsReps: '3 x 8', target: pct },
          { name: 'DB Row', setsReps: '3 x 10', target: 'Moderate' },
          { name: 'Barbell Curl', setsReps: '3 x 10', target: 'Light' },
          { name: 'Band Pull-Aparts', setsReps: '3 x 20', target: 'Light' },
        ],
      },
      {
        label: `Day 4 — Lower Hinge (${pct})`,
        exercises: [
          { name: 'Deadlift', setsReps: '3 x 5', target: pct },
          { name: 'Power Clean', setsReps: '4 x 3', target: pct },
          { name: 'RDL', setsReps: '3 x 8', target: 'Moderate' },
          { name: 'Hip Thrust', setsReps: '3 x 10', target: 'Moderate' },
          { name: 'Plank', setsReps: '3 x 30s', target: 'BW' },
        ],
      },
    ],
  }))

  return buildWorkout(
    'Off-Season Strength Program',
    '4-Week Periodized Template',
    overview,
    warmup,
    weeks,
    ['Bench 1RM', 'Squat 1RM', 'Deadlift 1RM', 'Clean 1RM', 'BW']
  )
}

// ---- 7. In-Season Maintenance Program ----
function generateInseasonMaintenance() {
  const overview = 'This in-season maintenance program is built around the game-day schedule. Training occurs on GD-4 (Game Day minus 4 — typically Monday) and GD-2 (typically Wednesday). GD-4 is the heavy day with low volume but high intensity, targeting the CNS while allowing full recovery by game day. GD-2 is moderate and explosive — lighter loads with an emphasis on speed and movement quality. The goal is to maintain the strength gained in the off-season without accumulating fatigue that impacts game performance. Never sacrifice game-day readiness for a training PR.'

  const warmup = [
    '5 minutes of light movement (jog, bike, or dynamic stretching)',
    'Foam roll: key areas (quads, glutes, upper back) — 90 seconds total',
    'Band pull-aparts x 12',
    'Hip circles x 8 each direction',
    'Bodyweight squats x 8',
    'Movement-specific warm-up sets: 1-2 sets of 3 at 50-65%',
    'Keep warm-up to 8-10 minutes total — conserve energy for the session',
  ]

  const weeks = []
  for (let w = 1; w <= 4; w++) {
    weeks.push({
      label: `Week ${w} — Game Week`,
      note: 'GD-4: Heavy, low-volume. GD-2: Moderate, explosive. Adjust loads based on how you feel after last game.',
      days: [
        {
          label: `GD-4 (Monday) — Heavy / Low Volume`,
          exercises: [
            { name: 'Hang Clean', setsReps: '3 x 2', target: '85%' },
            { name: 'Back Squat', setsReps: '3 x 3', target: '85%' },
            { name: 'Bench Press', setsReps: '3 x 3', target: '85%' },
            { name: 'Weighted Pull-ups', setsReps: '2 x 5', target: '85%' },
            { name: 'Band Pull-Aparts', setsReps: '2 x 15', target: 'Light' },
          ],
        },
        {
          label: `GD-2 (Wednesday) — Moderate / Explosive`,
          exercises: [
            { name: 'Trap Bar DL', setsReps: '3 x 3', target: '75%' },
            { name: 'DB Incline Press', setsReps: '3 x 6', target: '75%' },
            { name: 'RDL', setsReps: '2 x 8', target: '75%' },
            { name: 'DB Row', setsReps: '2 x 8', target: '75%' },
            { name: 'Plank', setsReps: '2 x 30s', target: 'BW' },
          ],
        },
      ],
    })
  }

  return buildWorkout(
    'In-Season Maintenance Program',
    'Game-Day-Minus Schedule',
    overview,
    warmup,
    weeks,
    ['Squat 3RM', 'Bench 3RM', 'Clean 2RM', 'Body Wt', 'Notes']
  )
}

// ---- 8. Speed & Agility Program ----
function generateSpeedAgility() {
  const overview = 'This 6-week speed and agility program is broken into three 2-week phases. Weeks 1-2 focus on technique: proper sprint mechanics, body positioning, and movement patterns. Weeks 3-4 increase intensity with faster reps and shorter rest periods. Weeks 5-6 push to competition speed with timed reps and competitive drills. There are 3 sessions per week: Session A (linear speed), Session B (change of direction), and Session C (plyometrics). Always begin with a thorough dynamic warm-up. Never train speed while fatigued — quality over quantity.'

  const warmup = [
    'Light jog: 400 meters',
    'High knees x 20 yards',
    'Butt kicks x 20 yards',
    'A-skips x 20 yards',
    'B-skips x 20 yards',
    'Lateral shuffles x 20 yards each direction',
    'Carioca x 20 yards each direction',
    'Leg swings: 10 front-to-back, 10 side-to-side each leg',
    'Build-up sprints: 3 x 40 yards at 60%, 70%, 80%',
  ]

  const phases = [
    { name: 'Phase 1: Technique (Weeks 1-2)', effort: '80% effort' },
    { name: 'Phase 2: Intensity (Weeks 3-4)', effort: '90% effort' },
    { name: 'Phase 3: Competition (Weeks 5-6)', effort: 'Max Effort' },
  ]

  const weeks = []
  phases.forEach((phase, pi) => {
    for (let w = 0; w < 2; w++) {
      const weekNum = pi * 2 + w + 1
      weeks.push({
        label: `Week ${weekNum} — ${phase.name}`,
        note: `Target intensity: ${phase.effort}. Full recovery between reps. Prioritize form over speed.`,
        days: [
          {
            label: 'Session A — Linear Speed',
            exercises: [
              { name: '10yd Starts', setsReps: '6 reps', target: phase.effort },
              { name: '20yd Fly Sprints', setsReps: '4 reps', target: phase.effort },
              { name: '40yd Buildups', setsReps: '3 reps', target: phase.effort },
              { name: 'Wall Drives', setsReps: '3 x 5/leg', target: 'Controlled' },
              { name: 'A-Skips', setsReps: '3 x 20yd', target: 'Controlled' },
            ],
          },
          {
            label: 'Session B — Change of Direction',
            exercises: [
              { name: 'Pro Agility (5-10-5)', setsReps: '4 reps', target: phase.effort },
              { name: 'L-Drill', setsReps: '4 reps', target: phase.effort },
              { name: 'T-Drill', setsReps: '3 reps', target: phase.effort },
              { name: 'Lateral Shuffle', setsReps: '3 x 20yd', target: phase.effort },
              { name: 'Backpedal-Sprint', setsReps: '4 reps', target: phase.effort },
            ],
          },
          {
            label: 'Session C — Plyometrics',
            exercises: [
              { name: 'Box Jumps', setsReps: '4 x 3', target: phase.effort },
              { name: 'Depth Jumps', setsReps: '3 x 3', target: phase.effort },
              { name: 'Broad Jumps', setsReps: '4 x 2', target: phase.effort },
              { name: 'Single-Leg Bounds', setsReps: '3 x 5/leg', target: phase.effort },
              { name: 'Hurdle Hops', setsReps: '3 x 5', target: phase.effort },
            ],
          },
        ],
      })
    }
  })

  return buildWorkout(
    'Speed & Agility Program',
    '6-Week Progressive Development',
    overview,
    warmup,
    weeks,
    ['40yd Time', 'Pro Agility', 'L-Drill', 'Vertical', 'Broad Jump']
  )
}

// ---- 9. Combine/Camp Prep Program ----
function generateCombinePrep() {
  const overview = 'This 8-week combine and camp preparation program is built to peak your testing performance. It is organized into 4 phases: Base (Weeks 1-2) builds general strength and work capacity. Build (Weeks 3-4) increases intensity and specificity. Peak (Weeks 5-6) trains at near-max effort with testing-specific drills. Taper (Weeks 7-8) reduces volume while maintaining intensity so you walk into testing day fresh, fast, and explosive. Each week includes 3 training days and 2 testing-specific days. Record every test result — you need to see your trend line improving.'

  const warmup = [
    'Light jog: 400 meters',
    'Dynamic stretching: 5 minutes',
    'Band work: pull-aparts, dislocates, monster walks — 2 min',
    'Sprint-specific warm-up: A-skips, B-skips, high knees — 2 min',
    'Build-up sprints: 2 x 40 yards at 70% and 85%',
    'Movement prep: lateral shuffles, backpedals — 2 min',
  ]

  const phaseNames = ['Base (Wk 1-2)', 'Build (Wk 3-4)', 'Peak (Wk 5-6)', 'Taper (Wk 7-8)']
  const phaseTargets = ['75%', '80%', '85-90%', '80%']

  const weeks = []
  phaseNames.forEach((phaseName, pi) => {
    for (let w = 0; w < 2; w++) {
      const weekNum = pi * 2 + w + 1
      const target = phaseTargets[pi]
      weeks.push({
        label: `Week ${weekNum} — ${phaseName}`,
        note: `Phase target intensity: ${target}. Focus on quality reps and full recovery between sets.`,
        days: [
          {
            label: 'Day 1 — Lift (Strength)',
            exercises: [
              { name: 'Power Clean', setsReps: '3 x 3', target: target },
              { name: 'Squat', setsReps: '4 x 3', target: target },
              { name: 'Bench Press', setsReps: '4 x 3', target: target },
              { name: 'Weighted Pull-ups', setsReps: '3 x 5', target: target },
            ],
          },
          {
            label: 'Day 2 — 40 / Sprint Work',
            exercises: [
              { name: 'Stance Work', setsReps: '10 reps', target: 'Perfect form' },
              { name: 'Block Starts', setsReps: '6 reps', target: 'Max Effort' },
              { name: '10yd Dash', setsReps: '4 reps', target: 'Max Effort' },
              { name: 'Full 40', setsReps: '2 reps', target: 'Max Effort' },
            ],
          },
          {
            label: 'Day 3 — Jump / Agility',
            exercises: [
              { name: 'Approach Jumps', setsReps: '6 reps', target: 'Max Effort' },
              { name: 'Standing Vertical', setsReps: '4 reps', target: 'Max Effort' },
              { name: 'Broad Jump', setsReps: '4 reps', target: 'Max Effort' },
              { name: '3-Cone Drill', setsReps: '4 reps', target: 'Max Effort' },
              { name: 'Shuttle (5-10-5)', setsReps: '4 reps', target: 'Max Effort' },
            ],
          },
          {
            label: 'Day 4 — Lift (Power)',
            exercises: [
              { name: 'Trap Bar DL', setsReps: '3 x 3', target: target },
              { name: 'DB Press', setsReps: '3 x 8', target: 'Moderate' },
              { name: 'RDL', setsReps: '3 x 5', target: target },
              { name: 'Core Circuit', setsReps: '3 rounds', target: 'BW' },
            ],
          },
          {
            label: 'Day 5 — Position Drills / Testing',
            exercises: [
              { name: 'Position-Specific Drills', setsReps: '20 min', target: 'Game speed' },
              { name: '40yd Time Trial', setsReps: '1-2 reps', target: 'PR attempt' },
              { name: 'Vertical Jump Test', setsReps: '3 reps', target: 'PR attempt' },
              { name: 'Broad Jump Test', setsReps: '3 reps', target: 'PR attempt' },
              { name: '3-Cone / Shuttle Test', setsReps: '2 reps each', target: 'PR attempt' },
            ],
          },
        ],
      })
    }
  })

  return buildWorkout(
    'Combine/Camp Prep Program',
    '8-Week Countdown to Testing',
    overview,
    warmup,
    weeks,
    ['40 Time', 'Vertical', 'Broad Jump', '3-Cone', 'Shuttle', 'Bench Reps']
  )
}

// ---- 10. Lineman-Specific Program ----
function generateLinemanProgram() {
  const overview = 'This program is built specifically for offensive and defensive linemen. The emphasis is on raw strength, functional power, and position-specific movement patterns. The 4-day split targets max strength, explosive power, hypertrophy (size), and position-specific work. Heavy compound lifts are the foundation — squat, bench, deadlift, clean, and press. Accessory work focuses on grip strength, core stability, and the ability to move heavy objects. Linemen do not need to run a 4.4 forty — they need to dominate the man across from them for 4-5 seconds every snap.'

  const warmup = [
    'Light bike or walk: 5 minutes',
    'Foam roll: IT band, quads, upper back, lats — 3 minutes',
    'Hip circles x 10 each direction',
    'Band pull-aparts x 15',
    'Goblet squats x 8',
    'Push-ups x 10',
    'Movement-specific warm-up: 2-3 sets at 50-65% of working weight',
  ]

  const weeks = []
  const weekTargets = ['80%', '82%', '85%', '75%']
  const weekLabels = ['Week 1 — Foundation', 'Week 2 — Build', 'Week 3 — Peak', 'Week 4 — Recovery']

  weekTargets.forEach((target, i) => {
    weeks.push({
      label: weekLabels[i],
      note: `Main lifts at ${target} of 1RM. Heavy accessories — push the weight. Rest 3+ minutes between main-lift sets.`,
      days: [
        {
          label: 'Day 1 — Max Strength',
          exercises: [
            { name: 'Back Squat', setsReps: '5 x 3', target: target },
            { name: 'Floor Press', setsReps: '4 x 5', target: target },
            { name: 'Pendlay Row', setsReps: '4 x 5', target: target },
            { name: "Farmer's Walk", setsReps: '3 x 40yd', target: 'Heavy' },
            { name: 'Ab Wheel', setsReps: '3 x 10', target: 'BW' },
          ],
        },
        {
          label: 'Day 2 — Power',
          exercises: [
            { name: 'Hang Clean', setsReps: '5 x 2', target: target },
            { name: 'Push Press', setsReps: '4 x 3', target: target },
            { name: 'Box Squat', setsReps: '4 x 3', target: target },
            { name: 'Med Ball Slam', setsReps: '3 x 8', target: 'Explosive' },
            { name: 'Sled Push', setsReps: '4 x 20yd', target: 'Heavy' },
          ],
        },
        {
          label: 'Day 3 — Hypertrophy',
          exercises: [
            { name: 'Leg Press', setsReps: '4 x 10', target: 'Heavy' },
            { name: 'DB Bench', setsReps: '4 x 10', target: 'Moderate' },
            { name: 'Cable Row', setsReps: '4 x 10', target: 'Moderate' },
            { name: 'Lateral Raises', setsReps: '3 x 15', target: 'Light' },
            { name: 'Hammer Curl', setsReps: '3 x 12', target: 'Moderate' },
          ],
        },
        {
          label: 'Day 4 — Position Work',
          exercises: [
            { name: 'Fire-Out Drill', setsReps: '4 x 5', target: 'Explosive' },
            { name: 'Hand Placement Drill', setsReps: '4 x 5', target: 'Technique' },
            { name: 'Mirror Drill', setsReps: '4 x 30s', target: 'Max Effort' },
            { name: 'Hip Escape', setsReps: '3 x 5/side', target: 'Technique' },
            { name: 'Conditioning: Sprints', setsReps: '10 x 10yd', target: 'Max Effort' },
          ],
        },
      ],
    })
  })

  return buildWorkout(
    'Lineman-Specific Program',
    '4-Week Strength & Power',
    overview,
    warmup,
    weeks,
    ['Squat 1RM', 'Bench 1RM', 'Clean 1RM', 'DL 1RM', 'Body Wt']
  )
}

// ---- 11. Skill Position Program ----
function generateSkillPositionProgram() {
  const overview = 'Designed for wide receivers, defensive backs, and running backs, this program emphasizes single-leg strength, hip mobility, and explosive speed. The 5-day split includes 3 lift days and 2 speed/agility days. Single-leg exercises dominate the lower-body work because skill positions spend most of their playing time on one leg — cutting, jumping, and accelerating. Upper-body work is functional: enough pressing to protect yourself, enough pulling to maintain balance and posture. Speed days focus on position-specific movement patterns and explosive first-step quickness.'

  const warmup = [
    'Light jog: 400 meters',
    'Dynamic stretching: hip circles, leg swings, arm circles — 3 min',
    'Mini-band walks (forward, lateral, monster) x 10 each',
    'A-skips x 20 yards',
    'High knees x 20 yards',
    'Lateral shuffles x 20 yards each direction',
    'Build-up sprints: 2 x 30 yards at 70% and 80%',
  ]

  const weeks = []
  const weekTargets = ['75%', '80%', '82%', '70%']
  const weekNames = ['Week 1 — Base', 'Week 2 — Build', 'Week 3 — Intensity', 'Week 4 — Recovery']

  weekTargets.forEach((target, i) => {
    weeks.push({
      label: weekNames[i],
      note: `Main lifts at ${target}. Speed/agility days: full effort, full recovery between reps.`,
      days: [
        {
          label: 'Day 1 — Lift (Lower Body)',
          exercises: [
            { name: 'Trap Bar DL', setsReps: '4 x 4', target: target },
            { name: 'Bulgarian Split Squat', setsReps: '3 x 8/leg', target: 'Moderate' },
            { name: 'Single-Leg RDL', setsReps: '3 x 8/leg', target: 'Moderate' },
            { name: 'Hip Flexor March', setsReps: '3 x 10/leg', target: 'BW' },
            { name: 'Calf Raises', setsReps: '3 x 15', target: 'Moderate' },
          ],
        },
        {
          label: 'Day 2 — Speed',
          exercises: [
            { name: '10yd Starts', setsReps: '6 reps', target: 'Max Effort' },
            { name: 'Pro Agility', setsReps: '4 reps', target: 'Max Effort' },
            { name: 'Backpedal-to-Sprint', setsReps: '4 reps', target: 'Max Effort' },
            { name: 'Hip Turn Drill', setsReps: '6 reps', target: 'Max Effort' },
            { name: 'Cone Weave', setsReps: '4 reps', target: 'Max Effort' },
          ],
        },
        {
          label: 'Day 3 — Lift (Upper Body)',
          exercises: [
            { name: 'DB Bench', setsReps: '4 x 8', target: 'Moderate' },
            { name: 'Pull-ups', setsReps: '4 x 8', target: target },
            { name: 'DB Press (standing)', setsReps: '3 x 10', target: 'Moderate' },
            { name: 'Face Pulls', setsReps: '3 x 15', target: 'Light' },
            { name: 'Plank', setsReps: '3 x 30s', target: 'BW' },
          ],
        },
        {
          label: 'Day 4 — Agility',
          exercises: [
            { name: 'L-Drill', setsReps: '4 reps', target: 'Max Effort' },
            { name: 'Mirror Drill', setsReps: '4 x 30s', target: 'Max Effort' },
            { name: 'Shuffle-Sprint', setsReps: '4 reps', target: 'Max Effort' },
            { name: 'Route Running Cuts', setsReps: '8 reps', target: 'Game Speed' },
            { name: 'Ball Tracking Drill', setsReps: '8 reps', target: 'Game Speed' },
          ],
        },
        {
          label: 'Day 5 — Lift (Full Body)',
          exercises: [
            { name: 'Power Clean', setsReps: '3 x 3', target: target },
            { name: 'Front Squat', setsReps: '3 x 5', target: target },
            { name: 'Incline DB Press', setsReps: '3 x 8', target: 'Moderate' },
            { name: 'Row (cable or DB)', setsReps: '3 x 8', target: 'Moderate' },
            { name: 'Core Circuit', setsReps: '3 rounds', target: 'BW' },
          ],
        },
      ],
    })
  })

  return buildWorkout(
    'Skill Position Program',
    'WR / DB / RB \u2014 4 Weeks',
    overview,
    warmup,
    weeks,
    ['40 Time', 'Pro Agility', 'Vertical', 'Trap Bar DL', 'BW']
  )
}

// ---- 12. QB Development Program ----
function generateQBDevelopment() {
  const overview = 'This quarterback development program integrates strength training with throwing mechanics and footwork. The 5-day schedule alternates between lift days and throw days, ensuring the arm is never overloaded two days in a row. Lift days emphasize rotational power (the engine behind throw velocity), lower-body stability, and arm care. Throw days progress from warm-up tosses through positional drops and live accuracy work. Track your throw count and arm feel daily — a score of 1-5 after each throwing session. If arm feel drops below 3, reduce volume the next session. The arm is a tool — maintain it like one.'

  const warmup = [
    'Light jog: 400 meters',
    'Band pull-aparts x 15',
    'Band external rotation (90/90) x 10 each arm',
    'Arm circles: 10 forward, 10 backward',
    'Wrist circles: 10 each direction',
    'Trunk rotations x 10 each direction',
    'Bodyweight squats x 10',
    'For throw days: start with wrist flips at 5 yards, progress out to 15',
  ]

  const weeks = []
  const weekTargets = ['75%', '78%', '80%', '70%']
  const weekNames = ['Week 1 — Foundation', 'Week 2 — Build', 'Week 3 — Intensity', 'Week 4 — Recovery']

  weekTargets.forEach((target, i) => {
    weeks.push({
      label: weekNames[i],
      note: `Lift days at ${target}. Throw days: track throw count and arm feel (1-5 scale) after each session.`,
      days: [
        {
          label: 'Day 1 — Lift (Lower / Rotational)',
          exercises: [
            { name: 'Front Squat', setsReps: '3 x 5', target: target },
            { name: 'DB Bench', setsReps: '3 x 8', target: 'Moderate' },
            { name: 'Med Ball Rot. Throw', setsReps: '3 x 8/side', target: 'Explosive' },
            { name: 'Band External Rotation', setsReps: '3 x 15', target: 'Light' },
            { name: 'Plank', setsReps: '3 x 30s', target: 'BW' },
          ],
        },
        {
          label: 'Day 2 — Throw (Mechanics)',
          exercises: [
            { name: 'Wrist Flips', setsReps: '20 reps', target: 'Warm-up' },
            { name: '1-Knee Throws', setsReps: '15 reps', target: 'Technique' },
            { name: 'Stand-Still Throws', setsReps: '15 reps', target: 'Technique' },
            { name: '3-Step Drop Throws', setsReps: '10 reps', target: 'Timing' },
            { name: '5-Step Drop Throws', setsReps: '10 reps', target: 'Timing' },
          ],
        },
        {
          label: 'Day 3 — Lift (Upper / Arm Care)',
          exercises: [
            { name: 'RDL', setsReps: '3 x 6', target: target },
            { name: 'Push-ups', setsReps: '3 x 15', target: 'BW' },
            { name: 'Pull-ups', setsReps: '3 x 8', target: target },
            { name: 'Anti-Rotation Press', setsReps: '3 x 10/side', target: 'Moderate' },
            { name: 'Band Pull-Aparts', setsReps: '3 x 20', target: 'Light' },
          ],
        },
        {
          label: 'Day 4 — Throw + Footwork',
          exercises: [
            { name: 'Dropback Footwork Ladder', setsReps: '10 reps', target: 'Precision' },
            { name: 'Rollout Right', setsReps: '8 reps', target: 'Game Speed' },
            { name: 'Rollout Left', setsReps: '8 reps', target: 'Game Speed' },
            { name: 'Pocket Movement', setsReps: '8 reps', target: 'Game Speed' },
            { name: 'Accuracy Target (net)', setsReps: '20 reps', target: 'Accuracy' },
          ],
        },
        {
          label: 'Day 5 — Lift (Power / Full Body)',
          exercises: [
            { name: 'Power Clean', setsReps: '3 x 3', target: target },
            { name: 'Incline Press', setsReps: '3 x 8', target: 'Moderate' },
            { name: 'Single-Arm Row', setsReps: '3 x 8/side', target: 'Moderate' },
            { name: 'Wrist Curls', setsReps: '2 x 15', target: 'Light' },
            { name: 'Reverse Wrist Curls', setsReps: '2 x 15', target: 'Light' },
          ],
        },
      ],
    })
  })

  return buildWorkout(
    'QB Development Program',
    '4-Week Arm Care & Mechanics',
    overview,
    warmup,
    weeks,
    ['Throw Count', 'Arm Feel (1-5)', 'Squat 1RM', 'Clean 1RM', 'BW']
  )
}

// ===========================================================================
//  MAIN
// ===========================================================================

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    console.log('Created output directory:', OUTPUT_DIR)
  }

  const generators = [
    { fn: generateSpreadOffensePlaybook, filename: 'hs-spread-offense-playbook.pdf' },
    { fn: generateWingTOffensePlaybook, filename: 'hs-wing-t-offense-playbook.pdf' },
    { fn: generate43DefensePlaybook, filename: 'hs-4-3-defense-playbook.pdf' },
    { fn: generate34DefensePlaybook, filename: 'hs-3-4-defense-playbook.pdf' },
    { fn: generateSpecialTeamsPlaybook, filename: 'hs-special-teams-playbook.pdf' },
    { fn: generateOffseasonStrength, filename: 'offseason-strength-program.pdf' },
    { fn: generateInseasonMaintenance, filename: 'inseason-maintenance-program.pdf' },
    { fn: generateSpeedAgility, filename: 'speed-agility-program.pdf' },
    { fn: generateCombinePrep, filename: 'combine-camp-prep-program.pdf' },
    { fn: generateLinemanProgram, filename: 'lineman-specific-program.pdf' },
    { fn: generateSkillPositionProgram, filename: 'skill-position-program.pdf' },
    { fn: generateQBDevelopment, filename: 'qb-development-program.pdf' },
  ]

  let successCount = 0

  for (const { fn, filename } of generators) {
    try {
      console.log(`Generating ${filename}...`)
      const doc = fn()
      const buffer = doc.output('arraybuffer')
      const filePath = path.join(OUTPUT_DIR, filename)
      fs.writeFileSync(filePath, Buffer.from(buffer))
      const sizeKB = (Buffer.from(buffer).length / 1024).toFixed(1)
      console.log(`  -> ${filename} (${sizeKB} KB)`)
      successCount++
    } catch (err) {
      console.error(`  ERROR generating ${filename}:`, err.message)
    }
  }

  console.log(`\nDone! Generated ${successCount}/${generators.length} PDFs in ${OUTPUT_DIR}`)
}

main()

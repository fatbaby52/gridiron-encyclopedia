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

function addPlayDiagram(doc, y, playName, positions, notes) {
  const boxW = CONTENT_WIDTH
  const boxH = 55

  // Field rectangle
  doc.setFillColor(...COLORS.fieldGreen)
  doc.setDrawColor(...COLORS.grass)
  doc.setLineWidth(0.5)
  doc.rect(MARGIN, y, boxW, boxH, 'FD')

  // Yard-line markings (subtle)
  doc.setDrawColor(255, 255, 255)
  doc.setLineWidth(0.15)
  for (let i = 1; i < 5; i++) {
    const lx = MARGIN + (boxW / 5) * i
    doc.line(lx, y + 2, lx, y + boxH - 2)
  }

  // Play name in gold at top-left of box
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...COLORS.gold)
  doc.text(playName, MARGIN + 4, y + 7)

  // Positions as white text lines centered inside the box
  doc.setFont('courier', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.white)
  const startY = y + 16
  positions.forEach((pos, i) => {
    doc.text(pos, PAGE_WIDTH / 2, startY + i * 5, { align: 'center' })
  })

  let newY = y + boxH + 4

  // Notes as bullet points below the box
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
    y = checkPageBreak(doc, y, 85)
    if (y === MARGIN) {
      y += 5
    }
    y = addSectionHeader(doc, y, play.name)
    y = addParagraph(doc, y + 1, play.desc)
    y = addPlayDiagram(doc, y, play.name, play.positions, play.notes)
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
      positions: ['X --- T  G  C  G  T --- Z', '          QB (gun)', '        RB (offset right)', 'H (slot left)        Y (slot right)'],
      notes: ['OL: Zone step play-side, combo to LB level.', 'RB: Aiming point is play-side A-gap; read the first DL past center.', 'QB: Ride the mesh, pull on "give" read, hand off on "keep" read.', 'Backside WR: Stalk block or run bubble route as RPO tag.'],
    },
    {
      name: 'Outside Zone (Pistol)',
      desc: 'A stretch concept that forces the defense to run sideline to sideline. The RB aims for the outside leg of the offensive tackle and reads the first defender to show outside leverage. If the defense over-pursues, the RB cuts back into the vacated lane.',
      positions: ['X --- T  G  C  G  T --- Z', '          QB (pistol)', '          RB (behind QB)', 'H (slot)            Y (slot)'],
      notes: ['OL: Reach step, sustain blocks to the sideline.', 'RB: Aiming point is OT outside leg; press the edge then cut back.', 'QB: Reverse pivot, hand off deep. Can pull on zone-read tag.', 'Cutback lane is the money — patience is key.'],
    },
    {
      name: 'Zone Read',
      desc: 'The QB reads the backside defensive end after the snap. If the DE crashes down on the RB, the QB keeps and runs off the edge. If the DE stays home or widens, the QB gives to the RB on inside zone. This removes one defender from the box without blocking him.',
      positions: ['X --- T  G  C  G  T --- Z', '          QB (gun)', '        RB (offset)', '     READ KEY: Backside DE'],
      notes: ['QB: Eyes on the backside DE through the mesh.', 'RB: Run inside zone track regardless of give/keep.', 'Backside OT: Skip the DE — he is the read key.', 'If DE squeezes: QB keeps. If DE sits or widens: QB gives.'],
    },
    {
      name: 'Mesh Concept',
      desc: 'Two receivers run shallow crossing routes from opposite sides, creating a natural pick. A third receiver runs a choice or sit route over the top. The QB reads high-to-low: choice route first, then the two crossers underneath. Effective against both man and zone coverage.',
      positions: ['X (shallow cross -->)     Z (<-- shallow cross)', '           Choice Route (over top)', '     QB reads high to low', '        RB check-release flat'],
      notes: ['Slot WRs: Cross at 5-6 yards, run full speed through traffic.', 'Outside WR: Sit or choice route at 10-12 yards.', 'QB: High-low read. If choice is covered, find the crosser in the window.', 'Hot route if blitz: throw to the crosser coming toward pressure.'],
    },
    {
      name: 'Spacing Concept',
      desc: 'Five receivers distribute across three levels of the field in the short-to-intermediate range. The spacing stretches zone defenders by placing receivers in every window. The QB works a simple left-to-right or triangle read.',
      positions: ['X (hitch)   H (middle sit)   Z (hitch)', '  Y (flat)                RB (flat)', '              QB'],
      notes: ['Receivers settle in the open windows of zone coverage.', 'QB: Identify the triangle — work high-to-low, inside-to-outside.', 'Against man coverage, receivers create natural separation with spacing.', 'Great answer to heavy blitz packages.'],
    },
    {
      name: 'Four Verticals',
      desc: 'All four wide receivers push vertical, stretching the secondary deep. The running back check-releases into the flat as a safety valve. Designed to attack Cover 2 by splitting the safeties and Cover 3 by overloading the deep thirds.',
      positions: ['X (go)   H (seam)   Y (seam)   Z (go)', '               QB (gun)', '         RB (check-release flat)', '    Beat Cover 2 / Cover 3 deep'],
      notes: ['Outside WRs: Win vertical on the outside, threaten the deep third.', 'Slot WRs: Push the seam, read safeties — sit if Cover 2, run by if Cover 3.', 'QB: Read the safeties post-snap. Two-high: throw the seam. One-high: throw the post.', 'RB: Block first, release to flat if clean.'],
    },
    {
      name: 'Smash Concept',
      desc: 'A hitch-corner combination that attacks Cover 2 by putting the flat defender in conflict. The outside receiver runs a 5-yard hitch while the slot runs a 12-yard corner route behind the dropping CB. The QB reads the flat defender.',
      positions: ['X (hitch at 5)          Z (hitch at 5)', '  H (corner route)    Y (corner route)', '              QB', '       RB (check-release)'],
      notes: ['Outside WR: Hitch at 5 yards, show your numbers to the QB.', 'Slot WR: Stem inside, break on the corner route at 12 yards.', 'QB: Read the flat defender. If he squats on the hitch, throw the corner.', 'Deadly against Cover 2 shells.'],
    },
    {
      name: 'Bubble RPO',
      desc: 'An inside zone run paired with a bubble screen read. The QB reads the flat defender or overhang player pre-snap and post-snap. If the defender is in the box, throw the bubble. If he is wide, hand off inside zone.',
      positions: ['X --- T  G  C  G  T --- Z', '          QB (gun)', '        RB (inside zone)', 'H (bubble route) <-- READ: flat defender'],
      notes: ['QB: Pre-snap count box defenders vs. blockers.', 'If box is loaded (6+ in box): throw the bubble.', 'If overhang player is wide: hand off inside zone.', 'Slot WR: Be ready for the quick bubble — catch and get upfield.'],
    },
    {
      name: 'Glance RPO',
      desc: 'An inside zone run combined with a glance route by the slot receiver. The QB reads the linebacker. If the LB steps up to play the run, the QB pulls and throws the glance to the vacated area. If the LB drops, the QB gives the handoff.',
      positions: ['X --- T  G  C  G  T --- Z', '          QB (gun)', '        RB (inside zone)', 'Y (glance route) <-- READ: LB'],
      notes: ['Slot WR: Run the glance (1-step slant) at the snap.', 'QB: Mesh with RB; eyes on the LB. Pull and throw if LB fills.', 'OL: Block inside zone — do not tip the RPO.', 'Timing must be quick — this is a 1-step throw.'],
    },
    {
      name: 'Tunnel Screen',
      desc: 'A quick perimeter screen designed to get the ball in space. The slot receiver catches a short throw behind the LOS while the outside WR and the pulling lineman create a wall of blockers. Best called against aggressive pass rushes.',
      positions: ['X (block down)    Z (block down)', '  H (catch) <-- WR blockers set wall', '     OL releases to screen side', '          QB (quick throw)'],
      notes: ['Slot WR: Settle behind the LOS, catch and follow the wall.', 'Outside WR: Block the nearest DB aggressively.', 'OL: Sell pass block for 1 count, then release to screen side.', 'QB: Quick 1-step throw. Ball must come out fast.'],
    },
    {
      name: 'Jailbreak Screen',
      desc: 'A delayed screen to the running back. The OL initially pass sets, allowing defenders upfield, then releases into space as blockers. The RB fakes a block, then leaks to the flat for the catch. Creates a numbers advantage at the second level.',
      positions: ['         OL pass set, then release', '          QB (sell deep throw)', '        RB (fake block, leak to flat)', '   WRs sell routes deep to clear out'],
      notes: ['OL: Pass set for 2 counts, let rush go, then get downfield.', 'RB: Fake blitz pickup, slip to the flat. Expect the ball at the LOS.', 'QB: Sell the deep look, then dump to RB.', 'WRs: Run deep routes to pull DBs out of the screen area.'],
    },
    {
      name: 'Quick Slant-Flat',
      desc: 'A 2-man combination on either side. The outside WR runs a quick slant at 3-5 yards while the slot or RB runs to the flat. The QB reads the flat defender — if he drops, throw the flat; if he drives on the flat, throw the slant behind him.',
      positions: ['X (slant)              Z (slant)', '  H (flat)           Y (flat)', '              QB', '         Quick 1-step drop'],
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
      positions: ['SE --- T  G  C  G  T --- TE', '     WB          FB          WB', '              QB (under center)', ' Guards pull play-side, FB kick-out'],
      notes: ['Both guards pull — lead guard kicks out EMOL, second guard turns up.', 'FB: Fake first, then execute kick-out block on the contain player.', 'HB: Take the handoff, follow the pulling guards, get to the edge.', 'QBs ball fake to the dive back is critical to freeze the LBs.'],
    },
    {
      name: 'Buck Sweep Pass (Waggle)',
      desc: 'A play-action pass off buck sweep action. The QB fakes the buck sweep, then bootlegs to the opposite side. The tight end runs a drag route across the formation, and the split end runs a deep post. This play punishes defenses that over-pursue the buck sweep.',
      positions: ['SE (post) --- T  G  C  G  T --- TE (drag)', '     Fake buck sweep action', '              QB boots opposite', '   WB (flat route)'],
      notes: ['QB: Sell the sweep fake with your eyes and body, then boot.', 'TE: Drag across the formation at 6-8 yards. Be the primary read.', 'SE: Run a post route to clear the deep middle. Secondary read.', 'WB: Release to the flat as the checkdown option.'],
    },
    {
      name: 'Guard Trap',
      desc: 'A quick-hitting interior run through the A-gap. The play-side linemen down block, and the backside guard pulls to trap (kick out) the first defender past the center. The fullback hits the hole fast and downhill. This play is designed to break the will of interior defenders.',
      positions: ['SE --- T  G  C  G  T --- TE', '              FB (A-gap dive)', '              QB', ' Backside guard pulls to trap DT'],
      notes: ['Backside guard: Pull flat, trap the first DT past center.', 'Play-side linemen: Down block — seal everything inside.', 'FB: Fast downhill through the A-gap. No dancing.', 'QB: Quick reverse pivot, hand off deep to the FB.'],
    },
    {
      name: 'Tackle Trap',
      desc: 'Similar concept to the guard trap but with the tackle pulling instead. This puts a larger body at the point of attack, ideal for situations where the defense has a dominant nose guard. The trap block from the tackle creates a wider lane.',
      positions: ['SE --- T  G  C  G  T --- TE', '              FB (dive)', '              QB', ' Backside tackle pulls to trap'],
      notes: ['Backside tackle: Pull and trap the first defender in the gap.', 'Guard: Hinge block to protect the backside.', 'FB: Expect a wider lane than the guard trap.', 'Use this when the nose guard is dominating the guard trap.'],
    },
    {
      name: 'Counter Criss-Cross',
      desc: 'The fullback and halfback cross paths behind the QB, creating misdirection chaos. The guard and tackle pull to the play-side to create a wall. The ball carrier gets the handoff going opposite the initial flow, catching the linebackers flowing the wrong direction.',
      positions: ['SE --- T  G  C  G  T --- TE', '     WB  (cross)  FB  (cross)  WB', '              QB', ' Guard + Tackle pull to play-side'],
      notes: ['FB and HB: Cross behind the QB — sell the misdirection.', 'QB: Open to the first back, fake, then hand to the second back.', 'Pulling guard: Kick out EMOL.', 'Pulling tackle: Turn up inside the kick-out for the LB.'],
    },
    {
      name: 'Counter Boot',
      desc: 'A play-action bootleg pass off the counter criss-cross action. The QB fakes the counter, then boots to the weak side. The TE runs a drag, and the split end runs a comeback. The defense, having committed to the counter action, leaves the bootleg side vulnerable.',
      positions: ['SE (comeback) --- T  G  C  G  T --- TE (drag)', '     Fake counter action', '              QB boots weak', '   WB (flat)'],
      notes: ['QB: Complete the full counter fake, then boot to the weak side.', 'TE: Run the drag — be ready for the ball quickly.', 'SE: Comeback at 12-15 yards on the backside.', 'This is devastating when the counter is working.'],
    },
    {
      name: 'Jet Sweep',
      desc: 'A quick-hitting perimeter play using a flanker in jet motion. The motion back takes the handoff from the QB on a direct path to the edge. The wingback and tight end block on the perimeter, creating a lane. The jet sweep forces the defense to widen their alignments.',
      positions: ['SE --- T  G  C  G  T --- TE (block edge)', '     WB (block)     FB (fake dive)', '     <<< Jet Motion WR takes handoff', '              QB (hands off)'],
      notes: ['Motion WR: Full speed through the mesh — no slowing down.', 'QB: Catch the snap, extend the ball to the jet motion WR.', 'TE: Block the force player on the edge.', 'Timing the snap with the motion is everything.'],
    },
    {
      name: 'Jet Pass',
      desc: 'A play-action pass that uses the jet motion fake to freeze the defense. The QB fakes the jet handoff, then drops back to throw. The split end runs a go route with the defense pulled up by the jet fake. The WR in motion continues to the flat as a checkdown.',
      positions: ['SE (go route deep)', '     <<< Jet motion WR (fake, then flat)', '              QB (fake jet, drop back)', '   TE (post route)'],
      notes: ['QB: Sell the jet fake, pull the ball back, drop and throw.', 'SE: Go route — win on the deep ball. The fake creates a window.', 'Jet WR: Continue to the flat as an outlet after the fake.', 'TE: Run a post across the middle. Secondary read.'],
    },
    {
      name: 'Jet Dive',
      desc: 'A companion play to the jet sweep. The motion WR fakes taking the jet handoff while the fullback dives directly up the A-gap. When the defense flows hard to stop the jet sweep, the fullback finds open daylight inside.',
      positions: ['SE --- T  G  C  G  T --- TE', '     <<< Jet motion (fake)', '              FB (A-gap dive)', '              QB (fakes jet, hands to FB)'],
      notes: ['Motion WR: Sell the jet sweep fake — run at full speed.', 'FB: Take the handoff and hit the A-gap hard. LBs will be flowing.', 'QB: Fake to the jet motion, reverse pivot, hand to the FB.', 'The better the jet sweep works, the better this play becomes.'],
    },
    {
      name: 'Fullback Down (Belly)',
      desc: 'An off-tackle play where the fullback runs behind down blocks from the play-side linemen. The tight end and wingback create the edge with seal and kick-out blocks. The fullback gets downhill fast with a direct path behind the wall.',
      positions: ['SE --- T  G  C  G  T --- TE (down block)', '     WB (kick out)     FB (off-tackle)', '              QB', ' Down blocks create the lane'],
      notes: ['TE: Down block on the DE — seal him inside.', 'WB: Kick out the force player on the edge.', 'FB: Aim for the outside hip of the TE. Get downhill immediately.', 'OL: Down block scheme — everyone blocks down to the play-side.'],
    },
    {
      name: 'Power Sweep',
      desc: 'Different from the buck sweep — the play-side tackle pulls instead of both guards. This creates a different blocking scheme at the point of attack with a bigger body leading the way. The halfback follows the pulling tackle to the edge.',
      positions: ['SE --- T  G  C  G  T --- TE', '     WB          FB (kick out)', '              QB', '     HB follows pulling tackle'],
      notes: ['Play-side tackle: Pull and lead through the hole.', 'FB: Kick out the EMOL on the edge.', 'HB: Follow the tackle, read his block, and cut accordingly.', 'Differs from buck sweep — one big puller instead of two guards.'],
    },
    {
      name: 'Reverse',
      desc: 'Uses jet motion fake to pull the defense one direction, then hands the ball back to the backside WR going the other way. Maximum misdirection. Must be set up by establishing the jet sweep earlier in the game.',
      positions: ['SE (takes reverse handoff >>>)', '     <<< Jet motion WR (fake)', '              QB (fakes jet, hands to SE)', '   WB/TE seal backside'],
      notes: ['Jet WR: Sell the sweep fake at full speed.', 'SE: Come across the formation, take the handoff from QB.', 'QB: Fake jet, then hand to the SE coming back the other way.', 'Only works if the defense has committed to stopping the jet sweep.'],
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

  const plays = [
    {
      name: 'Over Front Alignment',
      desc: 'The strong-side shade alignment places the defensive line strength to the tight end side. The nose aligns in a 1-technique (shade on the center to the strong side), the 3-technique DT is to the strong side, the 5-technique DE is on the strong-side OT, and the weak DE aligns in a 9-technique (wide).',
      positions: ['    DE(9)   DT(1)  DT(3)  DE(5)', '  WLB        MLB        SLB', '   CB    FS       SS    CB', '      STRONG SIDE = TE side >>>'],
      notes: ['1-tech Nose: Control the A-gap to the strong side. 2-gap vs. zone.', '3-tech DT: Penetrate the B-gap. This is your primary pass rusher inside.', '5-tech DE: Set the edge, contain. Squeeze down on runs toward you.', '9-tech DE: Wide alignment. Speed rush and containment.'],
    },
    {
      name: 'Under Front Alignment',
      desc: 'The under front shifts the DL strength to the weak side. The 3-technique moves to the weak side, the nose aligns head-up on the center (0-tech), and the strong DE plays a 5-technique. This front is designed to create confusion about gap responsibilities for the offense.',
      positions: ['    DE(5)   DT(0)  DT(3)  DE(9)', '  SLB        MLB        WLB', '   CB    SS       FS    CB', '      <<< Weak-side 3-tech shift'],
      notes: ['0-tech Nose: Two-gap the center. Control both A-gaps.', '3-tech (weak): Penetrate the weak B-gap on pass downs.', '5-tech DE: Play the strong C-gap, set the edge on runs.', 'Shifts allow the defense to present different looks from the same personnel.'],
    },
    {
      name: 'Cover 3 (Base)',
      desc: 'The base coverage shell. Three deep defenders (2 CBs and FS) each cover a deep third of the field. Four underneath defenders (3 LBs and SS) handle the short zones. The free safety is the center-field player. Corners play with outside leverage and funnel receivers inside.',
      positions: ['  CB(deep 1/3)   FS(deep middle)   CB(deep 1/3)', '  SS(flat)  WLB(curl)  MLB(hook)  SLB(curl)', '         4 DL rush', '    3 deep / 4 under zones'],
      notes: ['FS: Align at 12-14 yards. Read the QB, break on the throw. You are the center fielder.', 'CBs: Jam at the line, sink to your deep third. Keep everything in front.', 'SS: Flat responsibility — match any #2 receiver to the flat.', 'LBs: Drop to curl/hook zones. Read QB eyes and break on the ball.'],
    },
    {
      name: 'Cover 1 (Robber)',
      desc: 'Man-free coverage with a twist. The free safety plays a "robber" role in the middle of the field, looking to undercut crossing routes and post routes. Corners play man coverage on the outside WRs, and LBs have man responsibilities on the RB and TE. The SS is man-to-man on the slot.',
      positions: ['  CB(man #1)         CB(man #1)', '         FS (robber - middle)', '  SS(man slot)  LBs(man RB/TE)', '         4 DL rush'],
      notes: ['FS: Play 10-12 yards deep, read the QB. Jump any crossers or post routes.', 'CBs: Press or off-man technique. Win your matchup on the outside.', 'LBs: Know your man assignment pre-snap. Carry vertical, pass off crossers.', 'The robber technique creates turnovers — the FS must be aggressive.'],
    },
    {
      name: 'Mike Fire Zone',
      desc: 'The middle linebacker (Mike) blitzes through the A-gap while the defensive end on his side drops into coverage to replace the vacated underneath zone. This is a 3-under, 3-deep fire zone concept that brings 5 rushers while maintaining 6 in coverage.',
      positions: ['   DE(drop)  DT  DT  DE(rush)', '  WLB(under)  MLB>>>BLITZ  SLB(under)', '  CB(deep 1/3) FS(deep mid) CB(deep 1/3)', '    5 rush / 3 deep / 3 under'],
      notes: ['MLB: Attack the A-gap at the snap. Get there fast.', 'DE (drop side): Drop to the curl/flat zone vacated by the blitzing LB.', '3-deep behind the blitz: FS middle, CBs deep thirds.', 'The key is disguise — do not tip the blitz pre-snap.'],
    },
    {
      name: 'Will Blitz',
      desc: 'The weak-side linebacker (Will) blitzes off the edge from the weak side. The strong safety rotates down to fill the coverage void left by the blitzing LB. The coverage behind it adjusts accordingly.',
      positions: ['   DE  DT  DT  DE', ' WLB>>>BLITZ   MLB   SLB', '  CB     SS(rotate down)  FS   CB', '    WLB off the weak-side edge'],
      notes: ['WLB: Time the snap, attack the outside shoulder of the OT.', 'SS: Rotate down to replace the WLBs zone responsibility.', 'FS: Shift to cover the middle of the field alone.', 'CB (weak side): May need to play more aggressive technique.'],
    },
    {
      name: 'Sam Blitz',
      desc: 'The strong-side linebacker (Sam) walks up to the line pre-snap and blitzes through the C-gap on the strong side. The corner presses, and the free safety plays over the top. Designed to disrupt strong-side runs and pressure the QB off the edge.',
      positions: ['   DE  DT  DT  DE', '  WLB   MLB   SLB>>>BLITZ', '  CB(press)     FS(over top)   CB', '    SLB attacks the C-gap'],
      notes: ['SLB: Walk up pre-snap, attack the C-gap outside the TE.', 'CB (strong): Press coverage. No safety help to your side — play tough.', 'FS: Shift to provide deep help over the strong-side CB.', 'DE (strong): Squeeze inside to create a lane for the SLB.'],
    },
    {
      name: 'Safety Blitz',
      desc: 'The strong safety fires off the edge from a walked-up position. The corner on the blitz side rotates to deep half, and the free safety rotates to the other deep half, creating a 2-deep shell behind the blitz. A surprise pressure look from secondary.',
      positions: ['   DE  DT  DT  DE', '  WLB   MLB   SLB', ' CB(deep half)  SS>>>BLITZ  CB', '    FS(deep half)'],
      notes: ['SS: Creep up late. Time the snap and attack.', 'CB (blitz side): At the snap, bail to your deep half.', 'FS: Rotate to the opposite deep half.', 'LBs: Play your zone responsibilities — no one else is blitzing.'],
    },
    {
      name: 'Zone Dog (Simulated Pressure)',
      desc: 'Four rushers come, but they are not the expected four. A defensive lineman drops into coverage while a linebacker replaces him in the rush. The offense sees 4-man pressure but cannot predict which 4 are coming. This confuses pass protection schemes.',
      positions: ['   DE(drop)  DT(rush)  DT(rush)  DE(rush)', '  WLB(rush)   MLB(drop)   SLB(drop)', '  CB(deep)     FS(deep)     CB(deep)', '    Different 4 rush, rest cover'],
      notes: ['DE (drop): At the snap, drop into the flat zone. Sell the rush first.', 'WLB: Replace the dropping DE in the pass rush. Attack his gap.', 'The offense cannot slide or combo block effectively against unknown rushers.', 'Excellent on 3rd-and-medium. Confuse the QB reads.'],
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

  const plays = [
    {
      name: 'Base 3-4 Alignment',
      desc: 'The foundation of the defense. The nose tackle aligns in a 0-technique (head-up on center) and two-gaps. The two defensive ends play 5-techniques (outside shoulder of the offensive tackles). The OLBs align on the edge, and the ILBs stack behind the DL, reading their keys.',
      positions: ['         DE(5)   NT(0)   DE(5)', '  OLB              ILB  ILB              OLB', '   CB      SS        FS      CB', '      0-tech nose anchors the front'],
      notes: ['NT: Head-up on the center. Two-gap technique — control the blocker and play both A-gaps.', 'DEs: 5-technique on the OTs. Set the edge and squeeze down on runs.', 'OLBs: Stand up on the edge. Walk up or drop based on the call.', 'ILBs: Stacked behind the DL. Read guards for run/pass keys.'],
    },
    {
      name: 'Cover 2 Zone',
      desc: 'Two deep safeties each cover a deep half of the field. Five defenders handle the underneath zones. The OLBs drop to the flat zones, ILBs handle the curl/hook areas, and the remaining underneath player (often the strong-side DE or a LB) covers the middle.',
      positions: ['  CB(flat/squat)         CB(flat/squat)', '    SS(deep half)     FS(deep half)', '  OLB(flat) ILB(curl) ILB(curl) OLB(flat)', '         3 DL rush'],
      notes: ['Safeties: Align at 12 yards. Cover your deep half, break downhill on throws.', 'CBs: Squat on short routes. Re-route the #1 receiver, then sink.', 'OLBs: Drop to the flat. Match any receiver who enters your zone.', 'Vulnerable to deep middle throws — need the DL to pressure quickly.'],
    },
    {
      name: 'Cover 3 Sky',
      desc: 'The strong safety rolls down into the flat to become an underneath defender, while the free safety shifts to deep center field. The two corners each play a deep third. This gives the defense an extra defender near the LOS while maintaining three-deep coverage.',
      positions: ['  CB(deep 1/3)    FS(deep mid)    CB(deep 1/3)', '     SS(roll to flat)  ILBs(curl/hook)', '  OLB(contain)   DL rush   OLB(rush/drop)', '    SS plays like an extra LB'],
      notes: ['SS: Roll down to the flat pre-snap or at the snap. Be aggressive against the run.', 'FS: You are the center fielder. Align at 14 yards, read QB, break on the throw.', 'CBs: Deep third. Keep everything in front of you.', 'This gives you an 8-man box against the run while staying in 3-deep.'],
    },
    {
      name: 'OLB Edge Rush',
      desc: 'Both outside linebackers rush off the edge at the snap, turning the 3-4 front into a simulated 5-man pressure look. The DL occupies blockers while the speed of the OLBs creates pressure from the outside. Coverage behind it adjusts to 3-under, 3-deep.',
      positions: ['  OLB>>>RUSH   DE   NT   DE   OLB>>>RUSH', '         ILB(drop)  ILB(drop)', '  CB(deep 1/3) FS(deep mid) CB(deep 1/3)', '    Both OLBs attack edges'],
      notes: ['OLBs: Attack outside shoulder of the OT. Use speed-to-power or dip-and-rip.', 'ILBs: Both drop to underneath zones — curl/hook areas.', 'DL: Occupy blockers. Do not let the OL slide to help on the edges.', 'This is the base 5-man pressure look. Everyone must know it.'],
    },
    {
      name: 'Double A-Gap Blitz',
      desc: 'Both inside linebackers creep toward the A-gaps before the snap and fire through them at the snap. This creates immediate interior pressure and chaos for the center and guards. The OLBs drop into coverage to maintain zone integrity behind the pressure.',
      positions: ['         DE   NT   DE', '  OLB(drop)  ILB>>A  A<<ILB  OLB(drop)', '  CB(man)     SS(deep)  FS(deep)     CB(man)', '    Both ILBs fire through A-gaps'],
      notes: ['ILBs: Walk up to the LOS pre-snap. Fire through the A-gaps at the snap.', 'NT: Slant to one side to create a lane for one of the ILBs.', 'OLBs: Drop to flat zones. You must cover what the ILBs left behind.', 'This puts extreme pressure on the center — he cannot block both.'],
    },
    {
      name: 'Safety Insert Blitz',
      desc: 'The free safety comes on a delayed blitz off the edge, attacking a gap vacated by the offensive line. The corner on that side rotates to deep coverage. This is an A-gap creeper look — the FS walks down late and inserts into the rush.',
      positions: ['         DE   NT   DE', '  OLB   ILB   ILB   OLB', '  CB(deep)  SS(deep)  FS>>>BLITZ  CB', '    FS inserts late from depth'],
      notes: ['FS: Creep up late. Time the snap count. Attack the open gap.', 'CB (blitz side): Rotate to deep responsibility at the snap.', 'SS: Shift to cover deep middle alone.', 'The late movement makes this nearly impossible to pick up pre-snap.'],
    },
    {
      name: 'Corner Blitz',
      desc: 'The cornerback blitzes from the slot side, attacking off the edge. The safety rotates to replace the corner in deep coverage. Man coverage is played behind the blitz. This is a highly aggressive call designed for passing downs.',
      positions: ['         DE   NT   DE', '  OLB   ILB   ILB   OLB', ' CB>>>BLITZ   SS(rotate deep)  FS  CB(man)', '    CB attacks from the slot side'],
      notes: ['CB: Time the snap, attack off the edge at full speed. Unblocked rusher.', 'SS: Rotate to deep coverage on the blitz side immediately.', 'FS: Cover the deep middle.', 'Man coverage behind it — everyone locks up their man.'],
    },
    {
      name: 'Overload Blitz',
      desc: 'Stack three rushers to one side of the formation: the OLB, an ILB, and the safety all attack from the same side. The offense cannot account for the extra rusher. The other ILB and OLB handle coverage responsibilities on the opposite side.',
      positions: ['         DE   NT   DE', '  OLB(drop)  ILB(drop)  ILB>>>  OLB>>>', '  CB          FS     SS>>>RUSH  CB', '    3 rushers from same side'],
      notes: ['OLB (rush side): Outside rush. Force the OT to commit.', 'ILB: Attack the B-gap on the overload side.', 'SS: Insert as the third rusher. Attack the open gap.', 'The offense must account for 3 from one side — slide protection breaks.'],
    },
    {
      name: 'Delayed ILB Blitz',
      desc: 'Both ILBs show blitz pre-snap by walking toward the LOS. At the snap, one drops into coverage while the other fires through on a delayed rush. The offensive line prepares for both, but one is a fake. This catches the QB off guard as the delayed rusher arrives late.',
      positions: ['         DE   NT   DE', '  OLB  ILB(show, drop)  ILB(show, rush late)  OLB', '  CB     SS     FS     CB', '    Show 2 blitzers, send 1 late'],
      notes: ['Both ILBs: Show blitz pre-snap. Sell the look.', 'Drop ILB: At the snap, bail to the hook/curl zone. Cover.', 'Rush ILB: Delay one count, then fire. The delayed timing gets home.', 'QB thinks the blitz was a fake, then the delayed rusher arrives.'],
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
      positions: ['K', 'L5  L4  L3  L2  L1  L1  L2  L3  L4  L5', '         S             S', '    Lanes squeeze return inside'],
      notes: ['L1 (contain): Force the return inside. Do not get hooked or sealed.', 'L2-L4 (lane runners): Stay in your lane. Squeeze laterally, tackle inside-out.', 'L3 (wedge buster): Attack the wedge. Disrupt the blocking scheme.', 'Safeties: Hang 15 yards behind the front. Clean up anything that breaks through.'],
    },
    {
      name: 'Kickoff Return (Wedge)',
      desc: 'A double-wedge formation at the 30-yard line creates a wall of blockers. The front wedge sets up 5 yards ahead of the rear wedge. The return man catches the kick and hits the seam between the two wedge lines, following the blockers upfield.',
      positions: ['          Return Man', '     W  W  W  (back wedge)', '   W  W  W  W  (front wedge)', 'Front line: block lanes outside'],
      notes: ['Front wedge: Set up at the 35. Block the first cover man in your lane.', 'Back wedge: Set up at the 30. Seal inside-out, create the crease.', 'Return man: Catch the ball, hit the seam at full speed. Trust the wedge.', 'Front line: Attack cover men aggressively. Do not let them get to your lane.'],
    },
    {
      name: 'Sideline Return (Wall)',
      desc: 'A wall of blockers forms along the boundary sideline. The return man catches the kick and follows the wall to the sideline, using the wall as a convoy of blockers. The wall sets at the 25-yard line and extends toward the numbers.',
      positions: ['          Return Man', '                    WALL >>>>', '   B  B  B  B  |  W  W  W  W', '    Blockers set the wall to the boundary'],
      notes: ['Wall blockers: Set the wall 5 yards from the sideline. Stay in front of the returner.', 'Return man: Catch, get to the wall, and run behind it.', 'Front-line blockers: Seal your man to the field side. Push them away from the wall.', 'The sideline is the extra defender — use it to your advantage.'],
    },
    {
      name: 'Punt Protection (Spread)',
      desc: 'The personal protector reads the defensive alignment and calls the protection. The wings on each side block the edge rushers. The interior linemen step to protect their gaps. The cover team releases after the punt to cover their lanes downfield.',
      positions: ['          Punter (15 yards deep)', '       PP (personal protector)', '  W  G  G  C  G  G  W', '  Cover team releases on the kick'],
      notes: ['PP: Read the rush. Identify any overloads and adjust protection.', 'Wings: Block the edge rusher. Do not let anyone clean off the edge.', 'Interior OL: Step to your gap, absorb the rush, then release to cover.', 'Punter: Catch, 2 steps, punt. Get the ball off in 2.0 seconds or less.'],
    },
    {
      name: 'Punt Return (Wall Return)',
      desc: 'Four blockers set a wall on the return side of the field. The return man catches the punt and hits the wall at full speed. The wall blockers maintain their blocks and run in front of the return man. The non-wall players hold up gunners and slow the coverage.',
      positions: ['          Return Man (catches punt)', '   W  W  W  W  <-- wall of 4 blockers', '  Jammers slow the coverage team', '    Return man follows the wall'],
      notes: ['Wall blockers: Set 10 yards from the sideline on the return side. Stay in front.', 'Return man: Catch the punt, get to the wall. Be decisive — hit it at speed.', 'Jammers: Hold up the gunners at the line. Give the wall time to set.', 'The first 10 yards of return determine the success. Quick decisions.'],
    },
    {
      name: 'Punt Block (Overload)',
      desc: 'Overload one side of the punt shield with extra rushers. The edge rusher on the overload side has a clean lane to block the punt. Interior players hold their gaps to prevent a fake. The block point is 5-7 yards in front of the punter.',
      positions: ['          Punter', '       PP', '  W  G  G  C  G  G  W', '  R  R  R  R  <-- overload rush', '    Edge rusher gets clean lane'],
      notes: ['Edge rusher: Full speed. Aim for the block point 7 yards in front of the punter.', 'Interior rushers: Attack your gap to create chaos and prevent a fake.', 'Safety: Stay back in case of a fake punt pass or run.', 'DO NOT rough the punter. Block the ball, not the kicker.'],
    },
    {
      name: 'FG / PAT Protection',
      desc: 'Standard 7-man front protection with the center, holder, and kicker in the backfield. The wings and guards form a pocket, blocking from the inside out. The operation must be completed in 1.3 seconds from snap to kick (HS timing).',
      positions: ['          Kicker', '        Holder (7 yards)', '          Center', '  W  G  G  C  G  G  W', '    Inside-out protection'],
      notes: ['Center: Clean snap to the holder. Hit him in the hands every time.', 'Holder: Catch, spot, and spin the laces forward. Quick hands.', 'Wings: Block the edge. Do not let anyone come clean off the outside.', 'Timing target: 1.3 seconds from snap to kick for field goals.'],
    },
    {
      name: 'FG Block (Edge Rush)',
      desc: 'Align wide outside the wing and attack the edge at the snap. The goal is to get penetration past the wing blocker and get your hands up in the kick lane. The interior defenders occupy blockers to prevent a slide to the edge.',
      positions: ['          Kicker', '        Holder', '  W  G  G  C  G  G  W', 'R >>>>                   <<<< R', '    Edge rushers get hands up'],
      notes: ['Edge rushers: Wide alignment. Attack outside the wing at full speed.', 'Get your hands up at the block point. Do not leave your feet.', 'Interior: Occupy blockers so they cannot help on the edge.', 'If the kick is up, rally to the ball in case of a miss or short kick.'],
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

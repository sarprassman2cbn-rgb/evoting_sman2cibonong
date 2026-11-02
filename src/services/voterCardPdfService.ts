import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Voter, SchoolSettings } from '../types/voting.ts';

export interface GeneratePdfOptions {
  fileName?: string;
  onProgress?: (current: number, total: number) => void;
  baseUrl?: string;
}

/**
 * Service to generate printable voter cards on A4 layout (8 cards per page: 2 cols x 4 rows)
 * using jsPDF and QRCode.
 */
export async function generateVoterCardsPdf(
  voters: Voter[],
  settings: SchoolSettings,
  options: GeneratePdfOptions = {}
): Promise<jsPDF> {
  const eligibleVoters = voters.filter(v => v.role !== 'admin');
  const total = eligibleVoters.length;
  const baseUrl = options.baseUrl || window.location.origin;

  // Initialize jsPDF in A4 Portrait mode, units in millimeters (mm)
  // A4 size: 210mm x 297mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  if (total === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text('Tidak ada data pemilih yang dipilih untuk dicetak.', 20, 20);
    return doc;
  }

  // Layout parameters (2 columns x 4 rows = 8 cards per A4 page)
  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 8;
  const marginY = 8;
  const colGap = 6;
  const rowGap = 5;
  const cols = 2;
  const rows = 4;
  const cardsPerPage = cols * rows;

  const cardWidth = (pageWidth - (marginX * 2) - colGap) / cols; // ~94mm
  const cardHeight = (pageHeight - (marginY * 2) - (rowGap * (rows - 1))) / rows; // ~66mm

  for (let i = 0; i < total; i++) {
    const voter = eligibleVoters[i];
    const indexOnPage = i % cardsPerPage;
    const pageNumber = Math.floor(i / cardsPerPage) + 1;

    // Add a new page if this is not the first card and starts a new page
    if (i > 0 && indexOnPage === 0) {
      doc.addPage('a4', 'portrait');
    }

    const colIndex = indexOnPage % cols;
    const rowIndex = Math.floor(indexOnPage / cols);

    const x = marginX + colIndex * (cardWidth + colGap);
    const y = marginY + rowIndex * (cardHeight + rowGap);

    // Pre-generate QR code as high-contrast base64 PNG data URL
    const loginUrl = `${baseUrl}?nis=${encodeURIComponent(voter.identitas)}&token=${encodeURIComponent(voter.token)}`;
    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(loginUrl, {
        margin: 1,
        width: 140,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
    } catch (err) {
      console.warn('QR code generation notice for voter', voter.identitas, err);
    }

    // --- DRAW CARD CONTAINER ---
    // Outer dashed guide border for cutting
    doc.setDrawColor(180, 190, 205); // slate-300
    doc.setLineDashPattern([2, 1.5], 0);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'S');

    // Reset line dash for solid shapes
    doc.setLineDashPattern([], 0);

    // Header Background Bar (Navy Blue)
    doc.setFillColor(15, 46, 89); // #0f2e59 Navy
    doc.roundedRect(x + 0.3, y + 0.3, cardWidth - 0.6, 12, 1.8, 1.8, 'F');
    // Square the bottom corners of header
    doc.rect(x + 0.3, y + 6, cardWidth - 0.6, 6.3, 'F');

    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('KARTU TANDA PEMILIH OSIS', x + 5, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(`${settings.school_name.toUpperCase()} · ${settings.academic_year}`, x + 5, y + 9);

    // Role Badge inside header (right-aligned)
    const roleLabel = voter.role === 'guru' ? 'GURU / STAF' : 'SISWA';
    doc.setFillColor(30, 58, 138); // Darker blue tag
    doc.roundedRect(x + cardWidth - 22, y + 2.5, 18, 4.5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(254, 240, 138); // Yellow gold
    doc.text(roleLabel, x + cardWidth - 13, y + 5.7, { align: 'center' });

    // --- VOTER INFORMATION (LEFT COLUMN) ---
    const contentX = x + 4;
    const contentY = y + 15;

    // Nama Pemilih Label & Value
    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.text('NAMA PEMILIH:', contentX, contentY + 2);

    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    // Truncate name if too long to prevent overlapping QR code
    const truncatedName = doc.splitTextToSize(voter.nama, cardWidth - 36);
    doc.text(truncatedName[0], contentX, contentY + 6);

    // Identitas (NIS/NIP) & Kelas
    doc.setTextColor(51, 65, 85); // slate-700
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const idLabel = voter.role === 'guru' ? 'NIP' : 'NIS';
    doc.text(`${idLabel}: ${voter.identitas}  |  ${voter.kelas_atau_jabatan}`, contentX, contentY + 10.5);

    // --- SECRET TOKEN BOX ---
    const tokenBoxY = contentY + 13.5;
    const tokenBoxWidth = cardWidth - 34;
    const tokenBoxHeight = 15;

    // Token background box
    doc.setFillColor(241, 245, 249); // slate-100
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.3);
    doc.roundedRect(contentX, tokenBoxY, tokenBoxWidth, tokenBoxHeight, 1.5, 1.5, 'FD');

    // Token Header inside box
    doc.setTextColor(71, 85, 105); // slate-600
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text('TOKEN RAHASIA (PIN LOGIN):', contentX + 3, tokenBoxY + 4);

    // Token Value (Big, spaced, bold courier/mono)
    doc.setTextColor(29, 78, 216); // blue-700
    doc.setFont('courier', 'bold');
    doc.setFontSize(12);
    // Add space between characters for easy reading
    const spacedToken = voter.token.split('').join(' ');
    doc.text(spacedToken, contentX + 3, tokenBoxY + 11.5);

    // --- QR CODE (RIGHT COLUMN) ---
    const qrSize = 22;
    const qrX = x + cardWidth - qrSize - 4;
    const qrY = contentY + 1;

    if (qrDataUrl) {
      doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.rect(qrX, qrY, qrSize, qrSize, 'S');

      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(4.8);
      doc.text('SCAN LOGIN CEPAT', qrX + qrSize / 2, qrY + qrSize + 2.5, { align: 'center' });
    }

    // --- FOOTER & CUT GUIDE ---
    const footerY = y + cardHeight - 3;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(x + 3, footerY - 3, x + cardWidth - 3, footerY - 3);

    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(5);
    doc.text('Asas LUBER JURDIL · Rahasiakan Token Anda', x + 4, footerY);

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5);
    doc.text('✂ Gunting di Garis', x + cardWidth - 4, footerY, { align: 'right' });

    // Update progress callback
    if (options.onProgress) {
      options.onProgress(i + 1, total);
    }
  }

  return doc;
}

/**
 * Helper to generate and trigger direct download of the PDF file
 */
export async function downloadVoterCardsPdf(
  voters: Voter[],
  settings: SchoolSettings,
  fileName?: string,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const defaultFileName = `KARTU_PEMILIH_OSIS_${settings.school_name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  const doc = await generateVoterCardsPdf(voters, settings, { onProgress });
  doc.save(fileName || defaultFileName);
}

/**
 * Helper to generate PDF and return a Blob URL for browser preview or iframe embedding
 */
export async function getVoterCardsPdfBlobUrl(
  voters: Voter[],
  settings: SchoolSettings,
  onProgress?: (current: number, total: number) => void
): Promise<string> {
  const doc = await generateVoterCardsPdf(voters, settings, { onProgress });
  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
}

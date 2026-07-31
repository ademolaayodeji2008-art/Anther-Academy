import { PDFDocument, rgb, degrees } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';

/**
 * Generate a PDF certificate with student name, course title, completion date
 * Returns buffer ready for upload
 */
export async function generateCertificatePDF(studentData) {
  const { full_name, course_title, completion_date, verification_code } = studentData;

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Register a font (using built-in fonts for simplicity)
  const page = pdfDoc.addPage([850, 1100]);
  const { width, height } = page.getSize();

  // Background color
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(1, 0.96, 0.93), // Light cream/off-white
    opacity: 1,
  });

  // Top border (Navy)
  page.drawRectangle({
    x: 0,
    y: height - 40,
    width,
    height: 40,
    color: rgb(44 / 255, 90 / 255, 160 / 255), // Navy (#2c5aa0)
  });

  // Bottom border (Gold)
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height: 30,
    color: rgb(255 / 255, 215 / 255, 0 / 255), // Gold (#ffd700)
  });

  // Logo/Academy name (top)
  page.drawText('ANTHER ACADEMY', {
    x: 50,
    y: height - 120,
    size: 48,
    color: rgb(44 / 255, 90 / 255, 160 / 255), // Navy
    font: pdfDoc.getFont('Helvetica-Bold'),
  });

  page.drawText('Professional Accounting Training', {
    x: 50,
    y: height - 160,
    size: 16,
    color: rgb(109 / 255, 113 / 255, 145 / 255), // Slate
    font: pdfDoc.getFont('Helvetica'),
  });

  // Decorative line
  page.drawLine({
    start: { x: 50, y: height - 180 },
    end: { x: width - 50, y: height - 180 },
    thickness: 2,
    color: rgb(255 / 255, 215 / 255, 0 / 255), // Gold
  });

  // Main title
  page.drawText('CERTIFICATE OF COMPLETION', {
    x: 50,
    y: height - 280,
    size: 44,
    color: rgb(44 / 255, 90 / 255, 160 / 255), // Navy
    font: pdfDoc.getFont('Helvetica-Bold'),
  });

  // Subtitle text
  page.drawText('This certifies that', {
    x: 50,
    y: height - 360,
    size: 18,
    color: rgb(0, 0, 0),
    font: pdfDoc.getFont('Helvetica'),
  });

  // Student name (prominently displayed)
  page.drawText(full_name, {
    x: 50,
    y: height - 440,
    size: 36,
    color: rgb(44 / 255, 90 / 255, 160 / 255), // Navy
    font: pdfDoc.getFont('Helvetica-Bold'),
  });

  // Underline for name
  page.drawLine({
    start: { x: 50, y: height - 455 },
    end: { x: width - 50, y: height - 455 },
    thickness: 1,
    color: rgb(255 / 255, 215 / 255, 0 / 255), // Gold
  });

  // Course completion text
  page.drawText('has successfully completed the course', {
    x: 50,
    y: height - 520,
    size: 16,
    color: rgb(0, 0, 0),
    font: pdfDoc.getFont('Helvetica'),
  });

  // Course title (highlighted)
  page.drawText(course_title, {
    x: 50,
    y: height - 570,
    size: 28,
    color: rgb(255 / 255, 215 / 255, 0 / 255), // Gold
    font: pdfDoc.getFont('Helvetica-Bold'),
  });

  // Completion details
  const completionText = `Completed on ${new Date(completion_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}`;

  page.drawText(completionText, {
    x: 50,
    y: height - 640,
    size: 14,
    color: rgb(109 / 255, 113 / 255, 145 / 255), // Slate
    font: pdfDoc.getFont('Helvetica'),
  });

  // Achievement text
  page.drawText(
    'This certificate recognizes the holder\'s commitment to professional development\nand mastery of practical accounting skills.',
    {
      x: 50,
      y: height - 720,
      size: 12,
      color: rgb(109 / 255, 113 / 255, 145 / 255), // Slate
      font: pdfDoc.getFont('Helvetica'),
      lineHeight: 18,
    }
  );

  // Verification code section
  page.drawRectangle({
    x: 50,
    y: height - 800,
    width: width - 100,
    height: 50,
    color: rgb(44 / 255, 90 / 255, 160 / 255),
    opacity: 0.1,
  });

  page.drawText('Verification Code:', {
    x: 70,
    y: height - 770,
    size: 12,
    color: rgb(109 / 255, 113 / 255, 145 / 255),
    font: pdfDoc.getFont('Helvetica-Bold'),
  });

  page.drawText(verification_code, {
    x: 70,
    y: height - 795,
    size: 18,
    color: rgb(44 / 255, 90 / 255, 160 / 255),
    font: pdfDoc.getFont('Helvetica-Bold'),
  });

  page.drawText('Verify at: anther-academy.com/verify/' + verification_code, {
    x: width - 50 - 280,
    y: height - 770,
    size: 10,
    color: rgb(109 / 255, 113 / 255, 145 / 255),
    font: pdfDoc.getFont('Helvetica'),
  });

  // Footer
  page.drawText(
    'Anther Academy • Professional Accounting Training • Practical Skills for Every Level',
    {
      x: 50,
      y: 50,
      size: 10,
      color: rgb(109 / 255, 113 / 255, 145 / 255),
      font: pdfDoc.getFont('Helvetica'),
    }
  );

  // Certificate number / Issue number (bottom right)
  page.drawText('Certificate ID: ' + verification_code, {
    x: width - 200,
    y: 50,
    size: 9,
    color: rgb(109 / 255, 113 / 255, 145 / 255),
    font: pdfDoc.getFont('Helvetica'),
  });

  // Save and return as buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Generate a unique verification code
 */
export function generateVerificationCode() {
  // Format: ANTH-XXXX-XXXX-XXXX (18 chars total)
  const uuid = uuidv4().replace(/-/g, '').toUpperCase();
  return `ANTH-${uuid.substring(0, 4)}-${uuid.substring(4, 8)}-${uuid.substring(8, 12)}`;
}

/**
 * Convert buffer to stream for Cloudinary upload
 */
export function bufferToStream(buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

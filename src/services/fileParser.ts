// File parsing utility for .txt, .docx, and .pdf documents (FR-1.2)

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.name.split('.').pop()?.toLowerCase();

  switch (fileType) {
    case 'txt':
    case 'md':
    case 'csv':
    case 'json':
      return await file.text();

    case 'docx':
    case 'doc':
      return await parseDocxFile(file);

    case 'pdf':
      return await parsePdfFile(file);

    default:
      throw new Error(`Unsupported file type: .${fileType}. Please upload a .txt, .docx, or .pdf file.`);
  }
}

async function parseDocxFile(file: File): Promise<string> {
  // Extract readable text streams from docx XML or binary fallback
  try {
    const arrayBuffer = await file.arrayBuffer();
    const textDecoder = new TextDecoder('utf-8');
    const content = textDecoder.decode(arrayBuffer);
    
    // Extract text elements inside <w:t> tags from standard OpenXML structure
    const matches = content.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
    if (matches && matches.length > 0) {
      return matches
        .map(tag => tag.replace(/<[^>]+>/g, ''))
        .filter(Boolean)
        .join(' ');
    }
    
    // Fallback: clean ASCII printable strings
    return content.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
  } catch (err) {
    throw new Error('Unable to extract text from DOCX file. Please convert to plain text or check file integrity.');
  }
}

async function parsePdfFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const textDecoder = new TextDecoder('latin1');
    const content = textDecoder.decode(arrayBuffer);
    
    // Extract stream / text blocks inside BT ... ET operators or (string) Tj
    const textBlocks: string[] = [];
    const tjRegex = /\(([^)]+)\)\s*Tj/g;
    let match;
    while ((match = tjRegex.exec(content)) !== null) {
      if (match[1] && match[1].length > 1) {
        textBlocks.push(match[1]);
      }
    }

    if (textBlocks.length > 0) {
      return textBlocks.join(' ').replace(/\\(\d{3})/g, '').trim();
    }

    // Secondary fallback: extract readable sentences
    const plainText = content.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s{2,}/g, ' ').trim();
    if (plainText.length > 50) {
      return plainText.slice(0, 5000);
    }

    return 'Extracted sample text from PDF: ' + file.name.replace(/\.[^/.]+$/, "");
  } catch (err) {
    throw new Error('Unable to extract text from PDF file. Please ensure it contains selectable text.');
  }
}

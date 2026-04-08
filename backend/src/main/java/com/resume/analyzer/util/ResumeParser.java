package com.resume.analyzer.util;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.extractor.WordExtractor;
import org.apache.poi.xwpf.usermodel.*;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
@Slf4j
public class ResumeParser {

    /**
     * Extract plain text from uploaded resume.
     * Uses file.getBytes() so the underlying stream stays intact for saving.
     */
    public String extractText(MultipartFile file) throws IOException {
        String originalName = file.getOriginalFilename();
        if (originalName == null) throw new IOException("Invalid file");

        String ext = originalName.toLowerCase();
        byte[] bytes = file.getBytes();   // <-- single read, no double-stream bug

        if (ext.endsWith(".pdf"))  return extractFromPdfBytes(bytes);
        if (ext.endsWith(".docx")) return extractFromDocxBytes(bytes);
        if (ext.endsWith(".doc"))  return extractFromDocBytes(bytes);
        if (ext.endsWith(".txt"))  return new String(bytes, StandardCharsets.UTF_8);
        throw new IOException("Unsupported file type. Please upload PDF, DOCX, DOC, or TXT.");
    }

    private String extractFromPdfBytes(byte[] bytes) throws IOException {
        try (PDDocument doc = Loader.loadPDF(bytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String text = stripper.getText(doc);
            if (text == null || text.isBlank()) {
                throw new IOException("Could not extract text from this PDF. It may be an image-based (scanned) PDF.");
            }
            return text;
        } catch (IOException e) {
            log.error("PDF extraction failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("PDF extraction error: {}", e.getMessage());
            throw new IOException("Failed to read PDF: " + e.getMessage());
        }
    }

    private String extractFromDocxBytes(byte[] bytes) throws IOException {
        try (ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
             XWPFDocument doc = new XWPFDocument(bais)) {
            StringBuilder sb = new StringBuilder();
            for (XWPFParagraph para : doc.getParagraphs()) {
                String t = para.getText();
                if (t != null && !t.isBlank()) sb.append(t).append("\n");
            }
            for (XWPFTable table : doc.getTables()) {
                for (XWPFTableRow row : table.getRows()) {
                    for (XWPFTableCell cell : row.getTableCells()) {
                        String t = cell.getText();
                        if (t != null && !t.isBlank()) sb.append(t).append(" ");
                    }
                    sb.append("\n");
                }
            }
            return sb.toString();
        } catch (Exception e) {
            log.error("DOCX extraction failed: {}", e.getMessage());
            throw new IOException("Failed to read DOCX: " + e.getMessage());
        }
    }

    private String extractFromDocBytes(byte[] bytes) throws IOException {
        try (ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
             HWPFDocument doc = new HWPFDocument(bais);
             WordExtractor extractor = new WordExtractor(doc)) {
            return extractor.getText();
        } catch (Exception e) {
            log.error("DOC extraction failed: {}", e.getMessage());
            throw new IOException("Failed to read DOC: " + e.getMessage());
        }
    }

    /** Heuristic: first 2-4 capitalized words that look like a name. */
    public String extractName(String resumeText) {
        if (resumeText == null || resumeText.isBlank()) return "Unknown";
        for (String line : resumeText.split("\n")) {
            line = line.trim();
            if (line.isBlank() || line.contains("@") || line.matches(".*\\d.*")) continue;
            if (line.length() < 3 || line.length() > 60) continue;
            if (line.toLowerCase().matches(".*(resume|curriculum|vitae|profile|summary|objective|education|experience|skills|declaration).*")) continue;
            String[] words = line.split("\\s+");
            if (words.length >= 2 && words.length <= 4) {
                boolean ok = true;
                for (String w : words) {
                    if (!w.isEmpty() && !Character.isUpperCase(w.charAt(0))) { ok = false; break; }
                }
                if (ok) return line;
            }
        }
        return "Unknown";
    }
}

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Generate PDF from a DOM element
 * @param {HTMLElement} element - The DOM element to capture
 * @param {string} fileName - Name of the generated file
 */
export const generatePDF = async (element, fileName = 'Vedic_Birth_Chart.pdf') => {
    if (!element) return;

    try {
        // Show loading cursor
        document.body.style.cursor = 'wait';

        // Capture the element
        const canvas = await html2canvas(element, {
            scale: 2, // Higher scale for better quality
            useCORS: true, // Allow loading cross-origin images if any
            logging: false,
            backgroundColor: '#0f172a' // Match app background
        });

        const imgData = canvas.toDataURL('image/png');

        // PDF setup
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        // Add subsequent pages if content is longer than one page
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        // Save
        pdf.save(fileName);

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again.');
    } finally {
        document.body.style.cursor = 'default';
    }
};

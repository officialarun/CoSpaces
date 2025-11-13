const PDFDocument = require('pdfkit');
const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');
const crypto = require('crypto');

class PDFGeneratorService {
  /**
   * Generate mock Shareholder Agreement PDF
   * @param {Object} data - { investor, spv, project, investmentAmount, equityPercentage }
   * @returns {Promise<String>} - Cloudinary URL of uploaded PDF
   */
  async generateShareholderAgreement(data) {
    try {
      const {
        investor,
        spv,
        project,
        investmentAmount,
        equityPercentage,
        numberOfShares,
        faceValuePerShare
      } = data;

      if (!investor || !spv || !project) {
        throw new Error('Missing required data for SHA generation');
      }

      logger.info('Generating Shareholder Agreement PDF', {
        investorId: investor._id || investor,
        spvId: spv._id || spv,
        projectId: project._id || project
      });

      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      // Collect PDF data as buffer
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      
      return new Promise((resolve, reject) => {
        doc.on('end', async () => {
          try {
            const pdfBuffer = Buffer.concat(chunks);
            
            // Calculate hash for integrity
            const hash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');
            
            // Upload to Cloudinary
            // Use 'auto' resource_type to let Cloudinary handle PDF detection
            // This allows direct viewing in browser unlike 'raw' which requires download
            const uploadResult = await new Promise((resolve, reject) => {
              cloudinary.uploader.upload_stream(
                {
                  folder: 'agreements/sha',
                  resource_type: 'auto', // Auto-detect resource type (allows viewing PDFs)
                  format: 'pdf',
                  public_id: `sha_${investor._id || investor}_${spv._id || spv}_${Date.now()}`,
                  tags: ['shareholder-agreement', 'esign'],
                  access_mode: 'public', // Ensure public access
                  type: 'upload' // Standard upload type
                },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              ).end(pdfBuffer);
            });

            // Generate URL that allows viewing in browser
            // If using raw, convert URL to allow viewing by replacing /raw/upload with /upload
            let viewableUrl = uploadResult.secure_url;
            if (uploadResult.resource_type === 'raw' || viewableUrl.includes('/raw/upload')) {
              // Convert raw upload URL to standard upload URL for viewing
              viewableUrl = viewableUrl.replace('/raw/upload/', '/upload/');
              // Add format explicitly for PDF viewing
              if (!viewableUrl.includes('.pdf')) {
                viewableUrl += '.pdf';
              }
            }

            logger.info('SHA PDF generated and uploaded to Cloudinary', {
              url: viewableUrl,
              originalUrl: uploadResult.secure_url,
              resourceType: uploadResult.resource_type,
              hash
            });

            resolve({
              url: viewableUrl, // Use viewable URL instead of raw URL
              publicId: uploadResult.public_id,
              hash
            });
          } catch (error) {
            logger.error('Failed to upload SHA PDF:', error);
            reject(error);
          }
        });

        doc.on('error', reject);

        // Generate PDF content
        this._generateSHAContent(doc, {
          investor,
          spv,
          project,
          investmentAmount,
          equityPercentage,
          numberOfShares,
          faceValuePerShare
        });

        // Finalize PDF
        doc.end();
      });
    } catch (error) {
      logger.error('Failed to generate Shareholder Agreement PDF:', error);
      throw error;
    }
  }

  /**
   * Generate PDF content
   * @private
   */
  _generateSHAContent(doc, data) {
    const {
      investor,
      spv,
      project,
      investmentAmount,
      equityPercentage,
      numberOfShares,
      faceValuePerShare
    } = data;

    // Helper to get name
    const getInvestorName = (inv) => {
      if (typeof inv === 'string') return 'Investor';
      if (inv.entityName) return inv.entityName;
      if (inv.firstName && inv.lastName) return `${inv.firstName} ${inv.lastName}`;
      if (inv.firstName) return inv.firstName;
      return inv.email || 'Investor';
    };

    const investorName = getInvestorName(investor);
    const spvName = spv.spvName || spv.name || 'SPV';
    const projectName = project.projectName || project.name || 'Project';

    // Header
    doc.fontSize(20).font('Helvetica-Bold')
      .text('SHAREHOLDER AGREEMENT', { align: 'center' });
    
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica')
      .text(`Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, { align: 'center' });
    
    doc.moveDown(2);

    // Parties
    doc.fontSize(14).font('Helvetica-Bold')
      .text('PARTIES', { underline: true });
    
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica')
      .text(`This Shareholder Agreement ("Agreement") is entered into on ${new Date().toLocaleDateString('en-IN')} between:`);
    
    doc.moveDown(1);
    doc.fontSize(12).font('Helvetica-Bold')
      .text('1. Investor:', { continued: true })
      .font('Helvetica')
      .text(` ${investorName}`);
    
    if (investor.email) {
      doc.fontSize(11).font('Helvetica')
        .text(`   Email: ${investor.email}`, { indent: 20 });
    }

    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica-Bold')
      .text('2. Special Purpose Vehicle:', { continued: true })
      .font('Helvetica')
      .text(` ${spvName}`);
    
    if (spv.registrationDetails?.cin) {
      doc.fontSize(11).font('Helvetica')
        .text(`   CIN: ${spv.registrationDetails.cin}`, { indent: 20 });
    }

    doc.moveDown(2);

    // Investment Details
    doc.fontSize(14).font('Helvetica-Bold')
      .text('INVESTMENT DETAILS', { underline: true });
    
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica')
      .text(`Project: ${projectName}`)
      .moveDown(0.3)
      .text(`Investment Amount: ₹${investmentAmount.toLocaleString('en-IN')}`)
      .moveDown(0.3)
      .text(`Equity Percentage: ${equityPercentage.toFixed(2)}%`);
    
    if (numberOfShares) {
      doc.moveDown(0.3)
        .text(`Number of Shares: ${numberOfShares.toLocaleString('en-IN')}`);
    }
    
    if (faceValuePerShare) {
      doc.moveDown(0.3)
        .text(`Face Value per Share: ₹${faceValuePerShare}`);
    }

    doc.moveDown(2);

    // Terms and Conditions
    doc.fontSize(14).font('Helvetica-Bold')
      .text('TERMS AND CONDITIONS', { underline: true });
    
    doc.moveDown(0.5);
    
    const terms = [
      '1. The Investor agrees to subscribe to equity shares in the SPV as specified above.',
      '2. The Investor acknowledges that this is a private placement and subject to applicable securities laws.',
      '3. The SPV shall maintain proper records of shareholding and issue share certificates in due course.',
      '4. This Agreement is subject to the Articles of Association and Memorandum of Association of the SPV.',
      '5. All disputes shall be subject to the jurisdiction of courts in India.',
      '6. This Agreement shall be governed by the laws of India.',
      '7. The Investor represents that they have received and reviewed all relevant documents.',
      '8. This Agreement may be executed in counterparts, each of which shall be deemed an original.'
    ];

    doc.fontSize(10).font('Helvetica')
      .text(terms.join('\n\n'), {
        lineGap: 2,
        paragraphGap: 5
      });

    doc.moveDown(2);

    // Signatures section
    doc.fontSize(14).font('Helvetica-Bold')
      .text('SIGNATURES', { underline: true });
    
    doc.moveDown(1.5);

    // Investor signature
    doc.fontSize(11).font('Helvetica-Bold')
      .text('INVESTOR:', { indent: 50 });
    
    doc.moveDown(2);
    doc.fontSize(11).font('Helvetica')
      .text('_________________________', { indent: 50 })
      .moveDown(0.3)
      .text(`${investorName}`, { indent: 50 })
      .moveDown(0.3)
      .text('Date: _______________', { indent: 50 });

    doc.moveDown(2);

    // SPV signature
    doc.fontSize(11).font('Helvetica-Bold')
      .text('SPECIAL PURPOSE VEHICLE:', { indent: 50 });
    
    doc.moveDown(2);
    doc.fontSize(11).font('Helvetica')
      .text('_________________________', { indent: 50 })
      .moveDown(0.3)
      .text(`Authorized Signatory, ${spvName}`, { indent: 50 })
      .moveDown(0.3)
      .text('Date: _______________', { indent: 50 });

    // Footer
    doc.fontSize(8).font('Helvetica')
      .fillColor('gray')
      .text(
        'This is a mock Shareholder Agreement generated automatically. For official use, please refer to the legally executed document.',
        { align: 'center' }
      );
  }

  /**
   * Calculate document hash
   * @param {Buffer} buffer - PDF buffer
   * @returns {String} - SHA-256 hash
   */
  calculateHash(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }
}

module.exports = new PDFGeneratorService();


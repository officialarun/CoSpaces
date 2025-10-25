const Document = require('../models/Document.model');

exports.uploadDocument = async (req, res, next) => {
  try {
    const { documentName, documentType, relatedEntity, file } = req.body;
    
    const document = await Document.create({
      documentName,
      documentType,
      relatedEntity,
      file,
      uploadedBy: req.user._id,
      status: 'generated',
      'auditTrail': [{
        action: 'Document uploaded',
        performedBy: req.user._id,
        ipAddress: req.ip
      }]
    });
    
    res.status(201).json({ success: true, data: { document } });
  } catch (error) {
    next(error);
  }
};

exports.getDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json({ success: true, data: { document } });
  } catch (error) {
    next(error);
  }
};

exports.downloadDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    await document.addAuditEntry('Document downloaded', req.user._id, null, req.ip);
    
    res.json({ success: true, data: { downloadUrl: document.file.storageUrl } });
  } catch (error) {
    next(error);
  }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (document.retention.legalHold || !document.retention.canDelete) {
      return res.status(400).json({ error: 'Document cannot be deleted' });
    }
    
    document.status = 'archived';
    await document.save();
    
    res.json({ success: true, message: 'Document archived' });
  } catch (error) {
    next(error);
  }
};

exports.initiateESign = async (req, res, next) => {
  try {
    const { signers } = req.body;
    
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: 'pending_signature',
          'eSign.required': true,
          'eSign.signers': signers,
          'eSign.initiatedAt': new Date(),
          'eSign.expiresAt': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      },
      { new: true }
    );
    
    res.json({ success: true, data: { document } });
  } catch (error) {
    next(error);
  }
};

exports.signDocument = async (req, res, next) => {
  try {
    const { signature } = req.body;
    
    const document = await Document.findById(req.params.id);
    const signerIndex = document.eSign.signers.findIndex(
      s => s.user && s.user.toString() === req.user._id.toString()
    );
    
    if (signerIndex === -1) {
      return res.status(403).json({ error: 'Not authorized to sign' });
    }
    
    document.eSign.signers[signerIndex].signed = true;
    document.eSign.signers[signerIndex].signedAt = new Date();
    document.eSign.signers[signerIndex].signature = signature;
    document.eSign.signers[signerIndex].ipAddress = req.ip;
    document.eSign.signers[signerIndex].userAgent = req.get('user-agent');
    
    const allSigned = document.eSign.signers.every(s => s.signed);
    if (allSigned) {
      document.status = 'fully_signed';
      document.eSign.signed = true;
      document.eSign.completedAt = new Date();
    } else {
      document.status = 'partially_signed';
    }
    
    await document.save();
    await document.addAuditEntry('Document signed', req.user._id, null, req.ip);
    
    res.json({ success: true, data: { document } });
  } catch (error) {
    next(error);
  }
};

exports.getSignStatus = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id).select('eSign status');
    res.json({ success: true, data: { document } });
  } catch (error) {
    next(error);
  }
};

exports.getAllDocuments = async (req, res, next) => {
  try {
    const { documentType, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (documentType) query.documentType = documentType;
    if (status) query.status = status;
    
    const documents = await Document.find(query)
      .populate('uploadedBy', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
      
    const count = await Document.countDocuments(query);
    
    res.json({
      success: true,
      data: { documents, totalPages: Math.ceil(count / limit), currentPage: page }
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyDocument = async (req, res, next) => {
  try {
    const { verificationNotes } = req.body;
    
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: 'verified',
          'verification.verified': true,
          'verification.verifiedBy': req.user._id,
          'verification.verifiedAt': new Date(),
          'verification.verificationNotes': verificationNotes
        }
      },
      { new: true }
    );
    
    res.json({ success: true, data: { document } });
  } catch (error) {
    next(error);
  }
};


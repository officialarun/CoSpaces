const AuditLog = require('../models/AuditLog.model');

exports.getAuditLogs = async (req, res, next) => {
  try {
    const {
      eventType,
      eventCategory,
      userId,
      startDate,
      endDate,
      severity,
      page = 1,
      limit = 50
    } = req.query;
    
    const logs = await AuditLog.queryLogs(
      { eventType, eventCategory, userId, startDate, endDate, severity, limit, skip: (page - 1) * limit }
    );
    
    const count = await AuditLog.countDocuments();
    
    res.json({
      success: true,
      data: { logs, totalPages: Math.ceil(count / limit), currentPage: page }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAuditLogById = async (req, res, next) => {
  try {
    const log = await AuditLog.findById(req.params.id)
      .populate('performedBy', 'email firstName lastName');
      
    if (!log) {
      return res.status(404).json({ error: 'Audit log not found' });
    }
    
    res.json({ success: true, data: { log } });
  } catch (error) {
    next(error);
  }
};

exports.getUserAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find({ performedBy: req.params.userId })
      .sort({ timestamp: -1 })
      .limit(100);
      
    res.json({ success: true, data: { logs } });
  } catch (error) {
    next(error);
  }
};

exports.getEntityAuditLogs = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;
    
    const logs = await AuditLog.find({
      'targetEntity.entityType': entityType,
      'targetEntity.entityId': entityId
    })
      .populate('performedBy', 'email firstName lastName')
      .sort({ timestamp: -1 })
      .limit(100);
      
    res.json({ success: true, data: { logs } });
  } catch (error) {
    next(error);
  }
};


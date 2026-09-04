import mongoose from 'mongoose';
import Report, { calculatePriority, wasteTypes, sizes, urgencies } from '../models/Report.js';

const requiredFields = ['reporterName', 'district', 'area', 'wasteType', 'size', 'urgency', 'description'];
const allowedReportFields = [...requiredFields, 'sensitiveLocation', 'location'];
const activeReportFilter = { $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }] };

const validateReportInput = (body) => {
  const errors = {};
  const values = { ...body };

  for (const field of requiredFields) {
    if (typeof values[field] === 'string') {
      values[field] = values[field].trim();
    }

    if (!values[field]) {
      errors[field] = `${field} is required.`;
    }
  }

  if (values.reporterName && (values.reporterName.length < 2 || values.reporterName.length > 50)) {
    errors.reporterName = 'Reporter name must be between 2 and 50 characters.';
  }

  if (values.area && values.area.length < 2) {
    errors.area = 'Area must be at least 2 characters.';
  }

  if (values.description && (values.description.length < 10 || values.description.length > 500)) {
    errors.description = 'Description must be between 10 and 500 characters.';
  }

  if (values.wasteType && !wasteTypes.includes(values.wasteType)) {
    errors.wasteType = 'Waste type is invalid.';
  }

  if (values.size && !sizes.includes(values.size)) {
    errors.size = 'Waste size is invalid.';
  }

  if (values.urgency && !urgencies.includes(values.urgency)) {
    errors.urgency = 'Urgency is invalid.';
  }

  if (values.sensitiveLocation !== undefined && typeof values.sensitiveLocation !== 'boolean') {
    errors.sensitiveLocation = 'Sensitive location must be true or false.';
  }

  if (values.location !== undefined) {
    const { latitude, longitude } = values.location || {};
    if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
      errors.location = 'Latitude must be between -90 and 90.';
    } else if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
      errors.location = 'Longitude must be between -180 and 180.';
    }
  }

  return { errors, values };
};

const createReport = async (req, res, next) => {
  try {
    const { errors, values } = validateReportInput(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: 'Please correct the highlighted fields.', errors });
    }

    const reportFields = Object.fromEntries(allowedReportFields.filter((field) => values[field] !== undefined).map((field) => [field, values[field]]));
    const sensitiveLocation = values.sensitiveLocation === true;
    const priority = calculatePriority({ ...values, sensitiveLocation });
    const report = await Report.create({ ...reportFields, sensitiveLocation, ...priority });

    return res.status(201).json({ success: true, data: report });
  } catch (error) {
    return next(error);
  }
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getReports = async (req, res, next) => {
  try {
    const { search, district, wasteType, priorityLevel, status, sort = 'newest' } = req.query;
    const query = { $and: [activeReportFilter] };

    if (search?.trim()) {
      const expression = new RegExp(escapeRegex(search.trim()), 'i');
      query.$and.push({ $or: [
        { area: expression },
        { district: expression },
        { description: expression },
        { wasteType: expression }
      ] });
    }

    if (district) query.district = district;
    if (wasteType) query.wasteType = wasteType;
    if (priorityLevel) query.priorityLevel = priorityLevel;
    if (status) query.status = status;

    const sortOption = sort === 'oldest'
      ? { createdAt: 1 }
      : sort === 'highestPriority'
        ? { priorityScore: -1, createdAt: -1 }
        : { createdAt: -1 };

    const reports = await Report.find(query).sort(sortOption).lean();
    return res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    return next(error);
  }
};

const getReportById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Report ID is invalid.' });
    }

    const report = await Report.findById(req.params.id).lean();
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    return res.json({ success: true, data: report });
  } catch (error) {
    return next(error);
  }
};

const getSummaryStats = async (req, res, next) => {
  try {
    const [totalReports, highPriorityReports, districts, resolvedReports] = await Promise.all([
      Report.countDocuments(activeReportFilter),
      Report.countDocuments({ ...activeReportFilter, priorityLevel: 'High' }),
      Report.distinct('district', activeReportFilter),
      Report.countDocuments({ ...activeReportFilter, status: 'Resolved' })
    ]);

    return res.json({
      success: true,
      data: {
        totalReports,
        highPriorityReports,
        districtCount: districts.length,
        resolvedReports
      }
    });
  } catch (error) {
    return next(error);
  }
};

export { createReport, getReports, getReportById, getSummaryStats };
import { AlertTriangle, CheckCircle2, Leaf, LocateFixed, RotateCcw, Send } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createReport } from '../services/api.js';
import sriLankanDistricts from '../data/sriLankanDistricts.js';

const initialForm = { reporterName: '', district: '', area: '', wasteType: '', size: '', urgency: '', sensitiveLocation: false, description: '', location: null };
const fieldMessages = {
  reporterName: 'Please enter your name.', district: 'Please select a district.', area: 'Please enter the area where the problem was found.',
  wasteType: 'Please select the type of waste.', size: 'Please select the waste size.', urgency: 'Please select the urgency.', description: 'Please describe the issue using at least 10 characters.'
};

const ReportIssue = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // Update controlled fields while preserving the rest of the form state.
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setSubmitError('');
  };

  // Request device coordinates only when the user chooses to share their location.
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Location is not supported by this browser.');
      return;
    }

    setIsLocating(true);
    setLocationMessage('Requesting your location...');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((current) => ({ ...current, location: { latitude: Number(coords.latitude.toFixed(6)), longitude: Number(coords.longitude.toFixed(6)) } }));
        setLocationMessage('Location added to this report.');
        setIsLocating(false);
      },
      () => {
        setLocationMessage('Location permission was not granted. You can continue without it.');
        setIsLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  // Check every required field before allowing a network request.
  const validateForm = () => {
    const nextErrors = {};
    if (!form.reporterName.trim()) nextErrors.reporterName = fieldMessages.reporterName;
    else if (form.reporterName.trim().length < 2 || form.reporterName.trim().length > 50) nextErrors.reporterName = 'Name must be between 2 and 50 characters.';
    if (!form.district) nextErrors.district = fieldMessages.district;
    if (!form.area.trim() || form.area.trim().length < 2) nextErrors.area = fieldMessages.area;
    if (!form.wasteType) nextErrors.wasteType = fieldMessages.wasteType;
    if (!form.size) nextErrors.size = fieldMessages.size;
    if (!form.urgency) nextErrors.urgency = fieldMessages.urgency;
    if (!form.description.trim() || form.description.trim().length < 10) nextErrors.description = fieldMessages.description;
    if (form.description.trim().length > 500) nextErrors.description = 'Description cannot exceed 500 characters.';
    return nextErrors;
  };

  // Send a valid report and expose only friendly messages when the API is unavailable.
  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const reportData = { ...form, reporterName: form.reporterName.trim(), area: form.area.trim(), description: form.description.trim() };
      if (!form.location) delete reportData.location;
      await createReport(reportData);
      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'We couldn\'t submit your report right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset all fields and messages for a fresh report.
  const clearForm = () => { setForm(initialForm); setErrors({}); setSubmitError(''); setLocationMessage(''); setIsSubmitted(false); };

  if (isSubmitted) return <section className="form-page"><div className="success-panel"><CheckCircle2 size={54} /><span className="eyebrow">Report received</span><h1>Thank you! Your waste report has been submitted successfully.</h1><p>Your report is now part of the CleanSL community record.</p><div className="form-actions"><Link className="button button-primary" to="/reports">View Community Reports</Link><button className="button button-secondary" type="button" onClick={clearForm}>Report Another Issue</button></div></div></section>;

  return <section className="form-page"><div className="form-header"><span className="eyebrow"><Leaf size={15} /> Community action</span><h1>Report a Waste Issue</h1><p>Help create cleaner Sri Lankan communities by reporting a local waste problem.</p></div><div className="form-layout"><form className="report-form" onSubmit={handleSubmit} noValidate>
    {/* Identity and location fields establish where the issue was observed. */}
    <div className="form-section"><h2>Where is the issue?</h2><div className="field-grid"><FormField label="Reporter Name" name="reporterName" value={form.reporterName} onChange={handleChange} error={errors.reporterName} placeholder="e.g. Community Member" /><FormField label="Area / Town" name="area" value={form.area} onChange={handleChange} error={errors.area} placeholder="e.g. Nugegoda" /><FormField label="District" name="district" value={form.district} onChange={handleChange} error={errors.district}><option value="">Select a district</option>{sriLankanDistricts.map((district) => <option value={district} key={district}>{district}</option>)}</FormField></div></div>
    {/* These values feed the backend priority calculation. */}
    <div className="form-section"><h2>What did you find?</h2><div className="field-grid"><FormField label="Waste Category" name="wasteType" value={form.wasteType} onChange={handleChange} error={errors.wasteType}><option value="">Select a category</option>{['Illegal Dumping', 'Overflowing Garbage', 'Plastic Waste', 'Organic Waste', 'Construction Waste', 'Hazardous Waste', 'Other'].map((type) => <option value={type} key={type}>{type}</option>)}</FormField><FormField label="Waste Size" name="size" value={form.size} onChange={handleChange} error={errors.size}><option value="">Select size</option>{['Small', 'Medium', 'Large'].map((size) => <option value={size} key={size}>{size}</option>)}</FormField><FormField label="Urgency" name="urgency" value={form.urgency} onChange={handleChange} error={errors.urgency}><option value="">Select urgency</option>{['Low', 'Medium', 'High'].map((urgency) => <option value={urgency} key={urgency}>{urgency}</option>)}</FormField></div><label className="checkbox-field"><input type="checkbox" name="sensitiveLocation" checked={form.sensitiveLocation} onChange={handleChange} /><span>Is this waste near a school, hospital, waterway or other sensitive place?</span></label></div>
    {/* Coordinates are optional and are shared only after explicit user action. */}
    <div className="form-section"><h2>Where exactly? <span className="optional-label">Optional</span></h2><p className="location-privacy">Adding your approximate coordinates can help future administrators understand where reports cluster. CleanSL does not require your location.</p><button className="button button-secondary location-button" type="button" onClick={useMyLocation} disabled={isLocating}><LocateFixed size={17} />{isLocating ? 'Finding location...' : form.location ? 'Update My Location' : 'Use My Location'}</button>{form.location && <p className="location-coordinates">Coordinates added: {form.location.latitude}, {form.location.longitude}</p>}{locationMessage && <p className="location-message" role="status">{locationMessage}</p>}</div>
    {/* Keep descriptions concise so reports remain easy to scan. */}
    <div className="form-section"><label className="field-label" htmlFor="description">Description</label><textarea id="description" name="description" value={form.description} onChange={handleChange} maxLength={500} rows={6} placeholder="Tell the community what happened and what is nearby." aria-invalid={Boolean(errors.description)} /> <div className="field-meta"><span className="field-error">{errors.description}</span><span>{form.description.length}/500</span></div></div>
    {submitError && <div className="form-error" role="alert"><AlertTriangle size={18} />{submitError}</div>}<div className="form-actions"><button className="button button-primary" type="submit" disabled={isSubmitting}><Send size={17} />{isSubmitting ? 'Submitting report...' : 'Submit Report'}</button><button className="button button-secondary" type="button" onClick={clearForm} disabled={isSubmitting}><RotateCcw size={17} />Clear Form</button></div>
  </form><aside className="priority-note"><AlertTriangle size={24} /><h2>How priority works</h2><p>CleanSL calculates a priority score from urgency, waste size, category and sensitive locations. The backend assigns a Low, Medium or High level automatically.</p></aside></div></section>;
};

// Render text and select controls through one accessible field component.
const FormField = ({ label, name, value, onChange, error, children, placeholder }) => <div className="field"><label className="field-label" htmlFor={name}>{label}</label>{children ? <select id={name} name={name} value={value} onChange={onChange} aria-invalid={Boolean(error)}>{children}</select> : <input id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} aria-invalid={Boolean(error)} />}{error && <span className="field-error">{error}</span>}</div>;

export default ReportIssue;

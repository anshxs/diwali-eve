'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase, Registration, GroupMember, PaymentVerification } from '@/lib/supabase';
import { uploadImageToGitHub } from '@/lib/github';
import { saveTicketToLocalStorage, generateTicketId, generateUPIPaymentUrl } from '@/lib/utils';
import { 
  Sparkles, 
  Calendar, 
  MapPin, 
  Users, 
  Phone, 
  Mail, 
  Camera,
  CheckCircle,
  Upload,
  QrCode
} from 'lucide-react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { AnimatedGradientText } from './ui/animated-gradient-text';

interface FormData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  parentHusbandMobile: string;
  registrationType: 'SINGLE' | 'GROUP';
  groupMembers: GroupMember[];
}

export default function RegistrationForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    parentHusbandMobile: '',
    registrationType: 'SINGLE',
    groupMembers: [
      { name: '', email: '', phone: '', date_of_birth: '' },
      { name: '', email: '', phone: '', date_of_birth: '' },
      { name: '', email: '', phone: '', date_of_birth: '' }
    ]
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketGenerated, setTicketGenerated] = useState<Registration | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateGroupMember = (index: number, field: keyof GroupMember, value: any) => {
    setFormData(prev => ({
      ...prev,
      groupMembers: prev.groupMembers.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const calculateAmount = () => {
    if (formData.registrationType === 'SINGLE') return 500;
    // For group pass, it's always 4 people (primary + 3 members) at ₹400 each
    return 4 * 400;
  };

  const generateQRCode = async () => {
    try {
      const amount = calculateAmount();
      const ticketId = sessionStorage.getItem('tempTicketId') || generateTicketId();
      
      // Generate UPI payment string
      const upiString = `upi://pay?pa=8439100899@fam&pn=Shree%20Garden&am=${amount}&cu=INR&tn=Diwali%20Night%202025%20-%20${formData.registrationType}%20Pass%20-%20${ticketId}`;
      
      // Generate QR code
      const qrCodeDataURL = await QRCode.toDataURL(upiString, {
        width: 192,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeUrl(qrCodeDataURL);
      
      // Store ticket ID for later use
      if (!sessionStorage.getItem('tempTicketId')) {
        sessionStorage.setItem('tempTicketId', ticketId);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  // Generate QR code whenever registration type changes
  useEffect(() => {
    if (currentStep === 2) {
      generateQRCode();
    }
  }, [formData.registrationType, currentStep]);

  const handlePayment = () => {
    const amount = calculateAmount();
    const ticketId = sessionStorage.getItem('tempTicketId') || generateTicketId();
    const upiUrl = generateUPIPaymentUrl(amount, ticketId);
    
    // Store ticket ID temporarily for screenshot upload
    sessionStorage.setItem('tempTicketId', ticketId);
    
    // Open UPI app
    window.location.href = upiUrl;
  };

  const handleScreenshotUpload = async (file: File) => {
    setPaymentScreenshot(file);
  };

  const submitRegistration = async () => {
    if (!paymentScreenshot) {
      alert('Please upload payment screenshot');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const ticketId = sessionStorage.getItem('tempTicketId') || generateTicketId();
      
      // Upload screenshot to GitHub
      const screenshotUrl = await uploadImageToGitHub(paymentScreenshot, ticketId);
      
      // Prepare registration data
      const registration: Registration = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        date_of_birth: formData.dateOfBirth,
        parent_husband_mobile: formData.parentHusbandMobile,
        registration_type: formData.registrationType,
        group_members: formData.registrationType === 'GROUP' ? formData.groupMembers : undefined,
        ticket_id: ticketId
      };

      // Save to Supabase
      const { data: registrationData, error: regError } = await supabase
        .from('registrations')
        .insert([registration])
        .select()
        .single();

      if (regError) throw regError;

      // Save payment verification
      const paymentVerification: PaymentVerification = {
        ticket_id: ticketId,
        payment_screenshot_url: screenshotUrl,
        verified: false
      };

      const { error: paymentError } = await supabase
        .from('payment_verifications')
        .insert([paymentVerification]);

      if (paymentError) throw paymentError;

      // Save to local storage
      saveTicketToLocalStorage(registrationData);
      
      setTicketGenerated(registrationData);
      setCurrentStep(4);
      
      // Clear session storage
      sessionStorage.removeItem('tempTicketId');
      
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex justify-center items-center gap-2 mb-1">
            {/* <Sparkles className="text-yellow-500 w-8 h-8" /> */}
            <h1 className="text-4xl font-bold text-gray-800"><AnimatedGradientText>Diwali Night 2025</AnimatedGradientText></h1>
            {/* <Sparkles className="text-yellow-500 w-8 h-8" /> */}
          </div>
          <p className="text-lg text-gray-700 font-medium">Let's Glow Up Together!</p>
          <div className="mt-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 max-w-2xl mx-auto border">
            <p className="text-gray-700"><strong>16th October 2025</strong> at <strong>Shree Garden, Roorkee</strong></p>
            <p className="text-gray-700"><strong>6 PM</strong> • <strong>Dress Code: Traditional</strong></p>
          </div>
        </div>

        {/* Event Details */}
        <div className="bg-amber-50/50 rounded-2xl p-6 mb-4 border">
          <div className="grid md:grid-cols-2 gap-6">
            {/* <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="text-orange-500 w-5 h-5" />
                <span className="font-semibold">16th October 2025, 6 PM onwards</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="text-red-500 w-5 h-5" />
                <span className="font-semibold">Shree Garden, Roorkee</span>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg mt-4">
                <p className="text-sm font-semibold text-orange-800">👗 Dress Code: Traditional</p>
              </div>
            </div> */}
            <div>
              <h3 className="font-bold text-lg mb-3">🎉 What's Included:</h3>
              <ul className="text-sm space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                  <strong>DJ Night</strong> - Live Performance
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                  <strong>Unlimited Food & Mocktails</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  <strong>Fun Activities</strong> All Evening
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                  <strong>Insta-worthy</strong> Photo Moments
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-gray-50 border rounded-2xl px-4 py-4 mb-8">
          <h3 className="text-2xl font-bold text-center mb-3">Entry Passes</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-6 border border-gray-200 rounded-xl hover:border-orange-400 transition-colors">
              <h4 className="font-bold text-xl mb-2">Single Entry</h4>
              <p className="text-2xl font-bold text-orange-500 mb-1">₹500</p>
              <p className="text-sm text-gray-600">Per person</p>
              {/* <div className="mt-3 text-xs text-gray-500">
                ✅ All inclusions
              </div> */}
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-xl hover:border-green-400 transition-colors relative">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-2 py-1 rounded-full text-[8px] font-bold">
                SAVE ₹400
              </div>
              <h4 className="font-bold text-xl mb-2">Group Registration</h4>
              <p className="text-3xl font-bold text-green-500 mb-1">₹1,600</p>
              <p className="text-xs text-gray-600">For 4 people (₹400 each)</p>
              {/* <div className="mt-3 text-xs text-gray-500">
                ✅ All inclusions for 4 people
              </div> */}
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-yellow-50/20 border rounded-2xl py-8 px-4">
          {currentStep === 1 && (
            <div>
              <h3 className="text-2xl font-bold mb-6">Registration Details</h3>
              
              {/* Registration Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Registration Type *</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className={`p-4 border-2 rounded-xl text-center font-medium transition-colors ${
                      formData.registrationType === 'SINGLE' 
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                    onClick={() => handleInputChange('registrationType', 'SINGLE')}
                  >
                    Single Pass
                  </button>
                  <button
                    type="button"
                    className={`p-4 border-2 rounded-xl text-center font-medium transition-colors ${
                      formData.registrationType === 'GROUP' 
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                    onClick={() => handleInputChange('registrationType', 'GROUP')}
                  >
                    Group Pass
                  </button>
                </div>
              </div>

              {/* Primary Registrant Details */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Parent/Husband Mobile Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={formData.parentHusbandMobile}
                    onChange={(e) => handleInputChange('parentHusbandMobile', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Group Members */}
              {formData.registrationType === 'GROUP' && (
                <div className="mb-6">
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Group Members (3 Required)
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">Please fill details for all 3 group members</p>
                  </div>
                  
                  {formData.groupMembers.map((member, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                      <h5 className="font-medium mb-4 text-orange-600">Member {index + 1}</h5>
                      <div className="grid md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Full Name *"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          value={member.name}
                          onChange={(e) => updateGroupMember(index, 'name', e.target.value)}
                          required
                        />
                        <input
                          type="email"
                          placeholder="Email *"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          value={member.email}
                          onChange={(e) => updateGroupMember(index, 'email', e.target.value)}
                          required
                        />
                        <input
                          type="tel"
                          placeholder="Phone Number *"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          value={member.phone}
                          onChange={(e) => updateGroupMember(index, 'phone', e.target.value)}
                          required
                        />
                        <input
                          type="date"
                          placeholder="Date of Birth *"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          value={member.date_of_birth}
                          onChange={(e) => updateGroupMember(index, 'date_of_birth', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    // Validate form before proceeding
                    if (!formData.name || !formData.email || !formData.phone || !formData.dateOfBirth || !formData.parentHusbandMobile) {
                      alert('Please fill all required fields');
                      return;
                    }
                    
                    if (formData.registrationType === 'GROUP') {
                      const incompleteMembers = formData.groupMembers.filter(member => 
                        !member.name || !member.email || !member.phone || !member.date_of_birth
                      );
                      if (incompleteMembers.length > 0) {
                        alert('Please fill all group member details (all 3 members are required)');
                        return;
                      }
                    }
                    
                    setCurrentStep(2);
                    // Generate QR code when moving to payment step
                    setTimeout(() => generateQRCode(), 100);
                  }}
                  className="px-8 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105"
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-6">Payment</h3>
              <div className="bg-yellow-50/50 rounded-xl p-6 mb-6">
                <p className="text-lg font-semibold mb-2">Total Amount</p>
                <p className="text-3xl font-bold text-green-600">₹{calculateAmount()}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {formData.registrationType === 'SINGLE' ? 'Single Pass (1 person)' : 
                   'Group Pass (4 people - ₹400 each)'}
                </p>
              </div>

              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowQR(!showQR)}
                  className="flex items-center gap-2 mx-auto px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-blue-600 transition-colors mb-4"
                >
                  <QrCode className="w-5 h-5" />
                  {showQR ? 'Hide QR Code' : 'Show QR Code'}
                </button>

                {showQR && (
                  <div className="bg-white p-6 rounded-lg border-2 border-gray-200 inline-block">
                    <div className="text-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-800">Scan to Pay</h4>
                      <p className="text-2xl font-bold text-green-600">₹{calculateAmount()}</p>
                      <p className="text-sm text-gray-600">
                        {formData.registrationType === 'SINGLE' ? 'Single Pass' : 'Group Pass (4 people)'}
                      </p>
                    </div>
                    <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                      {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="UPI Payment QR Code" className="w-full h-full object-contain rounded-lg" />
                      ) : (
                        <div className="text-gray-500">Generating QR Code...</div>
                      )}
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">UPI ID: 8439100899@fam</p>
                      <p className="text-xs text-gray-500 mt-1">Shree Garden, Roorkee</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handlePayment}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105 text-lg"
                >
                  Pay Now via UPI
                </button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">Already completed payment?</p>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-black transition-colors"
                  >
                    Verify Payment
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-6">Upload Payment Screenshot</h3>
              <div className="mb-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-orange-500 transition-colors">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Upload your payment screenshot for verification</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleScreenshotUpload(e.target.files[0])}
                    className="hidden"
                    id="screenshot-upload"
                  />
                  <label
                    htmlFor="screenshot-upload"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    Choose File
                  </label>
                  {paymentScreenshot && (
                    <p className="text-green-600 mt-4 font-medium">
                      ✓ {paymentScreenshot.name} uploaded
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={submitRegistration}
                disabled={!paymentScreenshot || isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {isSubmitting ? 'Processing...' : 'Complete Registration'}
              </button>
            </div>
          )}

          {currentStep === 4 && ticketGenerated && (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-600 mb-4">Registration Successful!</h3>
              
              <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-xl p-6 mb-6">
                <h4 className="text-xl font-bold mb-4">Your Ticket ID</h4>
                <p className="text-2xl font-bold text-orange-600 mb-4">{ticketGenerated.ticket_id}</p>
                <p className="text-sm text-gray-600">Please save this ticket ID for your records</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 text-sm">
                  <strong>Important:</strong> Your payment is under verification. You will receive a confirmation email once verified. Please keep your payment screenshot safe.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    dateOfBirth: '',
                    parentHusbandMobile: '',
                    registrationType: 'SINGLE',
                    groupMembers: [
                      { name: '', email: '', phone: '', date_of_birth: '' },
                      { name: '', email: '', phone: '', date_of_birth: '' },
                      { name: '', email: '', phone: '', date_of_birth: '' }
                    ]
                  });
                  setPaymentScreenshot(null);
                  setTicketGenerated(null);
                }}
                className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
              >
                Register Another Person
              </button>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl border p-6 mt-8">
          <h3 className="text-xl font-bold mb-4 text-center">For Further Queries</h3>
          <div className="grid md:grid-cols-2 gap-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Phone className="w-5 h-5 text-green-500" />
              <span>+918439100899</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-5 h-5 text-blue-500" />
              <span>shreegarden.roorkee@gmail.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
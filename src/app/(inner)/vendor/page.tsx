"use client";
import React, { useEffect, useState } from "react";
import HeaderOne from "@/components/header/HeaderOne";
import ShortService from "@/components/service/ShortService";
import FooterOne from "@/components/footer/FooterOne";
import { Card } from "react-bootstrap";
import HeaderThree from "@/components/header/HeaderThree";

export default function Home() {
  const [step, setStep] = useState(1);
  const [isUploadingAadhar, setIsUploadingAadhar] = useState(false);
  const [isUploadingPan, setIsUploadingPan] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // form data state
  const [formData, setFormData] = useState({
    vendorName: "",
    email: "",
    phone: "",
    address: "",
    gstNo: "",
    aadhar: "",
    pan: "",
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Stepper configuration (3 steps: Basic, KYC, Verify)
  const labels = ["Basic Details", "KYC", "Verify"];
  const progress = ((step - 1) / (labels.length - 1)) * 100;

  // NOTE: Plans removed — no plan selection needed

  // Upload KYC document to backend and return URL
  const uploadKyc = async (file: File): Promise<string | null> => {
    try {
      const fd = new FormData();
      fd.append("document", file);
      const res = await fetch(
        "http://localhost:8080/v1/api/upload/kyc-document",
        { method: "POST", body: fd }
      );
      const json = await res.json();
      if (json?.success && json?.data?.url) return json.data.url as string;
      return null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.aadhar || !formData.pan) {
      alert("Please upload both Aadhar and PAN before submitting.");
      return;
    }
    if (!agreeToTerms) {
      alert(
        "Please agree to the vendor terms and conditions before submitting."
      );
      return;
    }
    try {
      setIsSubmitting(true);
      const payload: any = {
        vendorName: formData.vendorName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        gstNo: formData.gstNo || undefined,
        aadharUrl: formData.aadhar,
        panUrl: formData.pan,
      };

      const res = await fetch("http://localhost:8080/v1/api/vendors/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json?.success) {
        setShowSuccess(true);
      } else {
        const backendMsg = Array.isArray(json?.errorMessages)
          ? json.errorMessages.map((e: any) => e.message).join("\n")
          : json?.message;
        alert(backendMsg || "Failed to submit application");
      }
    } catch (err) {
      alert("Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success Screen Component
  const SuccessScreen = () => (
    <div className="text-center py-5" style={{ minHeight: '60vh' }}>
      <style jsx>{`
        @keyframes checkmark {
          0% {
            transform: scale(0) rotate(45deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(45deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(45deg);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
          }
          70% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(40, 167, 69, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes confetti {
          0% {
            transform: rotateZ(15deg) rotateY(0deg) translate(0, 0);
          }
          25% {
            transform: rotateZ(5deg) rotateY(360deg) translate(-5px, -50px);
          }
          50% {
            transform: rotateZ(15deg) rotateY(720deg) translate(5px, -100px);
          }
          75% {
            transform: rotateZ(5deg) rotateY(1080deg) translate(-5px, -150px);
          }
          100% {
            transform: rotateZ(15deg) rotateY(1440deg) translate(0, -200px);
          }
        }
        
        .success-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(135deg, #28a745, #20c997);
          margin: 0 auto 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 2s infinite;
          position: relative;
          overflow: hidden;
        }
        
        .success-circle::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: rotate(45deg);
          animation: shine 3s ease-in-out infinite;
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
          100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
        }
        
        .checkmark {
          width: 25px;
          height: 45px;
          border: 4px solid white;
          border-top: none;
          border-left: none;
          transform: rotate(45deg);
          animation: checkmark 0.8s ease-in-out 0.3s both;
          position: relative;
          z-index: 1;
        }
        
        .success-content {
          animation: fadeInUp 0.8s ease-out 0.5s both;
        }
        
        .success-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #28a745;
          margin-bottom: 15px;
          background: linear-gradient(135deg, #28a745, #20c997);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .success-subtitle {
          font-size: 1.2rem;
          color: #6c757d;
          margin-bottom: 20px;
          line-height: 1.6;
        }
        
        .success-message {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          border-left: 4px solid #28a745;
          padding: 25px;
          border-radius: 10px;
          margin: 30px 0;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .success-details {
          background: white;
          padding: 25px;
          border-radius: 15px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          margin: 30px 0;
          border: 1px solid #e9ecef;
        }
        
        .icon-item {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .icon-item:hover {
          background: #e9ecef;
          transform: translateX(5px);
        }
        
        .icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #007bff, #0056b3);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          color: white;
          font-size: 16px;
        }
        
        .action-buttons {
          animation: fadeInUp 0.8s ease-out 1s both;
        }
        
        .btn-primary-gradient {
          background: linear-gradient(135deg, #007bff, #0056b3);
          border: none;
          color: white;
          padding: 12px 30px;
          border-radius: 50px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,123,255,0.3);
        }
        
        .btn-primary-gradient:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,123,255,0.4);
          background: linear-gradient(135deg, #0056b3, #004085);
        }
        
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          background: #ff6b6b;
          animation: confetti 3s ease-in-out infinite;
        }
        
        .confetti:nth-child(1) { background: #ff6b6b; left: 10%; animation-delay: 0s; }
        .confetti:nth-child(2) { background: #4ecdc4; left: 20%; animation-delay: 0.5s; }
        .confetti:nth-child(3) { background: #45b7d1; left: 30%; animation-delay: 1s; }
        .confetti:nth-child(4) { background: #96ceb4; left: 40%; animation-delay: 1.5s; }
        .confetti:nth-child(5) { background: #ffeaa7; left: 50%; animation-delay: 2s; }
        .confetti:nth-child(6) { background: #fd79a8; left: 60%; animation-delay: 2.5s; }
        .confetti:nth-child(7) { background: #fdcb6e; left: 70%; animation-delay: 3s; }
        .confetti:nth-child(8) { background: #6c5ce7; left: 80%; animation-delay: 3.5s; }
        .confetti:nth-child(9) { background: #a29bfe; left: 90%; animation-delay: 4s; }
      `}</style>
      
      {/* Confetti Animation */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {[...Array(9)].map((_, i) => (
          <div key={i} className="confetti" />
        ))}
      </div>
      
      {/* Success Icon */}
      <div className="success-circle">
        <div className="checkmark" />
      </div>
      
      {/* Success Content */}
      <div className="success-content">
        <h1 className="success-title">Application Submitted Successfully!</h1>
        <p className="success-subtitle">
          Thank you for choosing to become a vendor with us.
        </p>
        
        <div className="success-message">
          <div className="d-flex align-items-center mb-3">
            <div className="icon-wrapper me-3">
              <i className="fa fa-clock" />
            </div>
            <div>
              <h5 className="mb-1 text-start">What happens next?</h5>
              <p className="mb-0 text-muted text-start">
                We will review your submission and get back to you soon
              </p>
            </div>
          </div>
        </div>
        
        <div className="success-details">
          <h5 className="mb-4 text-dark">Application Timeline</h5>
          
          <div className="icon-item">
            <div className="icon-wrapper">
              <i className="fa fa-check" />
            </div>
            <div className="text-start">
              <strong>Application Received</strong>
              <div className="text-muted small">Your vendor application has been successfully submitted</div>
            </div>
          </div>
          
          <div className="icon-item">
            <div className="icon-wrapper">
              <i className="fa fa-search" />
            </div>
            <div className="text-start">
              <strong>Under Review</strong>
              <div className="text-muted small">Our team will review your documents and information (2-3 business days)</div>
            </div>
          </div>
          
          <div className="icon-item">
            <div className="icon-wrapper">
              <i className="fa fa-envelope" />
            </div>
            <div className="text-start">
              <strong>Email Notification</strong>
              <div className="text-muted small">You'll receive an email at <strong>{formData.email}</strong> with the decision</div>
            </div>
          </div>
          
          <div className="icon-item">
            <div className="icon-wrapper">
              <i className="fa fa-store" />
            </div>
            <div className="text-start">
              <strong>Account Activation</strong>
              <div className="text-muted small">Upon approval, your vendor account will be activated</div>
            </div>
          </div>
        </div>
        
        <div className="action-buttons">
          <button 
            className="btn btn-primary-gradient me-3"
            onClick={() => window.location.href = 'http://localhost:3001'}
          >
            <i className="fa fa-tachometer-alt me-2" />
            Go to Dashboard
          </button>
          <button 
            className="btn mt-4 btn-outline-secondary"
            onClick={() => window.location.href = '/'}
          >
            <i className="fa fa-home  me-2" />
            Back to Home
          </button>
        </div>
        
        <div className="mt-4 p-3 border rounded" style={{ background: '#f8f9fa' }}>
          <small className="text-muted">
            <i className="fa fa-info-circle me-2" />
            Need help? Contact our support team at{' '}
            <a href="mailto:support@bigsell.com" className="text-primary">
              support@bigsell.com
            </a>{' '}
            or call{' '}
            <a href="tel:+1234567890" className="text-primary">
+91 94722 10440            </a>
          </small>
        </div>
      </div>
    </div>
  );

  return (
    <div className="demo-one">
      <HeaderThree />

      {/* Breadcrumb */}
      <div className="rts-navigation-area-breadcrumb bg_light-1 py-3 mb-4">
        <div className="container">
          <div className="navigator-breadcrumb-wrapper">
            <a href="/" className="text-muted">
              Home
            </a>
            <i className="fa-regular fa-chevron-right mx-2 text-muted" />
            <span className="fw-semibold">Become Vendor</span>
          </div>
        </div>
      </div>

      <div className="track-order-area rts-section-gap">
        <div className="container-2">
          <div className="row justify-content-center">
            <div className="col-lg-9">
              {/* Progress Stepper */}
              <div className="progress my-4" style={{ height: "6px" }}>
                <div
                  className="progress-bar bg-dark"
                  role="progressbar"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="d-flex justify-content-between text-center mb-4">
                {labels.map((label, idx) => (
                  <div key={idx} className="flex-fill">
                    <div
                      className={`rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center ${
                        step === idx + 1
                          ? "bg-dark text-white"
                          : "bg-light border"
                      }`}
                      style={{ width: 40, height: 40 }}
                    >
                      {idx + 1}
                    </div>
                    <small
                      className={
                        step === idx + 1 ? "fw-bold text-dark" : "text-muted"
                      }
                    >
                      {label}
                    </small>
                  </div>
                ))}
              </div>

              {/* Show Success Screen or Step Forms */}
              {showSuccess ? (
                <div className="card p-5 shadow-lg border-0 rounded-4">
                  <SuccessScreen />
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="card p-5 shadow-lg border-0 rounded-4"
                >
                {/* Step 1: Basic Details */}
                {step === 1 && (
                  <>
                    <div className="row">
                      <div className="col-md-6 mb-4">
                        <label className="form-label form-label text-dark text-s">
                          Vendor Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="vendorName"
                          value={formData.vendorName}
                          onChange={handleChange}
                          required
                          style={{
                            textTransform: "capitalize",
                            borderRadius: "10px",
                            border: "1px solid #7777",
                            padding: "6px",
                          }}
                        />
                      </div>
                      <div className="col-md-6 mb-4">
                        <label className="form-label form-label text-dark text-s">
                          Email
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          style={{
                            borderRadius: "10px",
                            border: "1px solid #7777",
                            padding: "6px",
                          }}
                        />
                      </div>
                      <div className="col-md-6 mb-4">
                        <label className="form-label form-label text-dark text-s">
                          Phone
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          style={{
                            textTransform: "capitalize",
                            borderRadius: "10px",
                            border: "1px solid #7777",
                            padding: "6px",
                          }}
                        />
                      </div>
                      <div className="col-md-6 mb-4">
                        <label className="form-label form-label text-dark text-s">
                          GST No.
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="gstNo"
                          value={formData.gstNo}
                          onChange={handleChange}
                          style={{
                            textTransform: "capitalize",
                            borderRadius: "10px",
                            border: "1px solid #7777",
                            padding: "6px",
                          }}
                        />
                      </div>
                      <div className="col-md-12 mb-4">
                        <label className="form-label text-dark text-sm">
                          Address
                        </label>
                        <textarea
                          className="form-control"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          required
                          rows={3}
                          style={{
                            borderRadius: "10px",
                            border: "1px solid #7777",
                            padding: "6px",
                            fontSize: "15px",
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Step 2: KYC */}
                {step === 2 && (
                  <>
                    <div className="mb-4">
                      <label className="form-label text-dark">
                        Aadhar Card
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setIsUploadingAadhar(true);
                            const url = await uploadKyc(file);
                            if (url) {
                              setFormData((prev) => ({ ...prev, aadhar: url }));
                            } else {
                              alert(
                                "Failed to upload Aadhar. Please try again."
                              );
                            }
                            setIsUploadingAadhar(false);
                          }
                        }}
                        required
                      />
                      {isUploadingAadhar && (
                        <small className="text-muted d-block mt-2">
                          Uploading Aadhar...
                        </small>
                      )}
                      {formData.aadhar && (
                        <div className="mt-3">
                          <img
                            src={formData.aadhar}
                            alt="Aadhar Preview"
                            className="img-thumbnail rounded"
                            style={{ maxHeight: "200px" }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="form-label text-dark">PAN Card</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setIsUploadingPan(true);
                            const url = await uploadKyc(file);
                            if (url) {
                              setFormData((prev) => ({ ...prev, pan: url }));
                            } else {
                              alert("Failed to upload PAN. Please try again.");
                            }
                            setIsUploadingPan(false);
                          }
                        }}
                        required
                      />
                      {isUploadingPan && (
                        <small className="text-muted d-block mt-2">
                          Uploading PAN...
                        </small>
                      )}
                      {formData.pan && (
                        <div className="mt-3">
                          <img
                            src={formData.pan}
                            alt="PAN Preview"
                            className="img-thumbnail rounded"
                            style={{ maxHeight: "200px" }}
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Step 3: Verify */}
                {step === 3 && (
                  <>
                    <h4 className="mb-3 text-primary fw-bold">
                      Verify & Submit
                    </h4>
                    <div className="border rounded-3 p-3 bg-light">
                      <p>
                        <strong>Name:</strong> {formData.vendorName}
                      </p>
                      <p>
                        <strong>Email:</strong> {formData.email}
                      </p>
                      <p>
                        <strong>Phone:</strong> {formData.phone}
                      </p>
                      <p>
                        <strong>Address:</strong> {formData.address}
                      </p>
                      <p>
                        <strong>GST No:</strong> {formData.gstNo}
                      </p>
                      {/* Plan removed */}

                      {/* Aadhar Preview */}
                      <div className="mt-3">
                        <strong>Aadhar:</strong>
                        {formData.aadhar ? (
                          <div className="mt-2">
                            <img
                              src={formData.aadhar}
                              alt="Aadhar Preview"
                              className="img-thumbnail rounded"
                              style={{ maxHeight: "200px" }}
                            />
                          </div>
                        ) : (
                          <span className="text-muted"> Not uploaded</span>
                        )}
                      </div>

                      {/* PAN Preview */}
                      <div className="mt-3">
                        <strong>PAN:</strong>
                        {formData.pan ? (
                          <div className="mt-2">
                            <img
                              src={formData.pan}
                              alt="PAN Preview"
                              className="img-thumbnail rounded"
                              style={{ maxHeight: "200px" }}
                            />
                          </div>
                        ) : (
                          <span className="text-muted"> Not uploaded</span>
                        )}
                      </div>

                      {/* Terms and Conditions Checkbox */}
                      <div className="mt-4 pt-3 border-top">
                        <div>
                          <input
                            className="rn-hidden-checkbox"
                            type="checkbox"
                            id="agreeToTerms"
                            checked={agreeToTerms}
                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                            required
                          />
                          <label
                            className="form-check-label text-dark"
                            htmlFor="agreeToTerms"
                          >
                            I agree to the{" "}
                            <a
                              href="http://localhost:3000/vendor-policy"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary fw-semibold text-decoration-underline"
                            >
                              vendor terms and conditions
                            </a>
                          </label>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Navigation Buttons */}
                <div className="d-flex justify-content-between mt-4">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="btn btn-outline-secondary px-4 py-3"
                    >
                      ← Previous
                    </button>
                  )}
                  {step < 3 && (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="btn btn-dark px-4 py-3"
                      disabled={
                        step === 2 &&
                        (isUploadingAadhar ||
                          isUploadingPan ||
                          !formData.aadhar ||
                          !formData.pan)
                      }
                    >
                      Next →
                    </button>
                  )}
                  {step === 3 && (
                    <button
                      type="submit"
                      className="btn btn-success px-4 py-3"
                      disabled={!agreeToTerms || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <i className="fa fa-paper-plane me-2" />
                          Submit Application
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
      </div>

      <ShortService />
      <FooterOne />
    </div>
  );
}

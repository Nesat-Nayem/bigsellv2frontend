"use client";
import React, { useEffect, useState } from "react";
import HeaderOne from "@/components/header/HeaderOne";
import ShortService from "@/components/service/ShortService";
import FooterOne from "@/components/footer/FooterOne";
import { Card } from "react-bootstrap";

export default function Home() {
  const [step, setStep] = useState(1);
  const [isUploadingAadhar, setIsUploadingAadhar] = useState(false);
  const [isUploadingPan, setIsUploadingPan] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // form data state
  const [formData, setFormData] = useState({
    vendorName: "",
    email: "",
    phone: "",
    address: "",
    gstNo: "",
    plan: "",
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

  const selectPlan = (plan: string) => {
    setFormData({ ...formData, plan });
  };

  // dynamic subscription plans (max 3)
  const [plans, setPlans] = useState<
    Array<{
      _id?: string;
      name: string;
      price: number;
      billingCycle?: "monthly" | "yearly";
      features: string[];
      color?: string;
    }>
  >([]);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const res = await fetch("http://localhost:8080/v1/api/subscriptions?active=true&limit=3");
        const json = await res.json();
        const data = Array.isArray(json?.data) ? json.data : [];
        setPlans(data);
      } catch (e) {
        // fallback silently if fetch fails, UI will still render
        setPlans([]);
      }
    };
    loadPlans();
  }, []);

  // Upload KYC document to backend and return URL
  const uploadKyc = async (file: File): Promise<string | null> => {
    try {
      const fd = new FormData();
      fd.append("document", file);
      const res = await fetch("http://localhost:8080/v1/api/upload/kyc-document", { method: "POST", body: fd });
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
      alert("Please agree to the vendor terms and conditions before submitting.");
      return;
    }
    try {
      const selected = plans.find((p) => p.name === formData.plan);
      const payload: any = {
        vendorName: formData.vendorName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        gstNo: formData.gstNo || undefined,
        subscriptionId: selected?._id,
        planName: selected?.name || formData.plan,
        planPrice: selected?.price,
        planBillingCycle: selected?.billingCycle,
        planColor: selected?.color,
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
        alert("Vendor Registration Submitted");
        setStep(4);
      } else {
        const backendMsg = Array.isArray(json?.errorMessages)
          ? json.errorMessages.map((e: any) => e.message).join("\n")
          : json?.message;
        alert(backendMsg || "Failed to submit application");
      }
    } catch (err) {
      alert("Failed to submit application");
    }
  };

  return (
    <div className="demo-one">
      <HeaderOne />

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

      {/* Stepper */}
      <div className="track-order-area rts-section-gap">
        <div className="container-2">
          <div className="row justify-content-center">
            <div className="col-lg-9">
              {/* Progress Stepper */}
              <div className="progress my-4" style={{ height: "6px" }}>
                <div
                  className="progress-bar bg-dark"
                  role="progressbar"
                  style={{ width: `${(step - 1) * 33.3}%` }}
                />
              </div>
              <div className="d-flex justify-content-between text-center mb-4">
                {["Basic Details", "Plan", "KYC", "Verify"].map(
                  (label, idx) => (
                    <div key={idx} className="flex-fill">
                      <div
                        className={`rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center 
                          ${
                            step === idx + 1
                              ? "bg-dark text-white"
                              : "bg-light border"
                          } `}
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
                  )
                )}
              </div>

              {/* Step Forms */}
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
                            textTransform: "capitalize",
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
                            textTransform: "capitalize",
                            borderRadius: "10px",
                            border: "1px solid #7777",
                            padding: "6px",
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Step 2: Plan */}
                {step === 2 && (
                  <>
                    <div className="row g-4">
                      {(plans.length > 0
                        ? plans
                        : [
                            {
                              name: "Silver",
                              price: 499,
                              billingCycle: "monthly" as const,
                              features: ["Basic Listing", "Email Support"],
                              color: "secondary",
                            },
                            {
                              name: "Gold",
                              price: 999,
                              billingCycle: "monthly" as const,
                              features: [
                                "Premium Listing",
                                "Priority Support",
                                "Discounts",
                              ],
                              color: "warning",
                            },
                            {
                              name: "Platinum",
                              price: 1999,
                              billingCycle: "monthly" as const,
                              features: [
                                "Top Listing",
                                "24/7 Support",
                                "Full Access",
                              ],
                              color: "info",
                            },
                          ]
                      ).map((plan) => (
                        <div className="col-md-4" key={(plan as any)._id || plan.name}>
                          <div
                            className={`pricing-card ${
                              formData.plan === plan.name ? "active" : ""
                            }`}
                            onClick={() => selectPlan(plan.name)}
                          >
                            <h5 className={`fw-bold text-${plan.color || "secondary"}`}>
                              {plan.name}
                            </h5>
                            <h2 className="fw-bold">{`₹${plan.price} /${plan.billingCycle === "yearly" ? "year" : "month"}`}</h2>
                            <ul>
                              {plan.features.map((f, i) => (
                                <li key={i}>{f}</li>
                              ))}
                            </ul>
                            <button
                              className={`btn ${
                                formData.plan === plan.name
                                  ? "btn-dark"
                                  : "btn-outline-primary"
                              }`}
                            >
                              Select
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Step 3: KYC */}
                {/* Step 3: KYC */}
                {step === 3 && (
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
                              alert('Failed to upload Aadhar. Please try again.');
                            }
                            setIsUploadingAadhar(false);
                          }
                        }}
                        required
                      />
                      {isUploadingAadhar && (
                        <small className="text-muted d-block mt-2">Uploading Aadhar...</small>
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
                              alert('Failed to upload PAN. Please try again.');
                            }
                            setIsUploadingPan(false);
                          }
                        }}
                        required
                      />
                      {isUploadingPan && (
                        <small className="text-muted d-block mt-2">Uploading PAN...</small>
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

                {/* Step 4: Verify */}
                {step === 4 && (
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
                      <p>
                        <strong>Plan:</strong> {formData.plan}
                      </p>

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
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="agreeToTerms"
                            checked={agreeToTerms}
                            onChange={(e) => setAgreeToTerms(e.target.checked)}
                            required
                          />
                          <label className="form-check-label text-dark" htmlFor="agreeToTerms">
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
                  {step < 4 && (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="btn btn-dark px-4 py-3"
                      disabled={
                        (step === 2 && !formData.plan) ||
                        (step === 3 && (isUploadingAadhar || isUploadingPan || !formData.aadhar || !formData.pan))
                      }
                    >
                      Next →
                    </button>
                  )}
                  {step === 4 && (
                    <button 
                      type="submit" 
                      className="btn btn-success px-4"
                      disabled={!agreeToTerms}
                    >
                      Submit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <ShortService />
      <FooterOne />
    </div>
  );
}

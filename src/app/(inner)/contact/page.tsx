"use client";

import HeaderOne from "@/components/header/HeaderOne";
import ShortService from "@/components/service/ShortService";
import FooterOne from "@/components/footer/FooterOne";
import Link from "next/link";
import { useGetGeneralSettingsQuery } from "@/store/generalSettings";
import { useCreateContactMutation } from "@/store/contactApi";
import { useForm } from "react-hook-form";

type ContactFormValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone: string;
};

export default function Home() {
  const { data: generalSettings } = useGetGeneralSettingsQuery();
  const [createContact, { isLoading }] = useCreateContactMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>();

  const onSubmit = async (values: ContactFormValues) => {
    try {
      const res = await createContact(values).unwrap();
      alert("Message sent successfully!");
      reset();
    } catch (err: any) {
      console.error("Error:", err);
      if (err?.status === 500) {
        alert("Server error. Please check API or payload.");
      } else {
        alert(err?.data?.message || "Failed to send message");
      }
    }
  };

  return (
    <div className="demo-one">
      <HeaderOne />

      {/* Banner */}
      <div className="rts-contact-main-wrapper-banner bg_image">
        <div className="container">
          <div className="row">
            <div className="co-lg-12">
              <div className="contact-banner-content">
                <h1 className="title">Ask Us a Question</h1>
                <p className="disc">
                  Have something on your mind? Whether it’s a query, suggestion,
                  or feedback, we’re just a message away. Reach out and our team
                  will be happy to assist you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="rts-map-contact-area rts-section-gap2">
        <div className="container">
          <div className="row">
            <div className="col-lg-4">
              <div className="contact-left-area-main-wrapper">
                <h2 className="title">You can ask us anything!</h2>
                <p className="disc">
                  We’re here to help with your questions, feedback, or ideas.
                  Reach out anytime, and our support team will make sure you get
                  the answers you need as quickly as possible.
                </p>

                <div className="location-single-card">
                  <div className="icon">
                    <i className="fa-light fa-location-dot" />
                  </div>
                  <div className="information">
                    <h3 className="title">India Store</h3>
                    <p>{generalSettings?.address}</p>
                    {generalSettings?.number && (
                      <Link
                        href={`tel:${generalSettings.number}`}
                        className="number"
                      >
                        +91 {generalSettings.number}
                      </Link>
                    )}
                    {generalSettings?.email && (
                      <Link
                        href={`mailto:${generalSettings.email}`}
                        className="email"
                      >
                        {generalSettings.email}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="col-lg-8 pl--50 pl_sm--5 pl_md--5">
              {generalSettings?.iframe && (
                <iframe
                  src={generalSettings.iframe}
                  width={600}
                  height={540}
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="rts-contact-form-area rts-section-gapBottom">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="bg_light-1 contact-form-wrapper-bg">
                <div className="row">
                  <div className="col-lg-7 pr--30 pr_md--10 pr_sm--5">
                    <div className="contact-form-wrapper-1">
                      <h3 className="title mb--50">
                        Fill Up The Form If You Have Any Question
                      </h3>
                      <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="contact-form-1"
                      >
                        <div className="contact-form-wrapper--half-area">
                          <div className="single">
                            <input
                              type="text"
                              placeholder="Name*"
                              {...register("name", { required: true })}
                            />
                            {errors.name && <span>Name is required</span>}
                          </div>
                          <div className="single">
                            <input
                              type="email"
                              placeholder="Email*"
                              {...register("email", { required: true })}
                            />
                            {errors.email && <span>Email is required</span>}
                          </div>
                          <div className="single">
                            <input
                              type="text"
                              placeholder="Phone*"
                              {...register("phone", { required: true })}
                            />
                            {errors.phone && <span>Phone is required</span>}
                          </div>
                        </div>

                        <div className="single-select">
                          <select {...register("subject", { required: true })}>
                            <option value="">Subject*</option>
                            <option value="Product">Product</option>
                            <option value="Shipping Query">
                              Shipping Query
                            </option>
                            <option value="Damage Product">
                              Damage Product
                            </option>
                            <option value="Other">Other</option>
                          </select>
                          {errors.subject && <span>Subject is required</span>}
                        </div>

                        <textarea
                          placeholder="Write Message Here"
                          {...register("message", { required: true })}
                        />
                        {errors.message && <span>Message is required</span>}

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="rts-btn btn-primary mt--20"
                        >
                          {isLoading ? "Sending..." : "Send Message"}
                        </button>
                      </form>
                    </div>
                  </div>
                  <div className="col-lg-5 mt_md--30 mt_sm--30">
                    <div className="thumbnail-area">
                      <img
                        src="assets/images/contact/1.jpg"
                        alt="contact_form"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShortService />
      <FooterOne />
    </div>
  );
}

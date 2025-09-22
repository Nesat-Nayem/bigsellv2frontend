"use client";

import { useGetGeneralSettingsQuery } from "@/store/generalSettings";
import Link from "next/link";
import React from "react";

function FooterOne() {
  const {
    data: generalSettings,
    isLoading,
    isError,
  } = useGetGeneralSettingsQuery();
  return (
    <div>
      <>
        {/* rts footer one area start */}
        <div className="rts-footer-area pt--80 bg_light-1">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="footer-main-content-wrapper pb--70 pb_sm--30">
                  {/* single footer area wrapper */}
                  <div className="single-footer-wized">
                    <h3 className="footer-title">About Company</h3>
                    <div className="call-area">
                      <div className="icon">
                        <i className="fa-solid fa-phone-rotary" />
                      </div>
                      <div className="info">
                        <span>Have Question? Call Us 24/7</span>
                        <Link
                          href={`tel:${generalSettings?.number}`}
                          className="number"
                        >
                          +91 {generalSettings?.number}
                        </Link>
                      </div>
                    </div>
                  </div>
                  {/* single footer area wrapper */}
                  {/* single footer area wrapper */}
                  <div className="single-footer-wized">
                    <h3 className="footer-title">Our Stores</h3>
                    <div className="footer-nav">
                      <ul>
                        <li>
                          <Link href="privacy-policy">Privacy Policy</Link>
                        </li>
                        <li>
                          <Link href="terms-condition">
                            Terms &amp; Conditions
                          </Link>
                        </li>
                        <li>
                          <Link href="shipping-policy">Shipping Policy</Link>
                        </li>
                        <li>
                          <Link href="support">Support Center</Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                  {/* single footer area wrapper */}
                  {/* single footer area wrapper */}
                  <div className="single-footer-wized">
                    <h3 className="footer-title">Shop Categories</h3>
                    <div className="footer-nav">
                      <ul>
                        <li>
                          <Link href="contact">Contact Us</Link>
                        </li>
                        <li>
                          <Link href="blog">Blog</Link>
                        </li>
                        <li>
                          <Link href="about">About Us</Link>
                        </li>
                        <li>
                          <Link href="faq">FAQ's</Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                  {/* single footer area wrapper */}
                  {/* single footer area wrapper */}
                  <div className="single-footer-wized">
                    <h3 className="footer-title">Useful Links</h3>
                    <div className="footer-nav">
                      <ul>
                        <li>
                          <Link href="disclaimer">Disclaimer</Link>
                        </li>
                        <li>
                          <Link href="payment-policy">Payment-Policy</Link>
                        </li>
                        <li>
                          <Link href="site-security">Site Security</Link>
                        </li>
                        <li>
                          <Link href="vendor-policy">Vendor Policy</Link>
                        </li>
                        <li>
                          <Link href="vendor">Become a Vendor</Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                  {/* single footer area wrapper */}
                  {/* single footer area wrapper */}
                  <div className="single-footer-wized">
                    <h3 className="footer-title">Our Newsletter</h3>
                    <p className="disc-news-letter">
                      Subscribe to the mailing list to receive updates one{" "}
                      <br /> the new arrivals and other discounts
                    </p>
                    <form className="footersubscribe-form" action="#">
                      <input
                        type="email"
                        placeholder="Your email address"
                        required
                      />
                      <button className="rts-btn btn-primary">Subscribe</button>
                    </form>
                    <p className="dsic">
                      I would like to receive news and special offer
                    </p>
                  </div>
                  {/* single footer area wrapper */}
                </div>
                <div className="social-and-payment-area-wrapper">
                  <div className="social-one-wrapper">
                    <span>Follow Us:</span>
                    <ul>
                      <li>
                        {generalSettings?.facebook && (
                          <Link href={generalSettings.facebook} target="_blank">
                            <i className="fa-brands fa-facebook-f" />
                          </Link>
                        )}
                      </li>
                      <li>
                        {generalSettings?.twitter && (
                          <Link href={generalSettings.twitter} target="_blank">
                            <i className="fa-brands fa-twitter" />
                          </Link>
                        )}
                      </li>
                      <li>
                        {generalSettings?.youtube && (
                          <Link href={generalSettings.youtube} target="_blank">
                            <i className="fa-brands fa-youtube" />
                          </Link>
                        )}
                      </li>
                      <li>
                        {generalSettings?.linkedIn && (
                          <Link href={generalSettings.linkedIn} target="_blank">
                            <i className="fa-brands fa-linkedin" />
                          </Link>
                        )}
                      </li>
                      <li>
                        {generalSettings?.instagram && (
                          <Link
                            href={generalSettings.instagram}
                            target="_blank"
                          >
                            <i className="fa-brands fa-instagram" />
                          </Link>
                        )}
                      </li>
                    </ul>
                  </div>
                  <div className="payment-access">
                    <span>Payment Accepts:</span>
                    <img src="assets/images/payment/01.png" alt="" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* rts footer one area end */}
        {/* rts copyright-area start */}
        <div className="rts-copyright-area">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="copyright-between-1">
                  <p className="disc">
                    Copyright 2025 <Link href="#">Big Sell</Link>. All rights
                    reserved.
                  </p>
                  <Link href="#" className="playstore-app-area">
                    <span>Download App</span>
                    <img src="assets/images/payment/02.png" alt="" />
                    <img src="assets/images/payment/03.png" alt="" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* rts copyright-area end */}
      </>
    </div>
  );
}

export default FooterOne;

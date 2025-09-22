"use client";

import HeaderOne from "@/components/header/HeaderOne";
import ShortService from "@/components/service/ShortService";
import FooterOne from "@/components/footer/FooterOne";
import { Spinner } from "react-bootstrap";
import { useGetDisclaimerQuery } from "@/store/disclaimerApi";

export default function Home() {
  const { data, isLoading, isError } = useGetDisclaimerQuery();

  if (isLoading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );

  if (isError) return <div>Error...</div>;

  return (
    <div className="demo-one">
      <HeaderOne />

      <>
        <div className="rts-navigation-area-breadcrumb bg_light-1">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="navigator-breadcrumb-wrapper">
                  <a href="/">Home</a>
                  <i className="fa-regular fa-chevron-right" />
                  <a className="current" href="#">
                    Disclaimer
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="section-seperator bg_light-1">
          <div className="container">
            <hr className="section-seperator" />
          </div>
        </div>

        {/* privacy policy area start */}
        <div className="rts-pricavy-policy-area rts-section-gap">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div
                  className="container-privacy-policy"
                  dangerouslySetInnerHTML={{ __html: data?.content || "" }}
                />
              </div>
            </div>
          </div>
        </div>
        {/* privacy policy area end */}
      </>

      <ShortService />
      <FooterOne />
    </div>
  );
}

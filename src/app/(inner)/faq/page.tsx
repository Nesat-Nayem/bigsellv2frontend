"use client";

import HeaderOne from "@/components/header/HeaderOne";
import ShortService from "@/components/service/ShortService";
import FooterOne from "@/components/footer/FooterOne";
import { useGetFaqQuery } from "@/store/faqApi";
import { Accordion, Spinner } from "react-bootstrap";

interface IFaq {
  id: string | number;
  question: string;
  answer: string;
}

export default function Home() {
  const { data, isLoading, isError } = useGetFaqQuery();

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

  if (isError) return <div>Error loading FAQs...</div>;

  return (
    <div className="demo-one">
      <HeaderOne />

      <div className="rts-navigation-area-breadcrumb bg_light-1">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="navigator-breadcrumb-wrapper">
                <a href="/">Home</a>
                <i className="fa-regular fa-chevron-right" />
                <span className="current">Frequently Asked Questions</span>
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

      <div className="rts-pricavy-policy-area rts-section-gap">
        <div className="container">
          <div className="row align-items-center">
            {/* Image */}
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="faq-image-wrapper shadow rounded overflow-hidden">
                <img src="/assets/faq/1.jpg" alt="banenr" />
              </div>
            </div>

            {/* FAQ Content */}
            <div className="col-lg-6">
              <div className="faq-content p-4 rounded shadow-sm bg-white">
                <h3 className="mb-4 text-primary">
                  Frequently Asked Questions
                </h3>
                <Accordion defaultActiveKey={["0"]} alwaysOpen>
                  {data?.map((item, index) => (
                    <Accordion.Item
                      key={item._id ?? index}
                      eventKey={index.toString()}
                    >
                      <Accordion.Header>{item.question}</Accordion.Header>
                      <Accordion.Body>{item.answer}</Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
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

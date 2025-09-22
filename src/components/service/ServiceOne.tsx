import React from "react";

function ComponentName() {
  return (
    <div>
      <>
        {/* choosing reason service area start */}
        <div className="rts-service-area rts-section-gap2 bg_light-1">
          <div className="container-3">
            <div className="row">
              <div className="col-lg-12">
                <div className="title-center-area-main">
                  <h2 className="title">Why You Choose Us?</h2>
                  <p className="disc">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Quisque pretium mollis ex, vel interdum augue faucibus sit
                    amet. Proin tempor purus ac suscipit...
                  </p>
                </div>
              </div>
            </div>
            <div className="row mt--30 g-5">
              <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                <div className="single-service-area-style-one">
                  <div className="icon-area d-flex justify-content-center">
                    <span className="bg-text">03</span>
                    <div style={{ width: "100px", height: "100px" }}>
                      <img
                        src="assets/images/service/1.png"
                        alt="service"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  </div>
                  <div className="bottom-content">
                    <h3 className="title">24/7 Customer Support</h3>
                    <p className="disc">
                      When an unknown printer took a galley of type and
                      scrambled it to make follow type specimen area book.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                <div className="single-service-area-style-one">
                  <div className="icon-area d-flex justify-content-center">
                    <span className="bg-text">03</span>
                    <div style={{ width: "100px", height: "100px" }}>
                      <img
                        src="assets/images/service/2.png"
                        alt="service"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  </div>
                  <div className="bottom-content">
                    <h3 className="title">Big product Discount</h3>
                    <p className="disc">
                      When an unknown printer took a galley of type and
                      scrambled it to make follow type specimen area book.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                <div className="single-service-area-style-one">
                  <div className="icon-area d-flex justify-content-center">
                    <span className="bg-text">03</span>
                    <div style={{ width: "100px", height: "100px" }}>
                      <img
                        src="assets/images/service/3.png"
                        alt="service"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  </div>
                  <div className="bottom-content">
                    <h3 className="title">Delivery On Time</h3>
                    <p className="disc">
                      When an unknown printer took a galley of type and
                      scrambled it to make follow type specimen area book.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* choosing reason service area end */}
      </>
    </div>
  );
}

export default ComponentName;

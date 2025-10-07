import HeaderOne from "@/components/header/HeaderOne";
import AboutBanner from "@/components/banner/AboutBanner";
import CounterOne from "@/components/counterup/CounterOne";
import AboutOne from "@/components/about/AboutOne";
import Team from "@/components/about/Team";
import ServiceOne from "@/components/service/ServiceOne";
import TestimonilsOne from "@/components/testimonials/TestimonilsOne";
import ShortService from "@/components/service/ShortService";

import FooterOne from "@/components/footer/FooterOne";
import HeaderThree from "@/components/header/HeaderThree";

export default function Home() {
  return (
    <div className="demo-one">
      <HeaderThree />
      <AboutBanner />
      <CounterOne />
      <AboutOne />
      <Team />
      <ServiceOne />
      {/* <TestimonilsOne/> */}
      <ShortService />

      <FooterOne />
    </div>
  );
}

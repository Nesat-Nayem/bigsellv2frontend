import HeaderOne from "@/components/header/HeaderOne";
import ShortService from "@/components/service/ShortService";
import CheckOutMain from "./CheckOutMain";
import FooterOne from "@/components/footer/FooterOne";
import HeaderThree from "@/components/header/HeaderThree";

export default function Home() {
  return (
    <div className="demo-one">
      <HeaderThree />

      <CheckOutMain />
      <ShortService />
      <FooterOne />
    </div>
  );
}

"use client"
import { Suspense } from "react";
import HeaderOne from "@/components/header/HeaderOne";
import ShortService from "@/components/service/ShortService";
import Accordion from "./Accordion";
import FooterOne from "@/components/footer/FooterOne";

export default function Home() {
    return (
        <div className="demo-one">
            <HeaderOne />

            <>
                

            <Suspense fallback={<div>Loading...</div>}>
                <Accordion/>
            </Suspense>

                
                
            </>

            <ShortService />
            <FooterOne />
        </div>
    );
}

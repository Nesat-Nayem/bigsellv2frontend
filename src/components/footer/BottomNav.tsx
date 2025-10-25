"use client";

import React, { useState } from "react";
import Link from "next/link";

const BottomNav: React.FC = () => {
  const [active, setActive] = useState("add");

  const icons = [
    { name: "home", icon: "fas fa-heart", link: "/wishlist" },
    { name: "add", icon: "fas fa-home", link: "/" },
    { name: "user", icon: "fas fa-user", link: "/account" },
  ];

  return (
    <div className="bottom-nav-wrapper">
      <nav className="bottom-nav">
        {icons.map((item) =>
          item.name === "add" ? (
            <Link href={item.link} key={item.name}>
              <button
                onClick={() => setActive(item.name)}
                className={`center-btn ${active === item.name ? "active" : ""}`}
              >
                <i className={item.icon}></i>
              </button>
            </Link>
          ) : (
            <Link href={item.link} key={item.name} className="nav-link">
              <div
                className={`nav-item ${active === item.name ? "active" : ""}`}
                onClick={() => setActive(item.name)}
              >
                <i className={item.icon}></i>
              </div>
            </Link>
          )
        )}
      </nav>
    </div>
  );
};

export default BottomNav;

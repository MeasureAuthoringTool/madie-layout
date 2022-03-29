import React from "react";
import { Footer as QPPFooter } from "@madie/madie-design-system/dist/react";
import "../../styles/FooterStyles.scss";
import hhsLogoPath from "../../assets/images/hhs-logo-black.svg";
import qppLogoPath from "../../assets/images/measure_authoring_logo.svg";

const Footer = () => {
  const assets = {
    hhsLogo: (
      <img
        alt="Department of Health &amp; Human Services USA"
        className="hhs-logo"
        data-testid="custom-hhs-logo"
        src={hhsLogoPath}
      />
    ),
    qppLogo: (
      <img
        alt="qpp logo"
        className="qpp-logo"
        data-testid="custom-qpp-logo"
        src={qppLogoPath}
      />
    ),
  };
  return (
    <section className="footer-section">
      <QPPFooter isNewFooter={true} assets={assets} />
    </section>
  );
};

export default Footer;

import React from "react";
import { Footer as MadieFooter } from "@madie/madie-design-system/dist/react";
import "../../styles/FooterStyles.scss";
import hhsLogoPath from "../../assets/images/hhs-logo-black.svg";
import madieLogoPath from "../../assets/images/measure_authoring_logo.svg";

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
        alt="MADiE Measure Authoring Development Integrated Environment logo"
        className="madie-logo"
        data-testid="custom-madie-logo"
        src={madieLogoPath}
      />
    ),
  };
  return (
    <section className="footer-section">
      <MadieFooter isNewFooter={true} assets={assets} />
    </section>
  );
};

export default Footer;

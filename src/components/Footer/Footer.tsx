import React from "react";
import { Footer as QPPFooter } from "@madie/madie-design-system/dist/react";
import "../../styles/FooterStyles.scss";

const Footer = () => {
  return (
    <section className="footer-section">
      <QPPFooter isNewFooter={true} />
    </section>
  );
};

export default Footer;

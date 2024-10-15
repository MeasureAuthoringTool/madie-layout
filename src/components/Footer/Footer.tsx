import React, { useEffect, useState } from "react";
import hhsLogoPath from "../../assets/images/hhs-logo-white.png";
import madieLogoPath from "../../assets/images/madie-footer-logo.svg";
import "./FooterStyles.scss";
import { getServiceConfig } from "../../custom-hooks/getServiceConfig";

const Footer = () => {
  const [versionNumber, setVersionNumber] = useState<string>("");

  useEffect(() => {
    getServiceConfig().then((res) => setVersionNumber(res.madieVersion));
  }, []);

  const assets = {
    hhsLogo: (
      <img
        alt="Department of Health &amp; Human Services USA"
        className="hhs-logo"
        data-testid="custom-hhs-logo"
        src={hhsLogoPath}
      />
    ),
    madieLogo: (
      <img
        alt="MADiE Measure Authoring Development Integrated Environment logo"
        className="madie-logo"
        data-testid="custom-madie-logo"
        src={madieLogoPath}
      />
    ),
  };

  return (
    <footer aria-label="Site footer" id="site-footer">
      <div className="footer-nav-links">
        <ul>
          <li className="nav-link">
            <a
              href="https://oncprojectracking.healthit.gov/support/projects/MADIE/summary"
              aria-label="Get Help"
              target="_blank"
            >
              Get Help
            </a>
          </li>
          <li className="nav-link">
            <a
              href="https://www.emeasuretool.cms.gov/training-resources"
              target="_blank"
              aria-label="User Guide"
            >
              User Guide
            </a>
          </li>
        </ul>
        <ul>
          <li className="nav-link">
            <a
              href="https://www.cms.gov/center/freedom-of-information-act-center.html"
              aria-label="Freedom of Information Act"
              target="_blank"
            >
              Freedom of Information Act
            </a>
          </li>
          <li className="nav-link">
            <a
              href="https://www.cms.gov/About-CMS/Agency-Information/Aboutwebsite/Policiesforaccessibility"
              aria-label="Accessibility Policy"
              target="_blank"
            >
              Accessibility Policy
            </a>
          </li>
          <li className="nav-link">
            <a
              href="https://www.cms.gov/About-CMS/Agency-Information/Aboutwebsite/Privacy-Policy"
              aria-label="Privacy Policy"
              target="_blank"
            >
              Privacy Policy
            </a>
          </li>
          <li className="nav-link">
            <a
              href="https://www.hhs.gov/web/governance/digital-strategy/it-policy-archive/hhs-rules-of-behavior-for-the-use-of-hhs-information-and-it-resources-policy.html"
              aria-label="Rules of Behavior"
              target="_blank"
            >
              Rules of Behavior
            </a>
          </li>
          <li className="nav-link">
            <a
              href="https://harp.cms.gov/login/terms-of-use"
              aria-label="Terms of Use"
              target="_blank"
            >
              Terms of Use
            </a>
          </li>
          <li className="nav-link">
            <a
              href="https://www.cms.gov/about-cms/information-systems/privacy/vulnerability-disclosure-policy"
              aria-label="CMS/HHS Vulnerability Disclosure Policy"
              target="_blank"
            >
              CMS/HHS Vulnerability Disclosure Policy
            </a>
          </li>
          <li className="nav-link">
            <a href="https://www.cms.gov/" aria-label="CMS.gov" target="_blank">
              CMS.gov
            </a>
          </li>
        </ul>
      </div>
      <div className="footer-logos">
        <div className="madie-logo">{assets.madieLogo}</div>
        <div className="madie-version">Version {versionNumber}</div>
        <div className="hhs-logo">
          {assets.hhsLogo}
          <p>
            A federal government website managed and paid for by the U.S.
            <br />
            Centers for Medicare &amp; Medicaid Services. 7500 Security <br />
            Boulevard, Baltimore MD 21244
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

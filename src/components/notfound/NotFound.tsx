import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useDocumentTitle } from "@madie/madie-util";
const GoHomeLink = styled.button.attrs({
  className: "ml:text-blue-500 ml:hover:text-blue-900",
})``;

const NotFound = () => {
  useDocumentTitle("MADiE Page not found");
  let navigate = useNavigate();

  function handleClick() {
    navigate("/");
  }
  return (
    <div data-testid="404-page">
      <h6 style={{ textAlign: "center" }}>404 - Not Found!</h6>
      <GoHomeLink
        type="button"
        data-testid="404-page-link"
        onClick={handleClick}
      >
        Go Home
      </GoHomeLink>
    </div>
  );
};
export default NotFound;

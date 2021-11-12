import React from "react";
import { useHistory } from "react-router-dom";
import { useOktaAuth } from "@okta/okta-react";
import { ExtraButton } from "../../styles/styles";

function Home() {
  const history = useHistory();
  const { oktaAuth } = useOktaAuth();

  const logout = async () => oktaAuth.signOut();

  return (
    <div>
      <div> You are successfully logged in </div>
      <ExtraButton onClick={() => history.push("/editor")}>Editor</ExtraButton>
      <ExtraButton
        data-testid="measure-button"
        onClick={() => history.push("/measure")}
      >
        Measures
      </ExtraButton>
      <ExtraButton onClick={logout}>Logout</ExtraButton>
    </div>
  );
}
export default Home;

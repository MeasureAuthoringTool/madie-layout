import React from "React";

interface LoginErrorProps {
  error: Error;
}

const LoginError: React.FC<LoginErrorProps> = ({ error }) => {
  // eslint-disable-next-line no-console
  console.dir(error);
  return <div>error</div>;
};

export default LoginError;

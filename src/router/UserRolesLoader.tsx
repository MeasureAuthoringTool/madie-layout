import { useEffect, useRef } from "react";
import { useUserServiceApi } from "@madie/madie-util";

const UserRolesLoader = (): null => {
  const userServiceApi = useRef(useUserServiceApi()).current;

  useEffect(() => {
    userServiceApi.fetchUserRoles().catch((error) => {
      console.error("Error fetching user roles:", error);
    });
  }, [userServiceApi]);

  return null;
};

export default UserRolesLoader;

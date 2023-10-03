import { createContext } from "react";

const AuthenticationContext = createContext({ isAwaitingData: true });

export { AuthenticationContext };
export default AuthenticationContext;
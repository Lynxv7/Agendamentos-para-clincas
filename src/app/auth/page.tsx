import { redirect } from "next/navigation";

const AuthRedirectPage = () => {
  redirect("/authentication");
};

export default AuthRedirectPage;

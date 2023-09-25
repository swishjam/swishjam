import AuthenticatedView from "@/components/Auth/AuthenticatedView";

export default function layout({ children }) {
  return (
    <AuthenticatedView>
      {children}
    </AuthenticatedView>
  )
}
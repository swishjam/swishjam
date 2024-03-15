import { Skeleton } from "../ui/skeleton";

export default function FormInputOrLoadingState({ children, isLoading, className = '' }) {
  if (isLoading) {
    return <Skeleton className={`h-10 w-full ${className}`} />
  } else {
    return children;
  }
}
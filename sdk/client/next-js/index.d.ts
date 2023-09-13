import { ReactNode } from 'react';

declare module '@swishjam/next-js' {
  export interface SwishjamProviderProps {
    apiKey: string;
    apiEndpoint: string;
    children: ReactNode;
  }

  export interface SwishjamClient {
    event: (name: string, properties: object) => object;
    identify: (uniqueIdentifier: string, traits: object) => object;
    setOrganization: (organizationId: string, traits: object) => string;
    newSession: () => string;
    getSession: () => string;
  }

  export function useSwishjam(): any; // You might want to replace 'any' with specific types

  export function SwishjamProvider(props: SwishjamProviderProps): JSX.Element;
}

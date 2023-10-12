/// <reference types="react" />
interface SwishjamContextValue {
    apiKey: string;
    apiEndpoint: string;
}
export declare const SwishjamContext: import("react").Context<SwishjamContextValue | undefined>;
export declare const useSwishjam: () => SwishjamContextValue | undefined;
export {};

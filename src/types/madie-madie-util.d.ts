declare module "@madie/madie-util" {
  import { LifeCycleFn } from "single-spa";
  import { AxiosInstance } from "axios";
  import { CqlLibrary, Measure, Acl } from "@madie/madie-models";

  export interface OktaConfig {
    baseUrl: string;
    issuer: string;
    clientId: string;
    redirectUri: string;
    scopes: string[];
    useClassicEngine: boolean;
  }

  export interface ServiceConfig {
    qdmElmTranslationService?: {
      baseUrl: string;
    };
    fhirElmTranslationService?: {
      baseUrl: string;
    };
    terminologyService?: {
      baseUrl: string;
    };
    cqlLibraryService?: {
      baseUrl: string;
    };
    measureService?: {
      baseUrl: string;
    };
    loggingService?: {
      baseUrl: string;
    };
    okta?: OktaConfig;
    madieVersion?: string;
    features?: {
      export?: boolean;
      qdmToFhirConversion?: boolean;
    };
  }

  export interface RouteHandlerState {
    canTravel: boolean;
    pendingRoute: string;
  }

  interface FeatureFlags {
    ShareLibrary: boolean;
    importTestCases: boolean;
    ShareMeasure: boolean;
    qiCore7: boolean;
    TransferMeasure: boolean;
    TransferLibrary: boolean;
    MeasureHistory: boolean;
    LibraryHistory: boolean;
    Locking: boolean;
  }

  export const cqlLibraryStore: {
    subscribe: (
      setLibrary: React.Dispatch<React.SetStateAction<CqlLibrary>>
    ) => import("rxjs").Subscription;
    updateLibrary: (measure: CqlLibrary | null) => void;
    initialState: null;
    state: CqlLibrary;
  };

  export const measureStore: {
    subscribe: (
      setMeasureState: React.Dispatch<React.SetStateAction<Measure>>
    ) => import("rxjs").Subscription;
    updateMeasure: (measure: Measure | null) => void;
    initialState: null;
    state: Measure;
  };

  export const routeHandlerStore: {
    subscribe: (
      setRouteHandlerState: React.Dispatch<React.SetStateAction<object>>
    ) => import("rxjs").Subscription;
    updateRouteHandlerState: (routeHandlerState: RouteHandlerState) => void;
    initialState: RouteHandlerState;
    state: RouteHandlerState;
  };

  export function useFeatureFlags(): FeatureFlags;

  export const featureFlagsStore: {
    subscribe: (
      setRouteHandlerState: React.Dispatch<React.SetStateAction<object>>
    ) => import("rxjs").Subscription;
    updateFeatureFlags: (featureFlags: FeatureFlags) => void;
    initialState: FeatureFlags;
    state: FeatureFlags;
  };

  export function useServiceConfig(): ServiceConfig;
  export function getServiceConfig(): Promise<ServiceConfig>;
  export function getOktaConfig(): Promise<OktaConfig>;

  export function useKeyPress(targetKey: any): boolean;
  export const useOktaTokens: (storageKey?: string) => {
    getAccessToken: () => any;
    getAccessTokenObj: () => any;
    getUserName: () => any;
    getIdToken: () => any;
    getIdTokenObj: () => any;
  };
  export function checkUserCanEdit(
    createdBy: string,
    acls: Array<Acl>,
    draft?: boolean
  ): boolean;
  export function checkUserCanDelete(
    createdBy: string,
    draft?: boolean
  ): boolean;
  export function useOnClickOutside(ref: any, handler: any): void;
  export function wafIntercept(): void;
  export class TerminologyServiceApi {
    constructor(baseUrl: string, getAccessToken: () => string);
    checkLogin(): Promise<Boolean>;
    loginUMLS(apiKey: string): Promise<string>;
    logoutUMLS(): Promise<Boolean>;
  }
  export function useTerminologyServiceApi(): TerminologyServiceApi;
  export class MeasureServiceApi {
    constructor(baseUrl: string, getAccessToken: () => string);
    fetchMeasure(id: string): Promise<Measure>;
    unlockMeasures(): Promise<String>;
    checkMeasureLocked(id: string): Promise<string>;
  }

  export class CqlLibraryServiceApi {
    constructor(baseUrl: string, getAccessToken: () => string);
    fetchAllOwners(librarySetIds: string[]): Promise<string[]>;
    unlockLibraries(): Promise<String>;
  }
  export function useMeasureServiceApi(): MeasureServiceApi;
  export function useCqlLibraryServiceApi(): CqlLibraryServiceApi;
  export function useDocumentTitle(
    title: string,
    prevailOnMount?: boolean
  ): void;

  export const bootstrap: LifeCycleFn<void>;
  export const mount: LifeCycleFn<void>;
  export const unmount: LifeCycleFn<void>;
  export const axios: AxiosInstance;
  export const ApiContextProvider: React.Provider<ServiceConfig>;
  export const ApiContextConsumer: React.Consumer<ServiceConfig>;
  export const OktaConfig: OktaConfig;
}

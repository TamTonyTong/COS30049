import { MetaMaskInpageProvider } from "@metamask/providers";

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider & {
      request: (args: {
        method: string;
        params?: unknown;
      }) => Promise<any>;
    };
  }
}
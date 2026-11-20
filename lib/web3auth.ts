import { Web3Auth, WEB3AUTH_NETWORK } from "@web3auth/modal";

// The app shell, home page, and login page must share one Web3Auth modal.
let web3AuthPromise: Promise<Web3Auth> | null = null;

export const WEB3AUTH_STATE_CHANGED_EVENT = "web3auth-state-changed";

export function notifyWeb3AuthStateChanged(): void {
  window.dispatchEvent(new Event(WEB3AUTH_STATE_CHANGED_EVENT));
}

export async function getWeb3Auth(): Promise<Web3Auth> {
  const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;
  if (!clientId) {
    throw new Error("NEXT_PUBLIC_WEB3AUTH_CLIENT_ID is not configured.");
  }

  if (!web3AuthPromise) {
    const web3auth = new Web3Auth({
      clientId,
      web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
      uiConfig: {
        theme: { primary: "#16a34a" },
      },
    });

    web3AuthPromise = web3auth
      .init()
      .then(() => web3auth)
      .catch((error: unknown) => {
        web3AuthPromise = null;
        throw error;
      });
  }

  return web3AuthPromise;
}

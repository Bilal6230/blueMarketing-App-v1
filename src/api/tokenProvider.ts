type TokenProvider = () => Promise<string | null> | string | null;
type UnauthorizedHandler = () => Promise<void> | void;

let tokenProvider: TokenProvider = () => null;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function registerTokenProvider(provider: TokenProvider) {
  tokenProvider = provider;
}

export function registerUnauthorizedHandler(handler: UnauthorizedHandler) {
  unauthorizedHandler = handler;
}

export async function getAccessTokenForRequest() {
  return tokenProvider();
}

export async function notifyUnauthorized() {
  if (unauthorizedHandler) {
    await unauthorizedHandler();
  }
}

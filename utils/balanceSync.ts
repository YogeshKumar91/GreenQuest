export const GREENQUEST_BALANCE_KEY = "greenquest_balance";

export function getStoredBalance() {
  const rawValue = Number(localStorage.getItem(GREENQUEST_BALANCE_KEY) ?? "0");
  return Number.isFinite(rawValue) ? Math.max(0, rawValue) : 0;
}

export function syncGreenquestBalance(balance: number) {
  const safeBalance = Number.isFinite(balance) ? Math.max(0, balance) : 0;
  localStorage.setItem(GREENQUEST_BALANCE_KEY, String(safeBalance));
  window.dispatchEvent(
    new CustomEvent("balanceUpdated", {
      detail: safeBalance,
    })
  );
}

// src/components/BalanceDisplay.tsx
type BalanceDisplayProps = {
  balance: string | null;
  usdValue: string | null;
};

export default function BalanceDisplay({
  balance,
  usdValue,
}: BalanceDisplayProps) {
  return (
    <div>
      {balance !== null && (
        <p className="mt-4 text-lg text-white">
          Balance: <span className="text-blue-400">{balance} ETH</span>
        </p>
      )}
      {usdValue !== null && (
        <p className="mt-4 text-lg text-white">
          USD Value: <span className="text-green-400">${usdValue} USD</span>
        </p>
      )}
    </div>
  );
}

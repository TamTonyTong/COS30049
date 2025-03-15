import React, { useState } from "react";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { AlertCircle } from "lucide-react";

interface BlockRangeSelectorProps {
  blockRange: number;
  setBlockRange: (range: number) => void;
}

const BlockRangeSelector: React.FC<BlockRangeSelectorProps> = ({
  blockRange,
  setBlockRange,
}) => {
  const [inputValue, setInputValue] = useState<string>(blockRange.toString());
  const [error, setError] = useState<string | null>(null);

  const MIN_BLOCKS = 30;
  const MAX_BLOCKS = 90;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    // Clear error if user is typing
    if (error) setError(null);
  };

  const handleApply = () => {
    const value = parseInt(inputValue, 10);

    // Validate input
    if (isNaN(value)) {
      setError("Please enter a valid number");
      return;
    }

    if (value < MIN_BLOCKS) {
      setError(`Block range must be at least ${MIN_BLOCKS}`);
      setInputValue(MIN_BLOCKS.toString());
      setBlockRange(MIN_BLOCKS);
      return;
    }

    if (value > MAX_BLOCKS) {
      setError(`Block range cannot exceed ${MAX_BLOCKS}`);
      setInputValue(MAX_BLOCKS.toString());
      setBlockRange(MAX_BLOCKS);
      return;
    }

    // Apply valid value
    setBlockRange(value);
    setError(null);
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApply();
    }
  };

  return (
    <div className="mb-4 space-y-2">
      <div className="flex flex-col">
        <Label htmlFor="block-range" className="text-sm font-medium">
          Block Range
        </Label>
        {blockRange > 60 && (
          <span className="mt-1 text-xs text-yellow-500">
            Warning: Larger block ranges may take longer to load
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          id="block-range"
          type="number"
          min={MIN_BLOCKS}
          max={MAX_BLOCKS}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-24"
          placeholder="30-90"
        />
        <Button
          onClick={handleApply}
          size="sm"
          variant="secondary"
          className="h-9"
        >
          Apply
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-1 text-xs text-red-400">
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-1 text-xs text-gray-500">
        <span>
          Allowed range: {MIN_BLOCKS} to {MAX_BLOCKS} blocks
        </span>
      </div>
    </div>
  );
};

export default BlockRangeSelector;

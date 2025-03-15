import React from "react";
import { Slider } from "@/src/components/ui/slider";
import { Label } from "@/src/components/ui/label";

interface BlockRangeSelectorProps {
  blockRange: number;
  setBlockRange: (range: number) => void;
}

const BlockRangeSelector: React.FC<BlockRangeSelectorProps> = ({
  blockRange,
  setBlockRange,
}) => {
  const handleSliderChange = (values: number[]) => {
    setBlockRange(values[0]);
  };

  return (
    <div className="mb-4 space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="block-range">Block Range: {blockRange}</Label>
        {blockRange > 60 && (
          <span className="text-xs text-yellow-500">
            Warning: Larger block ranges may take longer to load
          </span>
        )}
      </div>
      <Slider
        id="block-range"
        min={30}
        max={90}
        step={10}
        value={[blockRange]}
        onValueChange={handleSliderChange}
        className="w-full"
      />
      <div className="flex w-full justify-between text-xs text-gray-500">
        <span>30</span>
        <span>50</span>
        <span>70</span>
        <span>90</span>
      </div>
    </div>
  );
};

export default BlockRangeSelector;

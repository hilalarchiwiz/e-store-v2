// components/Admin/Specification.tsx

'use client'

import { Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react';

// Define the shape of a single specification object
interface ProductSpecification {
  key: string;
  value: string;
}

// Define props for the component
interface SpecificationProps {
  // We are setting the type to 'any' here, as the input might be an object or an array
  defaultSpecs?: any;
  onSpecChange?: (specs: any) => void; // Add this
}

// Helper to convert an object of specs into the array format
const convertObjectToArray = (obj: { [key: string]: string }): ProductSpecification[] => {
  return Object.entries(obj).map(([key, value]) => ({
    key: key.toString(),
    value: value.toString(),
  }));
};


// Helper to ensure an array is never empty, adding a placeholder if needed
const ensureMinimumSpec = (specs: any): ProductSpecification[] => {
  let normalizedSpecs: ProductSpecification[] = [];

  if (!specs) {
    // Case 1: Null/Undefined input
    normalizedSpecs = [];
  } else if (Array.isArray(specs)) {
    // Case 2: Input is already an array (for new products, or if DB stores as array)
    normalizedSpecs = specs;
  } else if (typeof specs === 'object' && specs !== null) {
    // Case 3: Input is a plain object (your current data structure)
    normalizedSpecs = convertObjectToArray(specs);
  }

  // Ensure there's at least one empty row for editing/adding
  if (normalizedSpecs.length === 0) {
    return [{ key: '', value: '' }];
  }

  // Ensure all items conform to ProductSpecification just in case 'any' was used
  return normalizedSpecs.map(spec => ({
    key: spec.key || '',
    value: spec.value || ''
  }));
}

const Specification = ({ defaultSpecs, onSpecChange }: SpecificationProps) => {
  const [specifications, setSpecifications] = useState<ProductSpecification[]>(
    ensureMinimumSpec(defaultSpecs)
  );

  // NOTE: You might want to use a useEffect to update state if defaultSpecs changes
  // after the initial render (e.g., if you fetch the product data after the component mounts).
  /*
  useEffect(() => {
      setSpecifications(ensureMinimumSpec(defaultSpecs));
  }, [defaultSpecs]);
  */

  useEffect(() => {
    if (defaultSpecs && Object.keys(defaultSpecs).length > 0) {
      setSpecifications(ensureMinimumSpec(defaultSpecs));
    }
  }, [defaultSpecs]);

  const handleAddSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
    if (onSpecChange) {
      onSpecChange([...specifications, { key: '', value: '' }]);
    }
  };

  // Remove specification row
  const handleRemoveSpecification = (index: number) => {
    const filteredSpecs = specifications.filter((_, i) => i !== index);
    setSpecifications(ensureMinimumSpec(filteredSpecs));
    if (onSpecChange) {
      onSpecChange(filteredSpecs);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Stop the form from submitting
      handleAddSpecification(); // Trigger your add spec logic
    }
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    const pasteData = e.clipboardData.getData('text');
    const rows = pasteData.split(/\r?\n/).filter(row => row.trim() !== "");

    // Check if the pasted data actually looks like a table/multiple lines
    if (rows.length > 1 || rows[0].includes('\t')) {
      e.preventDefault(); // Stop the default single-input paste

      const newSpecs: ProductSpecification[] = rows.map(row => {
        // Split by tab (standard for table copies) or multiple spaces
        const columns = row.split(/\t| {2,}/);
        return {
          key: columns[0]?.trim() || "",
          value: columns[1]?.trim() || ""
        };
      }).filter(spec => spec.key !== ""); // Clean empty rows

      setSpecifications(newSpecs);
      onSpecChange?.(newSpecs);
    }
  };
  const handleSpecificationChange = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
    if (onSpecChange) {
      onSpecChange(updated);
    }
  };

  return (
    <div className=" py-6" onPaste={handlePaste}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Specifications</h2>
        <button
          onClick={handleAddSpecification}
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Spec
        </button>
      </div>

      <div className="space-y-3">
        {/* .map() will now work because specifications is guaranteed to be an array */}
        {specifications.map((spec, index) => {
          return (
            <div key={index} className="flex gap-3">
              {/* Key Input */}
              <input
                name={`spec-key-${index}`}
                type="text"
                value={spec.key}
                onKeyDown={handleKeyDown} // Intercept Enter key
                onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                placeholder="Specification name (e.g., Battery Life)"
              />
              {/* Value Input */}
              <input
                type="text"
                name={`spec-value-${index}`}
                value={spec.value}
                onKeyDown={handleKeyDown} // Intercept Enter key
                onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                placeholder="Value (e.g., 30 hours)"
              />
              {/* Remove Button Logic */}
              {(specifications.length > 1 || spec.key || spec.value) && (
                <button
                  type="button"
                  onClick={() => handleRemoveSpecification(index)}
                  className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Hidden Input for Server Action counting */}
      <input type="hidden" name="spec_count" value={specifications.length} />

    </div>
  )
}

export default Specification;
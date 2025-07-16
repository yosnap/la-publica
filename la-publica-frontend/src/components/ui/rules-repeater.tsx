import { useState } from "react";
import { Plus, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RulesRepeaterProps {
  value: string[];
  onChange: (rules: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const RulesRepeater = ({
  value = [],
  onChange,
  placeholder = "Escribir regla del grupo",
  disabled = false,
  className = ""
}: RulesRepeaterProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addRule = () => {
    onChange([...value, ""]);
  };

  const removeRule = (index: number) => {
    const newRules = value.filter((_, i) => i !== index);
    onChange(newRules);
  };

  const updateRule = (index: number, newValue: string) => {
    const newRules = [...value];
    newRules[index] = newValue;
    onChange(newRules);
  };

  const moveRule = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= value.length) return;
    
    const newRules = [...value];
    const [movedRule] = newRules.splice(fromIndex, 1);
    newRules.splice(toIndex, 0, movedRule);
    onChange(newRules);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      moveRule(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Reglas del grupo
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRule}
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-1" />
          Agregar regla
        </Button>
      </div>

      {value.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-sm">No hay reglas definidas</p>
          <p className="text-xs text-gray-400 mt-1">
            Haz clic en "Agregar regla" para empezar
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {value.map((rule, index) => (
            <div
              key={index}
              className={`
                flex items-center space-x-2 p-3 border rounded-lg bg-white
                ${draggedIndex === index ? 'shadow-lg border-blue-300' : 'border-gray-200'}
                ${disabled ? 'opacity-50' : ''}
              `}
              draggable={!disabled}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              { /* Drag handle */}
              <div className="cursor-move text-gray-400 hover:text-gray-600">
                <GripVertical className="h-4 w-4" />
              </div>

              { /* Rule number */}
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                {index + 1}
              </div>

              { /* Rule input */}
              <Input
                value={rule}
                onChange={(e) => updateRule(index, e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className="flex-1 border-0 focus:ring-0 focus:border-0 px-0"
              />

              { /* Remove button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeRule(index)}
                disabled={disabled}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <div className="text-xs text-gray-500 mt-2">
          💡 Tip: Arrastra las reglas para reordenarlas
        </div>
      )}
    </div>
  );
};
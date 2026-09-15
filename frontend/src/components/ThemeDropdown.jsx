import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Premium Theme Dropdown component to replace standard grey native HTML selects
 * @param {Object} props
 * @param {string|number} props.value - Currently selected value
 * @param {(val: any) => void} props.onChange - Callback with newly selected value
 * @param {Array<{value: any, label: string, icon?: React.ReactNode, dotColor?: string, badge?: string, description?: string}>|Array<string>} props.options
 * @param {React.ReactNode} [props.icon] - Leading icon for the trigger button
 * @param {string} [props.placeholder] - Fallback placeholder text
 * @param {string} [props.className] - Outer wrapper classes
 * @param {string} [props.buttonClassName] - Additional classes for trigger button
 * @param {string} [props.menuClassName] - Additional classes for floating menu
 * @param {'left'|'right'} [props.align='left'] - Menu alignment
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {'sm'|'md'} [props.size='md'] - Sizing preset
 */
export default function ThemeDropdown({
  value,
  onChange,
  options = [],
  icon: TriggerIcon,
  placeholder = 'Select...',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  align = 'left',
  disabled = false,
  size = 'md'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Normalize options array to standard object format
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value,
        label: opt.label !== undefined ? opt.label : String(opt.value),
        icon: opt.icon,
        dotColor: opt.dotColor,
        badge: opt.badge,
        description: opt.description
      };
    }
    return {
      value: opt,
      label: String(opt)
    };
  });

  // Find currently selected item
  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value));

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val) => {
    if (onChange) {
      onChange(val);
    }
    setIsOpen(false);
  };

  const isSmall = size === 'sm';

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 font-bold transition-all duration-200 cursor-pointer select-none rounded-xl border ${
          isSmall ? 'px-2.5 py-1.5 text-[11px]' : 'px-3 py-2.5 text-xs'
        } ${
          isOpen
            ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-sm text-slate-900'
            : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200 text-slate-700 hover:border-slate-300 shadow-2xs'
        } ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate">
          {/* Custom Trigger Icon */}
          {TriggerIcon && (
            <span className="text-slate-400 flex-shrink-0 flex items-center">
              {React.isValidElement(TriggerIcon) ? TriggerIcon : <TriggerIcon size={isSmall ? 13 : 15} />}
            </span>
          )}

          {/* Selected Option Dot Color (if any) */}
          {selectedOption?.dotColor && (
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${selectedOption.dotColor}`} />
          )}

          {/* Selected Option Custom Icon (if any) */}
          {selectedOption?.icon && !TriggerIcon && (
            <span className="flex-shrink-0 text-slate-500">{selectedOption.icon}</span>
          )}

          {/* Selected Label */}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        {/* Chevron Indicator */}
        <ChevronDown
          size={isSmall ? 13 : 14}
          className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Popover (Completely Solid & Opaque) */}
      {isOpen && (
        <div
          className={`absolute z-[70] mt-1.5 min-w-[170px] w-max max-w-xs rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-900/20 p-1.5 space-y-0.5 transition-all animate-fade-in ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${menuClassName}`}
          style={{ backgroundColor: '#ffffff', opacity: 1 }}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = String(opt.value) === String(value);

            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer group ${
                  isSelected
                    ? 'bg-blue-50 text-blue-700 font-extrabold shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {/* Status Dot */}
                  {opt.dotColor && (
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${opt.dotColor}`} />
                  )}

                  {/* Option Icon */}
                  {opt.icon && (
                    <span className={`flex-shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                      {opt.icon}
                    </span>
                  )}

                  <div className="truncate">
                    <span className="block truncate">{opt.label}</span>
                    {opt.description && (
                      <span className="block text-[10px] text-slate-400 font-medium truncate">
                        {opt.description}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right side check or badge */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {opt.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-medium">
                      {opt.badge}
                    </span>
                  )}
                  {isSelected && (
                    <Check size={14} className="text-blue-600 flex-shrink-0 stroke-[2.5]" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React, { useState, ReactNode } from 'react';

// Props for the individual TabButton
interface TabButtonProps {
  title: string;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ title, isActive, onClick }) => {
  // Style Guide: Padding sm (8px) vert, md (16px) horiz. Font Small (14px) Medium (500). Radius 6px (rounded-md).
  const baseStyles = 'py-sm px-md cursor-pointer text-center focus:outline-none text-sm font-medium rounded-md transition-all duration-200 ease-in-out motion-safe:hover:translate-y-[-2px] motion-safe:active:translate-y-[1px]'; 
  
  // Style Guide Active: Bg Surface, Text Primary. Inactive: Text Secondary.
  const activeStyles = isActive
    ? 'bg-neutral-surface text-neutral-text-primary dark:bg-neutral-surface dark:text-neutral-text-primary shadow-sm' // Added shadow-sm for active tab for slight elevation
    : 'text-neutral-text-secondary dark:text-neutral-text-secondary hover:bg-neutral-surface-hover hover:text-neutral-text-primary dark:hover:bg-neutral-surface-hover dark:hover:text-neutral-text-primary';
  
  return (
    <button 
      onClick={onClick} 
      className={`${baseStyles} ${activeStyles}`}
      role="tab"
      aria-selected={isActive}
    >
      {title}
    </button>
  );
};

// Interface for each tab item
export interface TabItem { 
  id?: string | number; 
  title: string;
  content: ReactNode;
}

// Props for the main Tabs component
interface TabsProps {
  items: TabItem[];
  initialActiveIndex?: number;
  className?: string; 
  tabListClassName?: string; 
  tabPanelClassName?: string; 
}

const Tabs: React.FC<TabsProps> = ({
  items,
  initialActiveIndex = 0,
  className = '',
  tabListClassName = '',
  tabPanelClassName = '',
}) => {
  const [activeTabIndex, setActiveTabIndex] = useState<number>(initialActiveIndex);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Style Guide Container: Bg Background (Light), #252A2E (Dark), Padding xs (4px), Radius 8px (rounded-lg) */}
      <div 
        className={`flex bg-neutral-background dark:bg-secondary p-xs rounded-lg mb-md ${tabListClassName}`} 
        role="tablist"
      >
        {items.map((item, index) => (
          <TabButton
            key={item.id || item.title || index} 
            title={item.title}
            isActive={activeTabIndex === index}
            onClick={() => setActiveTabIndex(index)}
          />
        ))}
      </div>
      <div 
        role="tabpanel"
        aria-labelledby={items[activeTabIndex]?.title} 
        className={`mt-md ${tabPanelClassName}`} // Ensure spacing if mb-md was removed from tabList
      >
        {items[activeTabIndex]?.content}
      </div>
    </div>
  );
};

export default Tabs; 
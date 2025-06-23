type SectionKey = "general" | "work" | "social" | "biography";

interface SectionTabsProps {
    activeSection: string;
    onSectionChange: (section: SectionKey) => void;
  }
  
  const SectionTabs = ({ activeSection, onSectionChange }: SectionTabsProps) => {
    const tabs: { key: SectionKey; label: string }[] = [
      { key: "general", label: "Información General" },
      { key: "work", label: "Experiencia Laboral" },
      { key: "social", label: "Social" },
      { key: "biography", label: "Biografía" },
    ];
  
    return (
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onSectionChange(tab.key)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeSection === tab.key
                  ? "border-[#4F8FF7] text-[#4F8FF7]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    );
  };
  
  export default SectionTabs;
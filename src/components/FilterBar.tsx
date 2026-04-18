interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  activeCategory: string;
  setActiveCategory: (val: string) => void;
}

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
}: FilterBarProps) {
  const categories = ["Semua", "Kafe", "Warkop", "Restoran", "Warung Makan", "Food Court"];

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      
      {/* Search Bar */}
      <div className="relative w-full md:w-96">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama tempat..."
          className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
        />
        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </button>
      </div>

      {/* Quick Category Chips */}
      <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
        {categories.map((cat, index) => (
          <button
            key={index}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? "bg-gray-800 text-white shadow-md"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      
    </div>
  );
}
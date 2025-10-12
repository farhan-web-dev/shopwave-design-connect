import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const HeaderSearchBar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="hidden md:flex flex-1 max-w-xl mx-8">
      <div className="relative w-full flex">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 w-full"
        />
        <Button
          className="ml-2 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleSearch}
        >
          Search
        </Button>
      </div>
    </div>
  );
};

export default HeaderSearchBar;

// src/pages/nurse/MyBedsPage.jsx — same as BedsPage:
import BedGrid from '../../components/beds/BedGrid';
export default function MyBedsPage() {
  return <div><h1 className="text-2xl font-bold mb-6">🛏️ ICU Beds</h1><BedGrid /></div>;
}
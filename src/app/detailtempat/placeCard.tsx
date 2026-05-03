export default function PlaceCard({ place }: { place: any }) {
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white">
      <h3 className="font-bold text-lg">{place.name}</h3>
      <p className="text-yellow-500 font-semibold">⭐ {place.rating}</p>
      <p className="text-gray-600 italic mt-2">"{place.review}"</p>
      {place.voucher && (
        <p className="mt-2 text-sm font-mono bg-blue-50 text-blue-700 p-1 inline-block rounded">
          Voucher: {place.voucher}
        </p>
      )}
    </div>
  );
}
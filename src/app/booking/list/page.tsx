import prisma from "@/lib/prisma";

export default async function BookingListPage() {

  const bookings = await prisma.booking.findMany({
    orderBy: {
      tanggal: "desc",
    },
  });

  return (
    <div className="max-w-3xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">
        Riwayat Booking
      </h1>

      {bookings.length === 0 && (
        <p>Belum ada booking.</p>
      )}

      <div className="space-y-4">

        {bookings.map((booking) => (

          <div
            key={booking.id}
            className="border rounded-2xl p-5 bg-white shadow-sm"
          >

            <h2 className="text-xl font-bold">
              {booking.nama}
            </h2>

            <p className="mt-2">
              📅
              {" "}
              {new Date(
                booking.tanggal
              ).toLocaleDateString("id-ID")}
            </p>

            <p>
              🕒
              {" "}
              {booking.jam}
            </p>

            <p>
              📞
              {" "}
              {booking.nomor}
            </p>

          </div>

        ))}

      </div>

    </div>
  );
}
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Cari data booking
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { tempat: true }
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking tidak ditemukan" },
        { status: 404 }
      );
    }

    // Jika sudah ada QRIS yang digenerate sebelumnya, kembalikan langsung
    if (booking.midtrans_qr) {
      return NextResponse.json({
        success: true,
        message: "Mengambil data pembayaran sebelumnya",
        midtrans_qr: booking.midtrans_qr,
        midtrans_id: booking.midtrans_id,
        dp_harga: booking.dp_harga || 10000,
        order_id: booking.midtrans_id
      });
    }

    // Hitung nominal gross_amount (DP).
    // Midtrans melarang nominal Rp 0. Jika Rp 0, beri default minimal Rp 10.000 untuk pengujian sandbox.
    let dpHarga = booking.dp_harga || 0;
    if (dpHarga <= 0) {
      dpHarga = 10000; // default booking fee jika no pre-order
    }

    // Midtrans Credentials
    const SERVER_KEY = "Mid-server-Q0XW9AUPrIYeGCP4uYopq1st";
    const authString = Buffer.from(`${SERVER_KEY}:`).toString("base64");

    // Suffix order_id dengan timestamp agar selalu unik di Midtrans
    const midtransOrderId = `BK-${id.slice(-6).toUpperCase()}-${Date.now()}`;

    // 2. Request ke API Midtrans Core (Sandbox)
    const midtransRes = await fetch("https://api.sandbox.midtrans.com/v2/charge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Basic ${authString}`
      },
      body: JSON.stringify({
        payment_type: "qris",
        transaction_details: {
          order_id: midtransOrderId,
          gross_amount: dpHarga
        },
        qris: {
          acquirer: "gopay"
        }
      })
    });

    const midtransData = await midtransRes.json();
    console.log("MIDTRANS CHARGE RESPONSE:", midtransData);

    if (midtransRes.status >= 400 || !midtransData.actions) {
      return NextResponse.json({
        success: false,
        message: midtransData.status_message || "Gagal menghubungi pembayaran Midtrans",
        error: midtransData
      }, { status: 400 });
    }

    // Dapatkan url QR code dari tindakan "generate-qr-code"
    const qrAction = midtransData.actions.find((act: any) => act.name === "generate-qr-code");
    const qrUrl = qrAction ? qrAction.url : "";

    if (!qrUrl) {
      return NextResponse.json({
        success: false,
        message: "URL QRIS tidak ditemukan dalam respon Midtrans."
      }, { status: 500 });
    }

    // 3. Simpan token & URL ke database booking
    const bookingUpdated = await prisma.booking.update({
      where: { id },
      data: {
        midtrans_id: midtransOrderId,
        midtrans_qr: qrUrl,
        dp_harga: dpHarga // update dp_harga jika sebelumnya 0
      }
    });

    // 4. Kirim respon JSON ke frontend/user
    return NextResponse.json({
      success: true,
      message: "Berhasil mengenerate QRIS Midtrans",
      midtrans_qr: qrUrl,
      midtrans_id: midtransOrderId,
      dp_harga: dpHarga,
      midtrans_raw_response: midtransData
    });

  } catch (error: any) {
    console.error("API PAY-DP ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server", error: error.message },
      { status: 500 }
    );
  }
}

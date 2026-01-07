import crypto from "crypto";

export default async function handler(req, res) {
  try {
    const nomor =
      req.method === "POST"
        ? req.body?.nomor
        : req.query?.nomor;

    if (!nomor || !/^[0-9]{8,15}$/.test(nomor)) {
      return res.status(400).json({ status: "gagal" });
    }

    const agent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/136.0.0.0 Safari/537.36";

    const sessionHeaders = {
      "User-Agent": agent
    };

    /* =========================
       STEP 1: AMBIL CSRF TOKEN
    ========================== */
    const loginRes = await fetch(
      "https://lms.cda.academy/website/login/",
      { headers: sessionHeaders }
    );

    const cookies = loginRes.headers.get("set-cookie") || "";
    const html = await loginRes.text();

    const csrfMatch = html.match(
      /name="csrfmiddlewaretoken" value="([^"]+)"/
    );

    if (!csrfMatch) {
      return res.status(500).json({ status: "gagal" });
    }

    const csrfToken = csrfMatch[1];

    /* =========================
       STEP 2: KIRIM OTP
    ========================== */
    const payload = new URLSearchParams({
      contact_no: `+62${nomor}`,
      mobile_no: nomor
    });

    const otpRes = await fetch(
      "https://lms.cda.academy/user/send-watsapp-otp/",
      {
        method: "POST",
        headers: {
          "Accept": "*/*",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "Origin": "https://lms.cda.academy",
          "Referer": "https://lms.cda.academy/website/login/",
          "User-Agent": agent,
          "X-CSRFToken": csrfToken,
          "X-Requested-With": "XMLHttpRequest",
          "Cookie": cookies
        },
        body: payload.toString()
      }
    );

    if (!otpRes.ok) {
      return res.status(500).json({ status: "gagal" });
    }

    /* =========================
       RESPONSE KE USER
       TANPA BOCOR API
    ========================== */
    return res.status(200).json({
      status: "berhasil"
    });

  } catch (e) {
    return res.status(500).json({
      status: "gagal"
    });
  }
      }

//import fs from "node:fs";
import { Cookie, CookieJar } from "tough-cookie";

const BASE_URL = "https://old.emmsa.com.pe";

namespace RepoEmmsa {
  export const pull = async () => {
    const cookieJar = new CookieJar();

    const h1 = new Headers({
      Priority: "u=4",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language": "en-US,en;q=0.5",
      Connection: "keep-alive",
      DNT: "1",
      Host: "old.emmsa.com.pe",
      Referer: "https://www.emmsa.com.pe/",
      "Sec-Fetch-Dest": "iframe",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "same-site",
      "Sec-GPC": "1",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36 Edg/92.0.902.84",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      Cookie: await cookieJar.getCookieString(BASE_URL),
    });

    const response = await fetch(
      `${BASE_URL}/emmsa_spv/rpEstadistica/rpt_precios-diarios-web.php`,
      {
        method: "GET",
        credentials: "include",
        headers: h1,
      }
    );

    const setCookieHeader = response.headers.get("set-cookie");
    if (!setCookieHeader) return;
    const resCookie = Cookie.parse(setCookieHeader);
    if (!resCookie) return;
    await cookieJar.setCookie(resCookie, BASE_URL);

    const h2 = new Headers({
      Accept: "text/html, */*; q=0.01",
      "Accept-Language": "en-US,en;q=0.5",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Origin: "https://old.emmsa.com.pe",
      Referer:
        "https://old.emmsa.com.pe/emmsa_spv/rpEstadistica/rpt_precios-diarios-web.php",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36 Edg/92.0.902.84",
      Cookie: await cookieJar.getCookieString(BASE_URL),
    });

    const formData = new URLSearchParams();
    formData.append("vid_tipo", "1");
    formData.append("vprod", "");
    formData.append("vvari", "");
    formData.append("vfecha", "23/06/2025");

    const response2 = await fetch(
      `${BASE_URL}/emmsa_spv/app/reportes/ajax/rpt07_gettable_new_web.php`,
      {
        method: "POST",
        credentials: "include",
        headers: h2,
        body: formData.toString(),
      }
    );

    console.log(await response2.text());
  };
}

RepoEmmsa.pull();

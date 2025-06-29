import fs from "node:fs/promises";
import { Cookie, CookieJar } from "tough-cookie";
import {
  BASE_URL,
  URL_COOKIES,
  URL_HEADERS,
  URL_RESPONSE,
  USER_AGENT,
} from "./common";

export const pull = async (): Promise<boolean> => {
  try {
    const cookieJar = new CookieJar();

    const h1 = new Headers({
      "Accept-Language": "en-US,en;q=0.5",
      Connection: "keep-alive",
      Referer: "https://www.emmsa.com.pe/",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent": URL_COOKIES,
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

    if (response.status !== 200) {
      throw Error(`💀 STATUS: ${response.status}`);
    } else {
      console.log(`😀 STATUS: ${response.status}`);
    }

    const setCookieHeader = response.headers.get("set-cookie");
    if (!setCookieHeader) throw Error("GET 'set-cookie' headers are empty.");
    const resCookie = Cookie.parse(setCookieHeader);
    if (!resCookie) throw Error("PARSED cookies are empty.");
    await cookieJar.setCookie(resCookie, BASE_URL);

    const h2 = new Headers({
      Accept: "text/html, */*; q=0.01",
      "Accept-Language": "en-US,en;q=0.5",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Origin: "https://old.emmsa.com.pe",
      Referer:
        "https://old.emmsa.com.pe/emmsa_spv/rpEstadistica/rpt_precios-diarios-web.php",
      "User-Agent": USER_AGENT,
      Cookie: await cookieJar.getCookieString(BASE_URL),
    });

    await fs
      .writeFile(URL_COOKIES, (await cookieJar.getCookies(BASE_URL)).join("\n"))
      .then(() => {
        console.log(`📝 Logged cookies in: ${URL_COOKIES}`);
      });

    await fs
      .writeFile(URL_HEADERS, Array.from(h2.entries()).join("\n"))
      .then(() => {
        console.log(`📝 Logged headers in: ${URL_HEADERS}.`);
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

    if (response2.status !== 200) {
      throw Error(`💀 STATUS: ${response2.status}`);
    } else {
      console.log(`😀 STATUS: ${response2.status}`);
    }

    await fs.writeFile(URL_RESPONSE, await response2.text()).then(() => {
      console.log(`📝 Logged response in: ${URL_RESPONSE}.`);
    });

    return true;
  } catch (e) {
    console.log("💀💀💀💀 PULL failed: ", e);
    return false;
  }
};

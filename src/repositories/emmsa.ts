import fs from "node:fs";
import { Cookie, CookieJar } from "tough-cookie";

const BASE_URL = "https://old.emmsa.com.pe";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36 Edg/92.0.902.84";

namespace RepoEmmsa {
  export const pull = async () => {
    try {
      const cookieJar = new CookieJar();

      const h1 = new Headers({
        "Accept-Language": "en-US,en;q=0.5",
        Connection: "keep-alive",
        Referer: "https://www.emmsa.com.pe/",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
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
      if (!setCookieHeader) throw Error("GET 'set-cookie' headers is empty.");
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

      await fs.writeFile(
        "./logs/emmsa.cookies.txt",
        (await cookieJar.getCookies(BASE_URL)).join("\n"),
        () => {
          console.log(`📝 Logged cookies in: ./logs/emmsa.cookies.txt`);
        }
      );
      await fs.writeFile(
        "./logs/emmsa.headers.txt",
        Array.from(h2.entries()).join("\n"),
        () => {
          console.log(`📝 Logged headers in: ./logs/emmsa.headers.txt`);
        }
      );

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

      await fs.writeFile(
        "./logs/emmsa.response.txt",
        await response2.text(),
        () => {
          console.log(`📝 Logged response in: ./logs/emmsa.response.txt`);
        }
      );
    } catch (e) {
      console.log("Reposity EMMSA failed: ", e);
    }
  };
}

RepoEmmsa.pull();

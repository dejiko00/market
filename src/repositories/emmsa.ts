import fs from "node:fs/promises";
import { Cookie, CookieJar } from "tough-cookie";
import ProductTypeController from "../controllers/product-type";
import ProductVarietyController from "../controllers/product-variety";
import dataSource from "../data-source";
import type ProductType from "../interfaces/product-type";
import type ProductVariety from "../interfaces/product-variety";
import extractAll from "../utils/regex/extractAll";
import textFix from "../utils/textFix";

const BASE_URL = "https://old.emmsa.com.pe";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36 Edg/92.0.902.84";

const COL_PRODUCT_TYPE = 0;
const COL_PRODUCT_VAR = 1;
const COL_PRODUCT_MIN = 2;
const COL_PRODUCT_MAX = 3;
const COL_PRODUCT_AVG = 4;

interface EmmsaRowProduct {
  type: string;
  variety: string;
  min: number;
  max: number;
  avg: number;
}

namespace RepoEmmsa {
  const URL_COOKIES = "./logs/emmsa.cookies.txt";
  const URL_HEADERS = "./logs/emmsa.headers.txt";
  const URL_RESPONSE = "./logs/emmsa.response.txt";

  export const pull = async (): Promise<boolean> => {
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
        .writeFile(
          URL_COOKIES,
          (await cookieJar.getCookies(BASE_URL)).join("\n")
        )
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

  export const parse = async (date: Date): Promise<boolean> => {
    try {
      const getTbodyContents = extractAll(
        /<tbody\b[^>]*>([\s\S]*?)<\/tbody>/gi
      );
      const getTrContents = extractAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi);
      const getTdContents = extractAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi);

      const data = await fs.readFile(URL_RESPONSE).catch((e) => {
        throw Error(e || `💀 Read file ${URL_RESPONSE} failed.`);
      });

      const tdGrouped = getTbodyContents(data.toString())
        .flatMap(getTrContents)
        .map(getTdContents);

      await fs
        .writeFile(
          "./logs/emmsa.parsed.txt",
          tdGrouped.map((v) => v.join(", ")).join("\n")
        )
        .catch((e) => {
          throw Error(e || `💀💀💀💀 PARSE FAILED`);
        });

      console.log(`😀 PARSE SUCCESS!`);

      const groupProducts = tdGrouped.reduce<
        Record<EmmsaRowProduct["type"], EmmsaRowProduct[]>
      >((acc, val) => {
        const type = textFix(val[COL_PRODUCT_TYPE]);
        const variety = textFix(val[COL_PRODUCT_VAR]);
        const min = parseFloat(val[COL_PRODUCT_MIN]);
        const max = parseFloat(val[COL_PRODUCT_MAX]);
        const avg = parseFloat(val[COL_PRODUCT_AVG]);

        if (acc[type] === undefined) acc[type] = [];
        acc[type].push({ type, min, max, avg, variety });
        return acc;
      }, {});

      const productTypesKeys = Object.keys(groupProducts).map(textFix);
      const repositoryDataSource = await dataSource.initialize();
      await repositoryDataSource.transaction(
        async (transactionalEntityManager) => {
          let productTypes = productTypesKeys.map<ProductType>((name) => ({
            name: name,
            date_added: date,
            date_modified: date,
          }));

          productTypes = await new ProductTypeController().addMany(
            productTypes,
            transactionalEntityManager
          );

          const productTypesMap = productTypes.reduce<
            Record<ProductType["name"], ProductType["id"]>
          >((acc, prodType) => {
            acc[prodType.name] = prodType.id;
            return acc;
          }, {});

          const productVarieties = Object.values(groupProducts)
            .flat()
            .flatMap<ProductVariety>((product) => {
              const idProductType = productTypesMap[product.type];
              if (idProductType === undefined) return [];
              return {
                id_product_type: idProductType,
                name: textFix(product.variety),
                date_added: date,
                date_modified: date,
              };
            });

          console.log(productVarieties);

          await new ProductVarietyController().addMany(
            productVarieties,
            transactionalEntityManager
          );
        }
      );
      console.log("😀😀😀😀 PARSE success.");
      return true;
    } catch (e) {
      console.log("💀💀💀💀 PARSE failed: ", e);
      return false;
    }
  };
}

const date = new Date();
RepoEmmsa.parse(date);

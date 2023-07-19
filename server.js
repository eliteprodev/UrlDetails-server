import express from "express";
import axios from "axios";
import cheerio from "cheerio";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/details", async (req, res) => {
  const { url } = req.body;
  console.log("------------------", url);
  try {
    const response = await axios.get(url, { timeout: 30000 });
    const $ = cheerio.load(response.data);

    const images = {};
    const internalLinks = [];
    const externalLinks = [];

    $("img").each((index, element) => {
      const imageUrl = $(element).attr("src");
      const extension = imageUrl.split(".").pop();
      if (!images[extension]) {
        images[extension] = { count: 0, size: 0 };
      }
      images[extension].count++;
      images[extension].size += parseInt($(element).attr("size") || 0);
    });

    $("a").each((index, element) => {
      const linkUrl = $(element).attr("href");
      if (linkUrl.startsWith("/") || linkUrl.startsWith(url)) {
        internalLinks.push(linkUrl);
      } else {
        externalLinks.push(linkUrl);
      }
    });

    res.json({ images, internalLinks, externalLinks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve URL details" });
  }
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

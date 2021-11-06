import fs from "fs";
import { promisify } from "util";
import recursiveReaddirFiles from "recursive-readdir-files";

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const ROOT_DIR = "./docs/";
const FORMAT = "utf-8";
const IMAGE_LINK_REGEX = /\]\(\/assets\//g;
const IMAGE_DOWNLOAD_LINK_PRIFIX =
  "](https://raw.githubusercontent.com/soonitoon/blog/master/assets/";

const writeMakrdownFile = async (path, modifiedMarkdownFile) => {
  try {
    await writeFile(path, modifiedMarkdownFile);
    console.log(`${path}: markdown file was successfully modified.`);
  } catch (err) {
    throw err;
  }
};

const modifyImageURL = async (path) => {
  let markdownText = "";

  try {
    markdownText = await readFile(path, FORMAT);
  } catch (err) {
    throw err;
  }

  const notModifiedArray = markdownText.match(IMAGE_LINK_REGEX);
  if (!notModifiedArray) return null;

  const modifiedMarkdownText = markdownText.replace(
    IMAGE_LINK_REGEX,
    IMAGE_DOWNLOAD_LINK_PRIFIX
  );

  return modifiedMarkdownText;
};

const readAllPathOfMarkdown = async () => {
  let allMarkdownFiles = [];

  try {
    allMarkdownFiles = await recursiveReaddirFiles(ROOT_DIR, {
      include: /\.md/,
    });
  } catch (err) {
    throw err;
  }

  const markdownPaths = allMarkdownFiles.map((fileObj) => fileObj.path);

  return markdownPaths;
};

const main = async () => {
  let cnt = 0;
  const markdownPaths = await readAllPathOfMarkdown();

  for (let path of markdownPaths) {
    const modifiedMarkdownText = await modifyImageURL(path);

    if (!modifiedMarkdownText) continue;

    await writeMakrdownFile(path, modifiedMarkdownText);
    cnt++;
  }
  console.log(`total: ${cnt} markdown files`);
};

main();

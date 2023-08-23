import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

/*
- fs : ファイル システムからファイルを読み取ることができる Node.js モジュール
- path : ファイル パスを操作できる Node.js モジュール
- matter : 各マークダウン ファイル内のメタデータを解析できるライブラリ
*/

const postsDirectory = path.join(process.cwd(), "posts");

export function getSortedPostsData() {
  // /postsディレクトリ以下のファイル名を取得する
  const fileNames = fs.readdirSync(postsDirectory);

  // 全ての投稿データを取得
  const allPostsData = fileNames.map((fileName) => {
    // 拡張子「.md」を除去する
    const id = fileName.replace(/\.md$/, "");

    // マークダウンファイルを文字列文書として読み込む
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // gray-matterライブラリを使ってメタデータを解析する
    const matterResult = matter(fileContents);

    // データをIDと組み合わせる
    return {
      id,
      ...matterResult.data,
    };
  });

  // 全ての投稿データを日付順にソートする
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);

  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ""),
      },
    };
  });

  // 以下のようなオブジェクトの配列の値が返ってくる
  // [
  //   {
  //     params: {
  //       id: 'ssg-ssr'
  //     }
  //   },
  //   {
  //     params: {
  //       id: 'pre-rendering'
  //     }
  //   }
  // ]
}

export async function getPostData(id) {
  const fullPath = path.join(postsDirectory, `${id}.md`); // 拡張子も含めた投稿データのフルパス
  const fileContents = fs.readFileSync(fullPath, "utf-8"); // その投稿データの中身を文字列で読み込み

  const matterResult = matter(fileContents); // gray-matterライブラリで中身を解析

  const processedContent = await remark() // remarkライブラリでHTML形式にする
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    id,
    contentHtml,
    ...matterResult.data,
  };
}

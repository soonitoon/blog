---
title: 블로그 배포 시 이미지 태그 변환 자동화
has_children: false
parent: blog
grand_parent: new features
nav_order: 1
---

# 블로그 이미지 업로드 자동화 코드 작성기

## 시작

Velog에서 GitHub page로 블로그를 이전하면서 느낀점 중 하나는 블로그 작성은 가벼워야 한다는 것입니다. 때문에 브라우저 편집창과 코드 편집기를 왔다갔다 하지 않고 터미널에서 가볍게 날 것 그대로의 마크다운으로 글을 쓸 수 있는 방식을 선택했습니다. 심지어 별도의 지킬 프로젝트를 레포지토리에 구성하지 않아도 깃헙에서 마크다운 파일을 스테틱 파일로 빌드해주니 더욱 편합니다.

GitHub page를 통한(빌드 기능까지 활용한) 블로그 배포의 단점이라고 한다면 이미지 첨부가 힘들다는 것입니다. 이미지 파일 확장자의 대소문자, 마크다운 링크의 절대경로/상대경로의 여부, 이미지 파일이 들어있는 디렉토리명 등, 빌드된 페이지에 이미지가 제대로 첨부되지 않았을 때 고려해야 할 사항들이 너무 많았습니다(물론 구글링을 통해 얻은 정보로, 여기에 적은 모든 방법은 이미 시도해보았습니다.).

GitHub에서 마크다운 파일을 빌드하는 원리를 좀 더 파보던가, 자동 빌드를 사용하지 않고 로컬에서 지킬 프로젝트를 구성해서 직접 빌드할 수도 있을 것입니다. 그러나 저는 이미지를 정상적으로 첨부할 수 있는 꼼수를 하나 생각했습니다.

깃헙 레포지토리에 있는 이미지 파일을 레포지토리 홈페이지에 들어가서 보면 다운로드 할 수 있는 버튼이 있습니다. 해당 다운로드 URL은 `https://raw.githubusercontent.com/깃헙닉네임/레포이름/브랜치/디렉토리/이미지.png`와 같은 형식으로 만들어집니다. 로컬에서 마크다운에 이미지를 첨부할 때는 `/asstes/이미지.png`와 같은 방식으로 첨부하게 됩니다. 따라서 로컬에서 첨부한 이미지 경로 앞에 고정되어 있는 URL을 자동으로 붙여준다면 로컬에서 이미지를 볼 수도 있고 빌드된 페이지에도 정상적으로 이미지가 들어가게 됩니다. 이렇게 이미지 URL을 바꾸는 과정을 푸쉬 전에 자동으로 일어나게 하면 될 것입니다.

## 자동화 코드

### 사전 작업

우선 필요한 모듈을 `import` 합니다.

```javascript
import fs from "fs";
import { promisify } from "util";
import recursiveReaddirFiles from "recursive-readdir-files";
```

`fs`의 경우 마크다운 파일을 읽고 쓰기 위해 필요합니다. `promisfy`를 통해 `readFile`과 `writeFile`을 프로미스로 감싸서 `async await` 구문을 사용할 수 있도록 하겠습니다. 콜백이나 `then`을 사용할 수도 있지만 `await`를 사용한 코드가 좀 더 직관적인 것 같아 가능하다면 `await`를 사용하려고 합니다. `recursiveReaddirFiles`는 구글링을 통해 찾은 NPM 모듈입니다. 인자로 받은 디렉토리부터 시작해서 모든 자식 디렉토리를 뒤지며 해당하는 파일을 찾아줍니다.

```javascript
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const ROOT_DIR = "./docs/";
const FORMAT = "utf-8";
const IMAGE_LINK_REGEX = /\]\(\/assets\//g;
const IMAGE_DOWNLOAD_LINK_PRIFIX =
  "](https://raw.githubusercontent.com/soonitoon/blog/master/assets/";
```

이제 자동화를 위한 사전작업을 해줍니다. 블로그 레포지토리에서 마크다운 파일 탐색을 시작할 위치는 `./docs`입니다. 한글 인코딩을 위해 `utf-8`을 포멧으로 사용합니다. 정규표현식은 `](/asstes/`을 이미지 링크로 찾을 수 있도록 만들었습니다. 자바스크립트의 `replace` 메소드를 모든 매치를 대상으로 사용하기 위해 정규식 뒤에 `g`를 붙입니다. 그리고 기존 이미지 링크에 붙일 다운로드 링크를 미리 변수로 저장합니다.

### 마크다운 파일 읽어들이기

```javascript
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
```

`main` 함수가 최종적으로 작동되도록 하고, `main`에서 사용할 함수들을 하나하나 만들어봅시다. 먼저 마크다운 파일을 읽어오는 함수를 구현합니다. 미리 지정한 루트 디렉토리부터 `.md` 확장자를 포함하는 파일명을 재귀적으로 찾아 배열 안에 저장합니다. 이렇게 가져온 각각의 파일은 단순한 파일명 문자열이 아니라 해당하는 파일에 관한 정보를 담고 있는 객체입니다. 자세한 내용은 [NPM 공식문서](https://www.npmjs.com/package/recursive-readdir-files)를 참고해주세요.

그리고 찾은 모든 마크다운 파일의 경로만 담은 배열을 만들어 최종적으로 반환합니다.

### 마크다운 이미지 경로 수정하기

```javascript
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
```

 위에서 찾은 마크다운 파일에서 이미지 URL을 변경하는 함수를 만들었습니다. `readFile` 함수를 통해 마크다운 파일을 읽어옵니다. 그리고 자바스크립트의 `match` 메소드에 위에서 만들어둔 정규식을 인자로 넘겨줍니다. 만약 매치되는 문자열이 없다면 이미지가 없는 파일이거나 이미 수정된 파일일 것입니다. 이런 경우에는 `null`을 얼리 리턴하여 함수를 끝냅니다. 매치가 하나라도 존재한다면 `replace` 메소드를 활용해 기존 이미지 경로에 고정된 URL를 붙여줍니다. 그리고 이렇게 이미지 URL만 바꾼 마크다운 파일의 텍스트를 반환합니다.

### 마크다운 파일 새로 쓰기

```javascript
const writeMakrdownFile = async (path, modifiedMarkdownText) => {
  try {
    await writeFile(path, modifiedMarkdownText);
    console.log(`${path}: markdown file was successfully modified.`);
  } catch (err) {
    throw err;
  }
};
```

이제 `writeMarkdownFile` 함수가 각각의 마크다운 파일의 경로와 텍스트를 인자로 받아 마크다운 파일을 새로 씁니다. 어떤 파일이 수정되었는지 알 수 있도록 작은 로거도 만들었습니다.

### 조립

```javascript
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
```

이제 드디어 `main` 함수입니다. `readAllPathOfMarkdown()` 함수를 통해 모든 마크다운 파일의 경로를 배열로 저장합니다. 그리고 반복문을 통해 경로 하나하나를 `modifyImageURL()` 함수에 넘겨줍니다. 만약 함수가 `null`을 반환하면(이미지가 포함되지 않은 파일이거나 이미 수정이 끝난 파일이라면) 다음 파일로 넘어갑니다. 그렇지 않다면 `writeMarkdownFile()` 함수를 통해 해당 마크다운 파일이 있었던 경로에 수정된 파일을 덮어씁니다. 소소하게 `cnt` 변수를 만들어 총 몇 개의 마크다운 파일이 수정되었는지 표시되도록 했습니다 :D

### 스크립트 자동 실행

```json
"scripts": {
 "prepublish": "node publish/image-url-convertor",
 "publish": "publish/publish.sh"
,
```

이제 깃헙에 푸쉬할 때마다 스크립트가 자동으로 실행되도록 만듭니다. 여러가지 방법이 있겠지만 저는 npm script를 활용했습니다. 이미 커밋과 푸쉬를 자동으로 해주는 `publish` 명령을 만들어두었습니다. 따라서 `prepublish`라는 이름의 명령어로 위에서 만든 스크립트를 실행하게 함으로써 `publish` 명령을 입력하면 항상 먼저 실행되도록 하였습니다.

## 마무리

몇 번의 디버깅 끝에 자동화 스크립트가 원하는 대로 동작하게 되었습니다. 어쩌면 이미지 첨부 하나 때문에 먼 길을 돌아간 건지도 모르겠습니다만, 역시 자신이 사용할 프로그램을 만드는 것이 가장 즐거운 것 같습니다.

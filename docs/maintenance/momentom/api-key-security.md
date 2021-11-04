---
title: API KEY 보안 및 배포 자동화
has_children: false
parent: momentom
grand_parent: maintenance
nav_order: 1
---

# API KEY를 숨기기 위한 기묘한 여정

![momentom image](assets/images/01.PNG)

**momentom**은 제가 웹 프로그래밍을 시작하고 처음으로 완성한 웹 페이지입니다. 비록 클론코딩 강의를 보며 만든 프로젝트였지만, 제 나름대로 API를 추가하고 조그만 기능과 디자인을 덧붙였던 기억이 납니다. 결과물은 [여기](https://momentom-70ca6.web.app/)에서, 레포지토리는 [여기](https://github.com/soonitoon/momentom)에서 볼 수 있습니다.

결론부터 말하자면 API KEY를 클라이언트 코드에 심어놓고 다른 사람들에게 보이지 않기를 바랐던 생각 자체가 모순이었습니다. 그러나 잘못된 접근 덕분에 꽤 많은 시도들을 할 수 있었습니다.

- GitHub secrets에 민감한 데이터를 저장해보았습니다.
- '순수한' webpack 및 wepback 플러그인을 사용해보았습니다.
- Firebase CLI 및 hosting을 사용해보았습니다.
- GitHub actions을 사용해 특정 브랜치 push, merge 이벤트 발생 시 ENV 삽입, 빌드, 배포 과정을 전부 자동화했습니다.

지금 글을 정리하며 돌이켜보면 내용 자체는 길지 않습니다. 그러나 일련의 자동화 흐름을 만드는 동안 시도했던 삽질들이 헛되지만은 않은 것 같습니다.

## GitHub secrets

로컬에서는 API KEY를 `.env` 파일 안에 저장해놓고 환경변수로 불러와 사용함으로써 간단하게 관리할 수 있습니다. 물론 `.gitignore`에 `.env`를 추가하면 원격 저장소에도 올라가지 않습니다. 문제는 빌드 과정을 GitHub actions으로 구현하고자 하는 경우입니다. 이럴 때 GitHub secrets에 민감한 정보를 저장해놓고 action을 실행할 때 해당 정보를 액션이 실행되는 가상환경에 끌고 와 환경변수로 사용할 수 있습니다.

![GitHub secrets image](/blogassets/images/03.PNG)

GitHub secret은 레포지토리 세팅 메뉴에서 설정할 수 있습니다. secret의 이름과 값을 등록하면 간단히 추가됩니다.

## webpack

### 기본 세팅 및 환경변수 가져오기

`.env` 파일에 저장된 API KEY를 읽어오기 위해 `dotenv` NPM 모듈을 사용하기로 했습니다. 배포 시 이를 정적 페이지로 빌드해야 하므로 웹펙을 사용합니다. 웹팩에서는 기존 `dotenv` 대신 `dotenv-webpack` 모듈을 웹팩 플러그인으로 사용합니다.

```javascript
const Dotenv = require("dotenv-webpack");

module.exports = {
  mode: "development",
  plugins: [new Dotenv()],
};
```

`webpack.config.js`에 플러그인을 적용하면 스크립트 내에서 `dotenv.config()`를 통해 `.env` 파일을 불러오지 않아도 됩니다.

```javascript
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
```

이제 API KEY를 스크립트에서 분리해서 관리하게 되었습니다. 이제 프로젝트를 배포할 수 있는 정적 페이지로 빌드해야 합니다. 사실 `create-react-app`을 통해 만든 리엑트 프로젝트에서 언제나 webpack으로 빌드가 이루어졌겠지만 webpack만을 별도로 설치해 직접 사용하는 것은 처음입니다.

우선 프로젝트 내에 웹팩과 웹팩 CLI를 `devDependency`로 설치합니다.

```shell
$ yarn add webpack webpack-cli -D
```

웹팩은 기본적으로 프로젝트 폴더의 `/src` 폴더 내부의 `index.js`를 빌드 시작 지점으로 사용합니다. 빌드 명령을 내리면 `index.js`와 연결된 모든 의존성 모듈을 통합하여 `main.js` 파일을 `/dist` 폴더 안에 만듭니다. `yarn run`을 통해 빌드를 진행할 수 있도록 스크립트를 등록합니다.

```json
"scripts": {
    "build": "npx webpack",
  }
```

이제 `$ yarn run build` 명령어로 웹팩을 빌드할 수 있습니다.

### HTML 템플릿

웹팩이 기본적으로 만들어주는 빌드 파일은 `main.js` 뿐입니다. 즉, HTML 파일은 직접 추가해야 합니다. HTML 파일도 자동으로 `/dist` 폴더 내부에 저절로 만들어질 수 있도록 웹팩 플러그인을 사용했습니다. `html-webpack-plugin`을 사용하면 지정한 템플릿에 `main.js`가 붙은 HTML 파일이 생성됩니다. 역시 `devDependency`로 설치하고 플러그인에 추가합니다.

```javascript
const Dotenv = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  plugins: [
    new Dotenv(),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
  ],
};
```

이제 빌드할 때마다 `/src/index.html`에 `main.js` 스크립트가 붙어서 `/dist` 폴더 안에 생성됩니다.

### CSS 로딩

이제 남은 문제는 CSS 파일입니다. 역시 CSS 또한 웹팩 플러그인을 통해 정적 파일에 추가할 수 있습니다. [웹팩 공식문서](https://webpack.js.org/loaders/style-loader/)에 따르면, CSS 파일을 불러올 때 `style-loader`와 `css-loader`를 함께 사용할 것을 권장하고 있습니다. `css-loader`는 `@import` 혹은 `url()`로 이루어진 css 파일을 묶어주고, `style-loader`는 스타일을 DOM에 적용하는 역할을 합니다.

두 로더 모두 `devDependency`로 설치합니다. 그리고 `webpack.config.js` 파일에 플러그인을 적용합니다.

```javascript
const Dotenv = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  mode: "development",
  plugins: [
    new Dotenv(),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
  ],
};
```

이제 `index.js` 상단에서 `import css from "./index.css"`와 같은 방식으로 CSS 파일을 로드해서 빌드 과정에 포함시킬 수 있습니다.

최종적으로 `$ yarn run build`를 실행하면 `/dist` 폴더 내부에 `index.html`과 `main.js` 파일이 생성됩니다.

## GitHub pages에서 Firebase hosting으로

이제 로컬 환경에서는 `.env` 파일을 사용해 API KEY를 관리하고, GitHub에서는 secrets 서비스를 통해 키를 관리하게 되었습니다. 문제는 빌드 파일입니다. 웹팩이 빌드해준 `main.js` 파일 안에는 당연하게도 API 키가 포함되어 있습니다. 키를 저장한 변수명에 `_KEY` postfix를 붙였다면 `main.js`에서 검색만으로도 쉽게 키값을 찾을 수 있습니다.

지금까지 사용한 GitHub pages는 레포지토리 안에 저장되어 있는 정적 파일을 호스팅해주는 방식이었습니다(private 레포에서 GitHub pages를 사용하는 건 유료입니다.). 따라서 API 키가 포함된 빌드 파일을 공개 레포지토리에 올려놓아야 호스팅이 가능합니다. 때문에 정적 파일을 공개하지 않아도 호스팅이 가능한 서비스를 찾게 되었고, 그 결과로 선택한 서비스가 구글 Firebase의 hosting입니다.

물론 지금은 이 생각이 얼마나 바보같은지 알고 있습니다. 정적 파일을 호스팅한다는 뜻은 클라이언트가 요청하면 정적 파일을 보내준다는 의미이기 때문입니다. 아마 레포지토리에 공개하지 않으려는 생각에서 멈춰 여기까지 생각이 미치지 못한 것 같습니다.

많은 호스팅 서비스 중에 Firebase에 마음이 간 것은 트위터 클론코딩 프로젝트에서 Firebase의 백엔드를 사용하면서 느꼈던 좋은 경험 때문일 것입니다. 가장 중요한 이유는 무료라는 것이고, 문서화가 굉장히 잘 되어있어 별도의 구글링을 할 필요가 없었습니다. 그리고 모든 면에서 개발자 친화적이라는 생각이 들더군요.

호스팅 방법도 굉장히 간단했습니다. NPM으로 `firebase tools`를 로컬에 설치한 후 적용하고자 하는 프로젝트 내에서 `$ firebase init` 명령을 실행하면 대화형 인터페이스를 통해 모든 설정을 자동으로 완료해줍니다. 심지어 GitHub 계정과 연동이 된 상태라면 해당 레포지토리의 secrets에 Firebase 키를 자동으로 추가하고, 푸쉬를 통해 자동으로 배포할 수 있도록 GitHub action yml 파일을 만들어줍니다. 역시 Firebase를 선택하기 잘할 것 같습니다 :D

## GitHub actions를 통한 빌드-배포 자동화

API 키를 숨기려고 하다가 자동화에 발을 들이게 된 이유는 간단합니다. 만약 로컬 환경에서 모든 작업을 처리한다면 그리 어려운 문제는 아닐 겁니다. 쉘 스크립팅이나 `package.json`의 `pre` 스크립트 등을 통해 빌드 - 배포 명령을 연결하면 되니까요. 그러나 `.env` 파일은 버전관리 대상에 포함되어 있지 않고, 빌드된 파일은 깃헙이 아닌 Firebase를 통해 호스팅됩니다. 즉, 프로젝트 파일을 깃헙 저장소에 푸쉬하면 누군가가 GitHub secrets에 저장된 환경변수를 가져와 깃헙 상에서 빌드하고, 빌드된 파일을 Firebase로 배포하는 과정을 해줘야만 합니다. 이런 자동화 방법을 고민하던 중에 GitHub actions의 존재를 알게 되었습니다.

GitHub actions을 통해 자동화를 진행하려면 프로젝트 폴더 내부의 `/.github/workflows` 경로 안에 자동화 명령을 적은 `.yml` 파일이 있어야 합니다. firebase로 배포하는 과정은 firebase 초기화 과정에서 자동으로 생성해줍니다.

### 배포

```yml
- name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: "${{ secrets.GITHUB_TOKEN }}"
          firebaseServiceAccount: "${{ secrets.FIREBASE_SERVICE_ACCOUNT_MOMENTOM_70CA6 }}"
          channelId: live
          projectId: momentom-70ca6
```

yml을 보면 firebase에서 설정해준 GitHub screts에서 접근키를 가져와 자동으로 배포해주는 것을 볼 수 있습니다.

### .env 세팅

빌드 전에 해야할 작업은 깃헙 시크릿에서 API KEY를 가져와 빌드시 사용할 수 있는 `.evn` 파일을 만들어주는 것입니다.

```yml
build:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@master

    - name: set env
      env:
        UNSPLASH_API_KEY: ${{ secrets.UNSPLASH_API_KEY }}
        OPENWEATHER_API_KEY: ${{ secrets.OPENWEATHER_API_KEY }}

      run: |
        echo "UNSPLASH_API_KEY=$UNSPLASH_API_KEY" >> .env
        echo "OPENWEATHER_API_KEY=$OPENWEATHER_API_KEY" >> .env
```

시크릿에서 키를 가져와 환경변수로 저장하는 과정은 인터넷 상에서 많은 분들이 동일한 방법을 사용하는 것 같았습니다.

1. `${{secrets.KEY_NAME}}`을 통해 시크릿에 저장된 키를 가상환경의 환경변수로 설정합니다.
2. 가상환경에 설정한 환경변수를 가져와 `echo` 명령어에 인자로 전달하고, 출력스트림을 `.env` 파일로 설정합니다.

이렇게 하면 가상환경 상에서 로컬과 똑같이 `.env` 파일을 가질 수 있습니다.

### 빌드

이후 의존성 모듈 설치 후 미리 설정해준 `build` 명령을 수행합니다.

```yml
- name: Install dependencies
        run: yarn install

      - name: Build webpack
        run: yarn run build
```

여기까지 실행되면 가상 환경에서 프로젝트 폴더 최상단에 `/dist` 폴더가 생성됐을 것입니다. 이제 빌드된 파일을 Firebase에 호스팅하면 됩니다. 만약 호스팅 과정이 빌드와 같은 `job` 안에서 일어난다면 쉽습니다. 그러나 자동화 작업이 실패했을 때 실패의 원인을 쉽게 파악하고 디버깅을 수월하게 하려면 다른 작업은 다른 `job`으로 분류하는 것이 좋을 것 같았습니다. GitHub action에서는 각각의 `job`이 독립된 가상환경을 사용하므로 빌드에서 만든 `/dist` 폴더를 배포 명령이 실행되는 환경으로 옮겨줘야 합니다. 깃헙에서는 `artifact` 액션을 통해 이 과정을 간단하게 구현합니다.

```yml
name: Deploy

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master

      - name: set env
        env:
          UNSPLASH_API_KEY: ${{ secrets.UNSPLASH_API_KEY }}
          OPENWEATHER_API_KEY: ${{ secrets.OPENWEATHER_API_KEY }}

        run: |
          echo "UNSPLASH_API_KEY=$UNSPLASH_API_KEY" >> .env
          echo "OPENWEATHER_API_KEY=$OPENWEATHER_API_KEY" >> .env

      - name: Install dependencies
        run: yarn install

      - name: Build webpack
        run: yarn run build

      - name: Upload artifact
        uses: actions/upload-artifact@master
        with:
          name: dist
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master

      - name: Download artifact
        uses: actions/download-artifact@master
        with:
          name: dist
          path: dist

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: "${{ secrets.GITHUB_TOKEN }}"
          firebaseServiceAccount: "${{ secrets.FIREBASE_SERVICE_ACCOUNT_MOMENTOM_70CA6 }}"
          channelId: live
          projectId: momentom-70ca6
```

`artifact` 액션을 통해 빌드와 배포 과정을 이어준 모습입니다. `upload-artifact`를 통해 특정 폴더 혹은 파일을 임시로 저장해놓고, `download-artifact`를 통해 다른 가상환경에서 업로드한 파일을 다운받을 수 있습니다. 이렇게 해서 env 세팅 - 빌드 - 배포의 자동화 흐름이 완성되었습니다.

![GitHub actions image](/blogassets/images/04.PNG)

한 가지 주의할 점은 `steps`에서 각각의 작업을 구분하는 기준이 `-`라는 것입니다. 이상하게도 firebase에서 생성해준 yml 템플릿에는 `-`가 한 스텝 안에 여러개가 들어가 있어서 초반에 오류가 생겼습니다.

## 결론

의식의 흐름대로 작업을 진행한 만큼 블로그도 의식의 흐름대로 적은 것 같습니다. 결론적으로 클라이언트 코드에서는 중요한 API KEY를 사용하면 안 된다는 것을 배웠습니다. 만약 선택지가 있다면 만료 기능이 있는 토큰을 사용하는 것이 안전하고, 키를 통한 인증만 가능하다면 서버 쪽에서 구현해야 합니다.

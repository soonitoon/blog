# 📖 글로 쓰는 프로그래밍

TIL에 적기에는 너무 큰 주제들, 프로젝트 구현 과정, 고민 등을 적는 공간입니다. 잘 쓰려고 하기 보다는 그때그때 느끼고 배운 과정을 솔직하게 적어나가려고 합니다.

- [이 블로그 페이지](https://soonitoon.github.io/blog)
- [GitHub](https://github.com/soonitoon)
- [TIL](https://soonitoon.github.io/TIL/)
- [코딩테스트 풀이](https://github.com/soonitoon/coding-test)

## 검색 기능에 대해

블로그 상단에 있는 검색 기능은 영어 검색만 지원합니다😢

## 페이지 작성 및 구성

jekyll 테마 사용법 전체에 대한 설명은 [여기](https://pmarsceill.github.io/just-the-docs/)서 볼 수 있습니다. 이 문서에는 블로그 포스팅 작성에 필요한 최소한의 규칙만 정리했습니다.

### 디렉토리 구성

- 모든 포스팅 마크다운 문서는 `./docs` 폴더 내에 만듭니다. 만약 카테고리 안에 계층 관계로 포함되어야 할 경우 밑의 예시와 같이 폴더 구조를 만듭니다.
- `index.md` 파일은 사이드바에서 해당 카테고리를 눌렀을 때 처음 나오는 페이지를 의미합니다.

```
docs/
├─ category1/
│  ├─ index.md
│  ├─ posting1.md
├─ category2/
│  ├─ index.md
│  ├─ posting2.md
```

### 이미지 첨부

- 모든 이미지 파일은 `assets` 폴더 안에 저장합니다.
- 마크다운 안에서는 `![art](/assets/image-name.png)`와 같이 절대경로로 이미지를 첨부합니다.

### 파일 내부

모든 마크다운 포스팅 문서 최상단에 `YAML`을 설정합니다(이미 만들어진 문서들을 참고하세요).

```yaml
---
title: Granchild of Test
has_children: true
parent: Child of Test
grand_parent: Refactoring
nav_order: 2
---
```

| 속성         | 의미                                           |
| ------------ | ---------------------------------------------- |
| title        | 페이지에 표시될 제목                           |
| has_children | 사이드바에서 자식 페이지를 포함하는지의 여부   |
| parent       | 부모 페이지의 title                            |
| grand_parent | 부모-부모 페이지의 title                       |
| nav_order    | 사이드바에 표시될 순서(기본값은 알파벳순 정렬) |

### 주의

- 부모 페이지의 `title`을 한글로 작성하면 부모-자식 연결이 안됩니다.
- `has_children`이 `true`로 설정된 페이지에는 자식 페이지 목록이 자동으로 삽입됩니다.
- `h4`인 `####`부터는 본문보다 제목의 크기가 작아지므로 소제목은 `h3`까지만 사용합니다.

## 빌드

```shell
$ yarn run publish
```

아래의 과정들이 자동으로 진행됩니다.

- 로컬에서의 이미지 절대결로를 다운로드 URL로 변환
- 변경사항 커밋
- 저장소 푸쉬

# π κΈλ‘ μ°λ νλ‘κ·Έλλ°

TILμ μ κΈ°μλ λλ¬΄ ν° μ£Όμ λ€, νλ‘μ νΈ κ΅¬ν κ³Όμ , κ³ λ―Ό λ±μ μ λ κ³΅κ°μλλ€. μ μ°λ €κ³  νκΈ° λ³΄λ€λ κ·Έλκ·Έλ λλΌκ³  λ°°μ΄ κ³Όμ μ μμ§νκ² μ μ΄λκ°λ €κ³  ν©λλ€.

- [μ΄ λΈλ‘κ·Έ νμ΄μ§](https://soonitoon.github.io/blog)
- [GitHub](https://github.com/soonitoon)
- [TIL](https://soonitoon.github.io/TIL/)
- [μ½λ©νμ€νΈ νμ΄](https://github.com/soonitoon/coding-test)

## κ²μ κΈ°λ₯μ λν΄

λΈλ‘κ·Έ μλ¨μ μλ κ²μ κΈ°λ₯μ μμ΄ κ²μλ§ μ§μν©λλ€π’

## νμ΄μ§ μμ± λ° κ΅¬μ±

jekyll νλ§ μ¬μ©λ² μ μ²΄μ λν μ€λͺμ [μ¬κΈ°](https://pmarsceill.github.io/just-the-docs/)μ λ³Ό μ μμ΅λλ€. μ΄ λ¬Έμμλ λΈλ‘κ·Έ ν¬μ€ν μμ±μ νμν μ΅μνμ κ·μΉλ§ μ λ¦¬νμ΅λλ€.

### λλ ν λ¦¬ κ΅¬μ±

- λͺ¨λ  ν¬μ€ν λ§ν¬λ€μ΄ λ¬Έμλ `./docs` ν΄λ λ΄μ λ§λ­λλ€. λ§μ½ μΉ΄νκ³ λ¦¬ μμ κ³μΈ΅ κ΄κ³λ‘ ν¬ν¨λμ΄μΌ ν  κ²½μ° λ°μ μμμ κ°μ΄ ν΄λ κ΅¬μ‘°λ₯Ό λ§λ­λλ€.
- `index.md` νμΌμ μ¬μ΄λλ°μμ ν΄λΉ μΉ΄νκ³ λ¦¬λ₯Ό λλ μ λ μ²μ λμ€λ νμ΄μ§λ₯Ό μλ―Έν©λλ€.

```
docs/
ββ category1/
β  ββ index.md
β  ββ posting1.md
ββ category2/
β  ββ index.md
β  ββ posting2.md
```

### μ΄λ―Έμ§ μ²¨λΆ

- λͺ¨λ  μ΄λ―Έμ§ νμΌμ `assets` ν΄λ μμ μ μ₯ν©λλ€.
- λ§ν¬λ€μ΄ μμμλ `![art](/assets/image-name.png)`μ κ°μ΄ μ λκ²½λ‘λ‘ μ΄λ―Έμ§λ₯Ό μ²¨λΆν©λλ€.

### νμΌ λ΄λΆ

λͺ¨λ  λ§ν¬λ€μ΄ ν¬μ€ν λ¬Έμ μ΅μλ¨μ `YAML`μ μ€μ ν©λλ€(μ΄λ―Έ λ§λ€μ΄μ§ λ¬Έμλ€μ μ°Έκ³ νμΈμ).

```yaml
---
title: Granchild of Test
has_children: true
parent: Child of Test
grand_parent: Refactoring
nav_order: 2
---
```

| μμ±         | μλ―Έ                                           |
| ------------ | ---------------------------------------------- |
| title        | νμ΄μ§μ νμλ  μ λͺ©                           |
| has_children | μ¬μ΄λλ°μμ μμ νμ΄μ§λ₯Ό ν¬ν¨νλμ§μ μ¬λΆ   |
| parent       | λΆλͺ¨ νμ΄μ§μ title                            |
| grand_parent | λΆλͺ¨-λΆλͺ¨ νμ΄μ§μ title                       |
| nav_order    | μ¬μ΄λλ°μ νμλ  μμ(κΈ°λ³Έκ°μ μνλ²³μ μ λ ¬) |

### μ£Όμ

- λΆλͺ¨ νμ΄μ§μ `title`μ νκΈλ‘ μμ±νλ©΄ λΆλͺ¨-μμ μ°κ²°μ΄ μλ©λλ€.
- `has_children`μ΄ `true`λ‘ μ€μ λ νμ΄μ§μλ μμ νμ΄μ§ λͺ©λ‘μ΄ μλμΌλ‘ μ½μλ©λλ€.
- `h4`μΈ `####`λΆν°λ λ³Έλ¬Έλ³΄λ€ μ λͺ©μ ν¬κΈ°κ° μμμ§λ―λ‘ μμ λͺ©μ `h3`κΉμ§λ§ μ¬μ©ν©λλ€.

## λΉλ

```shell
$ yarn run publish
```

μλμ κ³Όμ λ€μ΄ μλμΌλ‘ μ§νλ©λλ€.

- λ‘μ»¬μμμ μ΄λ―Έμ§ μ λκ²°λ‘λ₯Ό λ€μ΄λ‘λ URLλ‘ λ³ν
- λ³κ²½μ¬ν­ μ»€λ°
- μ μ₯μ νΈμ¬

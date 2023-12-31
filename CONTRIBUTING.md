# Contributing

## Issues

Feel free to [open an issue](https://github.com/yucadoo/twilio-subscription-context/issues/new),
or propose a [pull request](https://github.com/yucadoo/twilio-subscription-context/pulls).
To prevent duplication, please look at [existing issues](https://github.com/yucadoo/twilio-subscription-context/issues?q=is%3Aissue) before posting a new one.

## TL;DR

| Command        | Description                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| `npm test`     | Runs test suite once using [Jest](http://jestjs.io/).                                                      |
| `npm start`    | Runs test once, watch for changes in dev/test files, then re-runs tests automatically when a file changes. |
| `npm run lint` | Runs [ESLint](https://eslint.org/) linter.                                                                 |

## Getting started

#### Step 1. Checkout repository

_**Prerequisites:** you need to have `git`, `node` (>=6) and `npm` installed_.

```bash
git clone https://github.com/yucadoo/twilio-subscription-context.git
```

_(or your clone's Git URL)_

#### Step 2. Install NPM dependencies

```bash
npm install
```

#### Step 3. Run tests (run-once mode)

```bash
npm test
```

#### Step 4. Run tests (TDD mode)

```bash
npm start
```

## Coding standards

This project follows [Airbnb Javascript Style Guide](https://github.com/airbnb/javascript). It is enforced at build time by [ESLint](http://eslint.org/).

```bash
npm lint
```

**Note:** this is automatically run before the test suite by `npm test`, but not by `npm start`

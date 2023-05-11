# OMSHub

[![license](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
![contributors count](https://img.shields.io/github/contributors/omshub/website)
![pull requests closed](https://img.shields.io/github/issues-pr-closed/omshub/website)

A website for Online Master's of Science (OMS) course reviews at Georgia Tech.

## Resources

#### OMSHub

- Production - https://omshub.org
- Development - https://dev.omshub.org
- Storybook - https://storybook.omshub.org

#### OMS program home pages

- OMS Computer Science (OMSCS) - https://omscs.gatech.edu

- OMS Cybersecurity (OMSCY) - https://pe.gatech.edu/degrees/cybersecurity

- OMS Analytics (OMSA) - https://pe.gatech.edu/degrees/analytics

#### Other

- How to Write a Git Commit Message - https://cbea.ms/git-commit

## Development

#### Getting started (VSCode fast-path)

This project includes a [.devcontainers](https://code.visualstudio.com/docs/remote/containers) configuration
that can be used by VSCode to create a one-click development environment with Docker. The Docker container
includes all of the dependencies you need to get started, forwards the NextJS and Storybook ports to your
local machine, and mounts the repository into the container so changes persist outside of Docker.

To get started:

1. Install the [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
   VSCode extension.
2. Open the repository with VSCode. You should see a prompt on the bottom left of the screen to open the
   project inside the container.

#### Getting started

Clone the repository and then run the following commands to build the NextJS application:

```bash
yarn install
yarn build
```

To start the project locally, run:

```bash
yarn start
```

Open `http://localhost:3000` with your browser to see the result.

#### Running the local Firebase emulator for local dev environment

Ensure that the following is defined locally in `.env`:

```
NEXT_PUBLIC_IS_EMULATOR_MODE=true
```

To launch the local emulator, run:

```bash
yarn install
yarn fb:emu
```

This will create a local emulator instance of Firebase, accessible via `http://localhost:4000` which provides the Firebase Emulator Suite for local services (e.g., Firestore).

Next, to start the project locally, in a **_separate_** terminal instance run:

```bash
yarn dev
```

Open `http://localhost:3000` with your browser to see the result. The local data will be seeded from scratch. Furthermore, you can use the local auth service by simply logging in via any of the provided services (e.g., Google) with auto-generated credentials, which wwill simulate a logged in user account.

#### Yarn development scripts

- `yarn dev` — Starts the application in development mode at `http://localhost:3000`.
- `yarn build` — Creates an optimized production build of your application.
- `yarn start` — Starts the application in production mode.
- `yarn lint` — Runs ESLint for all files in the `src` directory.
- `yarn prettier` — Runs Prettier for all files in the `src` directory.
- `yarn fmt` - Run `yarn prettier` and `yarn lint` successively.
- `yarn commit` — Run commitizen. Alternative to `git commit`.
- `yarn storybook` - Run storybook locally at `http://localhost:6006`.
- `yarn fb:emu` - Run the local [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite/).

#### Directory structure

- [`.github`](.github) — GitHub configuration including the CI workflow.<br>
- [`.husky`](.husky) — Husky configuration and hooks.<br>
- [`public`](./public) — Static assets such as robots.txt, images, and favicon.<br>
- [`src`](./src) — Application source code, including pages, components, styles.

#### Commit messages

#### Committing using Git CLI:

Using `git commit` will bring up a prompt that will fill out commit messages to the repo's commit connvention.

#### Committing using Git GUI:

Commit messages must conform to the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/).

The commit message should be structured as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

`<type>` must be one of the following:

| type     | description                                                                                                 |
| -------- | ----------------------------------------------------------------------------------------------------------- |
| build    | Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)         |
| chore    | Changes that do not affect production; e.x., updating grunt tasks, etc.                                     |
| ci       | Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs) |
| docs     | Documentation only changes                                                                                  |
| feat     | A new feature                                                                                               |
| fix      | A bug fix                                                                                                   |
| perf     | A code change that improves performance                                                                     |
| refactor | A code change that neither fixes a bug nor adds a feature                                                   |
| revert   | A commit that reverts a previous commit                                                                     |
| style    | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)      |
| test     | Adding missing tests or correcting existing tests                                                           |

See the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/#examples) for examples of valid commit messages.

## Attributions

[Brain](public/favicon.ico) by Sergey Patutin from [NounProject.com](https://thenounproject.com/icon/brain-291205)

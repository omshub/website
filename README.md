# OMSHub

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

#### Yarn development scripts

- `yarn dev` — Starts the application in development mode at `http://localhost:3000`.
- `yarn build` — Creates an optimized production build of your application.
- `yarn start` — Starts the application in production mode.
- `yarn type-check` — Validate code using TypeScript compiler.
- `yarn lint` — Runs ESLint for all files in the `src` directory.
- `yarn format` — Runs Prettier for all files in the `src` directory.
- `yarn commit` — Run commitizen. Alternative to `git commit`.
- `yarn storybook` - Run storybook locally at `http://localhost:6006`.

#### Directory structure

- [`.github`](.github) — GitHub configuration including the CI workflow.<br>
- [`.husky`](.husky) — Husky configuration and hooks.<br>
- [`public`](./public) — Static assets such as robots.txt, images, and favicon.<br>
- [`src`](./src) — Application source code, including pages, components, styles.

#### Commit messages

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

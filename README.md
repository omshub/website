# OMSHub

[![license](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
![contributors count](https://img.shields.io/github/contributors/omshub/website)
![pull requests closed](https://img.shields.io/github/issues-pr-closed/omshub/website)

A website for Online Master's of Science (OMS) course reviews at Georgia Tech.

## Resources

[Contact our team!](mailto:gt.omshub@gmail.com)

### OMSHub

- Production - https://omshub.org
- Storybook - https://storybook.omshub.org

### OMS program home pages

- OMS Computer Science (OMSCS) - https://omscs.gatech.edu
- OMS Cybersecurity (OMSCY) - https://pe.gatech.edu/degrees/cybersecurity
- OMS Analytics (OMSA) - https://pe.gatech.edu/degrees/analytics

### Other

- How to Write a Git Commit Message - https://cbea.ms/git-commit

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Components**: [Mantine 7](https://mantine.dev/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Language**: TypeScript
- **Styling**: Mantine CSS-in-JS + CSS Variables
- **Deployment**: Vercel

## Development

### Getting started (VSCode fast-path)

This project includes a [.devcontainers](https://code.visualstudio.com/docs/remote/containers) configuration
that can be used by VSCode to create a one-click development environment with Docker. The Docker container
includes all of the dependencies you need to get started, forwards the NextJS and Storybook ports to your
local machine, and mounts the repository into the container so changes persist outside of Docker.

To get started:

1. Install the [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
   VSCode extension.
2. Open the repository with VSCode. You should see a prompt on the bottom left of the screen to open the
   project inside the container.

### Getting started

Clone the repository and then run the following commands to build the NextJS application:

```bash
pnpm install
pnpm build
```

To start the project locally, run:

```bash
pnpm start
```

Open `http://localhost:3000` with your browser to see the result.

### Environment Variables

Copy `example.env` to `.env.local` and fill in the required values:

```bash
cp example.env .env.local
```

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Your Supabase publishable (anon) key

Optional environment variables:

- `NEXT_PUBLIC_GA_ID` - Google Analytics ID
- `NEXT_PUBLIC_CLARITY_ID` - Microsoft Clarity ID
- `GOOGLE_SITE_VERIFICATION` - Google Search Console verification

### pnpm development scripts

- `pnpm dev` — Starts the application in development mode at `http://localhost:3000`.
- `pnpm build` — Creates an optimized production build of your application.
- `pnpm start` — Starts the application in production mode.
- `pnpm clean` — Removes `.next` and `node_modules` directories.
- `pnpm lint` — Runs ESLint for all files in the project.
- `pnpm prettier` — Runs Prettier for all files in the project.
- `pnpm fmt` - Run `pnpm prettier` and `pnpm lint` successively.
- `pnpm precommit` — Run commitizen on `git`-staged files.
- `pnpm storybook` - Run storybook locally at `http://localhost:6006`.

### Directory structure

- [`.github`](.github) — GitHub configuration including the CI workflow.
- [`.husky`](.husky) — Husky configuration and hooks.
- [`app`](./app) — Next.js App Router pages and API routes.
- [`public`](./public) — Static assets such as robots.txt, images, and favicon.
- [`src`](./src) — Application source code, including components, lib, and utilities.
  - [`src/components`](./src/components) — React components.
  - [`src/context`](./src/context) — React context providers.
  - [`src/lib`](./src/lib) — Library code including Supabase client, types, and utilities.

### Commit messages

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

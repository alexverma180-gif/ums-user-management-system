# Northstar UMS

A responsive user-management dashboard concept with a polished people directory, live search and filters, invitation flow, member status actions, and browser-local persistence.

## Preview locally

Open `frontend/index.html` in a modern browser. The demo works without a build step or server. People you add or update are saved in that browser's local storage.

## Publish on GitHub Pages

The GitHub Actions workflow in `.github/workflows/deploy-pages.yml` publishes the static frontend from `frontend/` whenever changes are pushed to `main`.

1. Push this project to a GitHub repository on the `main` branch.
2. In the repository, open **Settings → Pages** and set the build and deployment source to **GitHub Actions**.
3. Run the **Deploy UMS to GitHub Pages** workflow, or push a frontend change to `main`.
4. Open the Pages URL shown in the workflow's deployment environment.

## Demo scope

This repository currently contains a frontend prototype, not a connected user-management service. The sample people are illustrative, and changes are stored only in the current browser. Do not enter real personal data or treat the demo as an authenticated admin system. The existing backend and database folders are placeholders; an API, authentication, and production data store still need to be implemented before operational use.

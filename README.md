# Backend

This repository is made for backend subteam which are responsible for developing the backend of the Reddit Clone.

## Contribution Guide

1. use `eslint` instead of prettier for .ts files
2. use conventional commits (can use commitizen to help: `npm install -g commitizen` and then use `git cz`)
3. other files (.json, .rc, .js) are formatted using `prettier`
4. precommit hook will run lint checking on staged files only. It will also run all tests on all uncommitted(not just staged) files.
5. prepush hook will run formatting check and testing on all files
6. use `git commit` or `git cz` in terminal to get `husky` output. In vs code if you just hit commit you will have to wait without any output.
7. changes may break github desktop (on windows). You need WSL to run bash in git hooks.
8. don't forget to `npm i` and `npm run husky`

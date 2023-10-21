# Changelogger

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Description

Outputs a changelog diff since the last full release. I'm a fan of standard-version, but at the time of writing it doesn't support including prerelease commits when a full release is made. This addresses that limitation.

## Inputs

| Name | Required | Default |
| ----- | --- | --- |
| `token` | No | ${{ github.token }} |
| `preamble` | No | What's changed? |
| `is-conventional` | No | true |
| `output-flavor` | No | github-release |
| `branch-comparison-strategy` | No | tag |

### token

Used to access releases and workflows.

### preamble

Message positioned before the list of commits. Prefixed with '## ' (header markdown).

### is-conventional

If false, it just returns a simple list of commits messages. If true, it parses conventional commits and organizes them into sections (like any conventional changelog library). By default, only feat, fix, and breaking changes are included. Will use the .versionrc file if present.

### output-flavor

**Options:**
* `github-release`: GitHub Releases support [autolinked references + formatting](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/autolinked-references-and-urls).
* `markdown`: Basic GitHub markdown without autolinked references. This option isn't ready yet so it currenlty uses github-release as a fallback.
* `slack`: Slack uses its own special markup language called [mrkdwn](https://api.slack.com/reference/surfaces/formatting).

### branch-comparison-strategy

_Only applies when the workflow ref starts with refs/heads/_

**Options:**
* `tag`: searches for the last non-prerelease tag, and uses that to compare against HEAD
* `workflow`: searches for the last successful workflow run for the current branch + current workflow, and uses that to compare against HEAD

## Outputs

| Name | Description |
| ----- | --- |
| `changelog` | The generated changelog for the new version. |

## Example usage

Use all the defaults

```yaml
- name: Generate changelog
  id: changelog
  uses: cabauman/changelogger-action@main
  
- name: Get latest tag
  id: get-latest-tag
  run: echo "VERSION_TAG=$(git describe --tags --abbrev=0)" >> $GITHUB_ENV

- name: Create Release
  id: create_release
  uses: actions/create-release@v1
  with:
    tag_name: $VERSION_TAG
    release_name: Release ${{ steps.get-latest-tag.outputs.tag }}
    body: ${{ steps.changelog.outputs.changelog }}
    draft: false
    prerelease: false
```

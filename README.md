# grunt-dojo2-extras

[![Build Status](https://travis-ci.org/dojo/grunt-dojo2-extras.svg?branch=master)](https://travis-ci.org/dojo/grunt-dojo2-extras)

grunt-dojo2-extras provides tools in support of continuous deployment of projects, packages, and documentation.

## Grunt Tasks

See `support/grunt/index` and `support/grunt/config` for usage.

### api

builds API documentation for an external repository using typedoc

### initAutomation

initializes GitHub and Travis with an encrypted deploy key and "secret" environment variables in Travis used for
 decrypting the key

### prebuild

prebuild step used to decrypt the deploy key when environment variables are present

### publish

publishes a repository

### sync

pulls a repository and switches to a specified branch. If the branch does not exist, a new orphan branch is created.

## Code separation

Functionality has been split between the `src` and `tasks` directories. The `tasks` directory contains functionality
 exclusively related to Grunt. The `src` directory contains commands and utilities that implement the features of this
 project. This split allows for better reuse of commands and utility methods outside of a Grunt framework.
 
## Contributing

Contributions should follow the above code separation pattern, have tests, and conform to the tslint styles.

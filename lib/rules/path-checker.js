/**
 * @fileoverview feature sliced relative path checker
 * @author jeka
 */
"use strict";

const path = require("path");

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: "feature sliced relative path checker",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [], // Add a schema if the rule has options
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        // example: app/entities/Article
        const importTo = node.source.value

        // example: C:/Users/Documents/src/entities/Article
        const fromFilename = context.getFilename()

        if (shouldBeRelative(fromFilename, importTo)) {
          context.report(node, 'В рамках одного слайса все пути должны быть относительными')
        }
      }
    };
  },
};

const layers = {
  'entities': 'entities',
  'features': 'features',
  'shared': 'shared',
  'pages': 'pages',
  'widgets': 'widgets',
}

function isPathRelative(path) {
  return path === '.' || path.startsWith('./') || path.startsWith('../')
}

function shouldBeRelative(from, to) {
  if (isPathRelative(to)) {
    return false
  }

  const toArray = to.split('/')
  const toLayer = toArray[0] // entities
  const toSlice = toArray[1] // Article

  if (!toLayer || !toSlice || !layers[toLayer]) {
    return false
  }

  const normalizePath = path.toNamespacedPath(from)
  const projectFrom = normalizePath.split('src')[1]
  const fromArray = projectFrom.split('\\')
  const fromLayer = fromArray[0]
  const fromSlice = fromArray[1]

  if (!fromLayer || !fromSlice || !layers[fromLayer]) {
    return false
  }

  return fromSlice === toSlice && toLayer === fromLayer
}

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import { namedTypes as t } from '@motiz88/ast-types';
import isReactCreateClassCall from './isReactCreateClassCall';
import isReactForwardRefCall from './isReactForwardRefCall';
import resolveToValue from './resolveToValue';

/**
 * If the path is a call expression, it recursively resolves to the
 * rightmost argument, stopping if it finds a React.createClass call expression
 *
 * Else the path itself is returned.
 */
export default function resolveHOC(path: NodePath): NodePath {
  const node = path.node;
  if (
    t.CallExpression.check(node) &&
    !isReactCreateClassCall(path) &&
    !isReactForwardRefCall(path)
  ) {
    if (node.arguments.length) {
      const inner = path.get('arguments', 0);

      // If the first argument is one of these types then the component might be the last argument
      // If there are all identifiers then we cannot figure out exactly and have to assume it is the first
      if (
        node.arguments.length > 1 &&
        (t.Literal.check(inner.node) ||
          t.ObjectExpression.check(inner.node) ||
          t.ArrayExpression.check(inner.node) ||
          t.SpreadElement.check(inner.node))
      ) {
        return resolveHOC(
          resolveToValue(path.get('arguments', node.arguments.length - 1)),
        );
      }

      return resolveHOC(resolveToValue(inner));
    }
  }

  return path;
}

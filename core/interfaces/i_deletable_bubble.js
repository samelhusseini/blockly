/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a deletable bubble.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

goog.provide('Blockly.IDeletableBubble');

goog.require('Blockly.IBubble');


/**
 * A deletable bubble interface.
 * @extends {Blockly.IBubble}
 * @interface
*/
Blockly.IDeletableBubble = function() {};

/**
 * Update the style of this bubble when it is dragged over a delete area.
 * @param {boolean} enable True if the bubble is about to be deleted, false
 *     otherwise.
 */
Blockly.IDeletableBubble.prototype.setDeleteStyle;

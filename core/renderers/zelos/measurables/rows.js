/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview An object representing a single row on a rendered block and all
 * of its subcomponents.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.zelos.BottomRow');
goog.provide('Blockly.zelos.TopRow');

goog.require('Blockly.blockRendering.BottomRow');
goog.require('Blockly.blockRendering.TopRow');

goog.require('Blockly.zelos.RoundCorner');
goog.require('Blockly.zelos.RightRoundCorner');


/**
 * An object containing information about what elements are in the top row of a
 * block as well as sizing information for the top row.
 * Elements in a top row can consist of corners, hats, spacers, and previous
 * connections.
 * After this constructor is called, the row will contain all non-spacer
 * elements it needs.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.TopRow}
 */
Blockly.zelos.TopRow = function() {
  Blockly.zelos.TopRow.superClass_.constructor.call(this);
};
goog.inherits(Blockly.zelos.TopRow, Blockly.blockRendering.TopRow);

// /**
//  * @override
//  */
// Blockly.zelos.TopRow.prototype.measure = function() {
//   Blockly.zelos.TopRow.superClass_.measure.call(this);
//   // TODO (samelh): the height of the notch may be larger than our padding.
//   this.height = this.constants_.NOTCH_HEIGHT / 2;
// };


/**
 * Never render a square corner. Always round.
 * @override
 */
Blockly.zelos.TopRow.prototype.hasLeftSquareCorner = function(_block) {
  return false;
};


/**
 * Never render a square corner. Always round.
 * @override
 */
Blockly.zelos.TopRow.prototype.hasRightSquareCorner = function(_block) {
  return false;
};

/**
 * An object containing information about what elements are in the bottom row of
 * a block as well as spacing information for the top row.
 * Elements in a bottom row can consist of corners, spacers and next connections.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.BottomRow}
 */
Blockly.zelos.BottomRow = function() {
  Blockly.zelos.BottomRow.superClass_.constructor.call(this);
};
goog.inherits(Blockly.zelos.BottomRow, Blockly.blockRendering.BottomRow);

/**
 * Never render a square corner. Always round.
 * @override
 */
Blockly.zelos.BottomRow.prototype.hasLeftSquareCorner = function(_block) {
  return false;
};

/**
 * Never render a square corner. Always round.
 * @override
 */
Blockly.zelos.BottomRow.prototype.hasRightSquareCorner = function(_block) {
  return false;
};

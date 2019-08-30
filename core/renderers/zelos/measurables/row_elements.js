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
 * @fileoverview Measurables representing row elements for the Zelos renderer.
 * @author samelh@google.com (Sam El-Husseini)
 */

goog.provide('Blockly.zelos.RoundCorner');
goog.provide('Blockly.zelos.RightRoundCorner');

goog.require('Blockly.blockRendering.Measurable');

/**
 * An object containing information about the space a rounded corner takes up
 * during rendering.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.zelos.RoundCorner = function() {
  Blockly.zelos.RoundCorner.superClass_.constructor.call(this);
  this.type = 'round corner';
  this.width = this.constants_.CORNER_RADIUS;
  // The rounded corner extends into the next row by 4 so we only take the
  // height that is aligned with this row.
  this.height = this.constants_.NOTCH.height / 2;

};
goog.inherits(Blockly.zelos.RoundCorner, Blockly.blockRendering.Measurable);

/**
 * An object containing information about the space a rounded corner takes up
 * during rendering.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.zelos.RightRoundCorner = function() {
  Blockly.zelos.RightRoundCorner.superClass_.constructor.call(this);
  this.type = 'right round corner';
  this.width = this.constants_.CORNER_RADIUS;
  // The rounded corner extends into the next row by 4 so we only take the
  // height that is aligned with this row.
  this.height = this.constants_.NOTCH.height / 2;

};
goog.inherits(Blockly.zelos.RightRoundCorner, Blockly.blockRendering.Measurable);

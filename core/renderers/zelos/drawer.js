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
 * @fileoverview Zelos renderer.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.zelos.Drawer');

goog.require('Blockly.blockRendering.ConstantProvider');
goog.require('Blockly.blockRendering.Drawer');
goog.require('Blockly.zelos.RenderInfo');


/**
 * An object that draws a block based on the given rendering information.
 * @param {!Blockly.BlockSvg} block The block to render.
 * @param {!Blockly.zelos.RenderInfo} info An object containing all
 *   information needed to render this block.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Drawer}
 */
Blockly.zelos.Drawer = function(block, info) {
  Blockly.zelos.Drawer.superClass_.constructor.call(this, block, info);
};
goog.inherits(Blockly.zelos.Drawer, Blockly.blockRendering.Drawer);


/**
 * Add steps for the top corner of the block, taking into account
 * details such as hats and rounded corners.
 * @protected
 */
Blockly.blockRendering.Drawer.prototype.drawTop_ = function() {
  var topRow = this.info_.topRow;
  var elements = topRow.elements;

  this.positionPreviousConnection_();
  this.outlinePath_ +=
      Blockly.utils.svgPaths.moveBy(topRow.xPos, this.info_.startY);
  for (var i = 0, elem; (elem = elements[i]); i++) {
    if (elem.isRoundedCorner() && !elem.isRightCorner()) {
      this.outlinePath_ +=
          this.constants_.OUTSIDE_CORNERS.topLeft;
    } else if (elem.isRoundedCorner() && elem.isRightCorner()) {
      this.outlinePath_ +=
        this.constants_.OUTSIDE_CORNERS.topRight;
    } else if (elem.type == 'previous connection') {
      this.outlinePath_ += elem.shape.pathLeft;
    } else if (elem.type == 'hat') {
      this.outlinePath_ += this.constants_.START_HAT.path;
    } else if (elem.isSpacer()) {
      this.outlinePath_ += Blockly.utils.svgPaths.lineOnAxis('h', elem.width);
    }
    // No branch for a 'square corner', because it's a no-op.
  }
  this.outlinePath_ += Blockly.utils.svgPaths.lineOnAxis('v', topRow.height);
};


/**
 * Add steps for the bottom edge of a block, possibly including a notch
 * for the next connection
 * @protected
 */
Blockly.blockRendering.Drawer.prototype.drawBottom_ = function() {
  var bottomRow = this.info_.bottomRow;
  var elems = bottomRow.elements;
  this.positionNextConnection_();

  this.outlinePath_ +=
    Blockly.utils.svgPaths.lineOnAxis('v', bottomRow.height - bottomRow.overhangY);

  for (var i = elems.length - 1, elem; (elem = elems[i]); i--) {
    if (elem.isNextConnection()) {
      this.outlinePath_ += elem.shape.pathRight;
    } else if (elem.type == "square corner left") {
      this.outlinePath_ += Blockly.utils.svgPaths.lineOnAxis('H', bottomRow.xPos);
    } else if (elem.isRoundedCorner() && !elem.isRightCorner()) {
      this.outlinePath_ +=
          this.constants_.OUTSIDE_CORNERS.bottomLeft;
    } else if (elem.isRoundedCorner() && elem.isRightCorner()) {
      this.outlinePath_ +=
        this.constants_.OUTSIDE_CORNERS.bottomRight;
    } else if (elem.isSpacer()) {
      this.outlinePath_ += Blockly.utils.svgPaths.lineOnAxis('h', elem.width * -1);
    }
  }
};

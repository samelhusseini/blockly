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
 * @fileoverview Methods for adding highlights on block, for rendering in
 * compatibility mode.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.geras.Highlighter');

goog.require('Blockly.blockRendering.RenderInfo');
goog.require('Blockly.blockRendering.Measurable');
goog.require('Blockly.blockRendering.BottomRow');
goog.require('Blockly.blockRendering.InputRow');
goog.require('Blockly.blockRendering.Row');
goog.require('Blockly.blockRendering.SpacerRow');
goog.require('Blockly.blockRendering.TopRow');


/**
 * An object that adds highlights to a block based on the given rendering
 * information.
 *
 * Highlighting is interesting because the highlights do not fully enclose the
 * block.  Instead, they are positioned based on a light source in the top left.
 * This means that rendering highlights requires exact information about the
 * position of each part of the block.  The resulting paths are not continuous
 * or closed paths.  The highlights for tabs and notches are loosely based on
 * tab and notch shapes, but are not exactly the same.
 *
 * @param {!Blockly.geras.RenderInfo} info An object containing all
 *     information needed to render this block.
 * @param {!Blockly.BlockSvg.PathObject} pathObject An object that stores all of
 *     the block's paths before they are propagated to the page.
 * @package
 * @constructor
 */
Blockly.geras.Highlighter = function(info, pathObject) {
  this.info_ = info;
  this.pathObject_ = pathObject;
  this.steps_ = this.pathObject_.highlightSteps;
  this.inlineSteps_ = this.pathObject_.highlightInlineSteps;

  this.RTL_ = this.info_.RTL;

  this.constants_ = Blockly.blockRendering.getConstants();
  this.highlightConstants_ = Blockly.blockRendering.getHighlightConstants();
  /**
   * The offset between the block's main path and highlight path.
   * @type {number}
   * @private
   */
  this.highlightOffset_ = this.highlightConstants_.OFFSET;

  this.outsideCornerPaths_ = this.highlightConstants_.OUTSIDE_CORNER;
  this.insideCornerPaths_ = this.highlightConstants_.INSIDE_CORNER;
  this.puzzleTabPaths_ = this.highlightConstants_.PUZZLE_TAB;
  this.notchPaths_ = this.highlightConstants_.NOTCH;
  this.startPaths_ = this.highlightConstants_.START_HAT;
  this.jaggedTeethPaths_ =
      this.highlightConstants_.JAGGED_TEETH;
};

Blockly.geras.Highlighter.prototype.drawTopCorner = function(row) {
  this.steps_.push(
      Blockly.utils.svgPaths.moveBy(row.xPos, this.info_.startY));
  for (var i = 0, elem; (elem = row.elements[i]); i++) {
    if (elem.type == 'square corner left') {
      this.steps_.push(this.highlightConstants_.START_POINT);
    } else if (elem.type == 'round corner left') {
      this.steps_.push(
          this.outsideCornerPaths_.topLeft(this.RTL_));
    } else if (elem.type == 'previous connection') {
      this.steps_.push(this.notchPaths_.pathLeft);
    } else if (elem.type == 'hat') {
      this.steps_.push(this.startPaths_.path(this.RTL_));
    } else if (elem.isSpacer() && elem.width != 0) {
      // The end point of the spacer needs to be offset by the highlight amount.
      // So instead of using the spacer's width for a relative horizontal, use
      // its width and position for an absolute horizontal move.
      this.steps_.push('H', elem.xPos + elem.width - this.highlightOffset_);
    }
  }

  var right = row.xPos + row.width - this.highlightOffset_;
  this.steps_.push('H', right);
};

Blockly.geras.Highlighter.prototype.drawJaggedEdge_ = function(row) {
  if (this.info_.RTL) {
    this.steps_.push('H', row.width - this.highlightOffset_);
    this.steps_.push(this.jaggedTeethPaths_.pathLeft);
    var remainder =
        row.height - this.jaggedTeethPaths_.height - this.highlightOffset_;
    this.steps_.push(Blockly.utils.svgPaths.lineOnAxis('v', remainder));
  }
};

Blockly.geras.Highlighter.prototype.drawValueInput = function(row) {
  var input = row.getLastInput();
  var steps = '';
  if (this.RTL_) {
    var belowTabHeight = row.height - input.connectionHeight;

    steps =
        Blockly.utils.svgPaths.moveTo(
            input.xPos + input.width - this.highlightOffset_, row.yPos) +
        this.puzzleTabPaths_.pathDown(this.RTL_) +
        Blockly.utils.svgPaths.lineOnAxis('v', belowTabHeight);
  } else {
    steps =
        Blockly.utils.svgPaths.moveTo(input.xPos + input.width, row.yPos) +
        this.puzzleTabPaths_.pathDown(this.RTL_);
  }

  this.steps_.push(steps);
};

Blockly.geras.Highlighter.prototype.drawStatementInput = function(row) {
  var input = row.getLastInput();
  var steps = '';
  if (this.RTL_) {
    var innerHeight = row.height - (2 * this.insideCornerPaths_.height);
    steps =
        Blockly.utils.svgPaths.moveTo(input.xPos, row.yPos) +
        this.insideCornerPaths_.pathTop(this.RTL_) +
        Blockly.utils.svgPaths.lineOnAxis('v', innerHeight) +
        this.insideCornerPaths_.pathBottom(this.RTL_);
  } else {
    steps =
        Blockly.utils.svgPaths.moveTo(input.xPos, row.yPos + row.height) +
        this.insideCornerPaths_.pathBottom(this.RTL_);
  }
  this.steps_.push(steps);
};

Blockly.geras.Highlighter.prototype.drawRightSideRow = function(row) {
  var rightEdge = row.xPos + row.width - this.highlightOffset_;
  if (row.followsStatement) {
    this.steps_.push('H', rightEdge);
  }
  if (this.RTL_) {
    this.steps_.push('H', rightEdge);
    if (row.height > this.highlightOffset_) {
      this.steps_.push('V', row.yPos + row.height - this.highlightOffset_);
    }
  }
};

Blockly.geras.Highlighter.prototype.drawBottomRow = function(row) {
  var height = row.yPos + row.height - row.overhangY;

  // Highlight the vertical edge of the bottom row on the input side.
  // Highlighting is always from the top left, both in LTR and RTL.
  if (this.RTL_) {
    this.steps_.push('V', height - this.highlightOffset_);
  } else {
    var cornerElem = this.info_.bottomRow.elements[0];
    if (cornerElem.type == 'square corner left') {
      this.steps_.push(
          Blockly.utils.svgPaths.moveTo(
              row.xPos + this.highlightOffset_,
              height - this.highlightOffset_));
    } else if (cornerElem.type == 'round corner left') {
      this.steps_.push(Blockly.utils.svgPaths.moveTo(row.xPos, height));
      this.steps_.push(this.outsideCornerPaths_.bottomLeft());
    }
  }
};

Blockly.geras.Highlighter.prototype.drawLeft = function() {
  var outputConnection = this.info_.outputConnection;
  if (outputConnection) {
    var tabBottom =
        outputConnection.connectionOffsetY + outputConnection.height;
    // Draw a line up to the bottom of the tab.
    if (this.RTL_) {
      this.steps_.push(Blockly.utils.svgPaths.moveTo(this.info_.startX, tabBottom));
    } else {
      var left = this.info_.startX + this.highlightOffset_;
      var bottom = this.info_.height - this.highlightOffset_;
      this.steps_.push(Blockly.utils.svgPaths.moveTo(left, bottom));
      this.steps_.push('V', tabBottom);
    }
    this.steps_.push(this.puzzleTabPaths_.pathUp(this.RTL_));
  }

  if (!this.RTL_) {
    var topRow = this.info_.topRow;
    if (topRow.elements[0].isRoundedCorner()) {
      this.steps_.push('V', this.outsideCornerPaths_.height);
    } else {
      this.steps_.push('V', topRow.startY + this.highlightOffset_);
    }
  }
};

Blockly.geras.Highlighter.prototype.drawInlineInput = function(input) {
  var offset = this.highlightOffset_;

  // Relative to the block's left.
  var connectionRight = input.xPos + input.connectionWidth;
  var yPos = input.centerline - input.height / 2;
  var bottomHighlightWidth = input.width - input.connectionWidth;
  var startY = yPos + offset;

  if (this.RTL_) {
    // TODO: Check if this is different when the inline input is populated.
    var aboveTabHeight = input.connectionOffsetY - offset;
    var belowTabHeight = input.height -
        (input.connectionOffsetY + input.connectionHeight) + offset;

    var startX = connectionRight - offset;

    var steps = Blockly.utils.svgPaths.moveTo(startX, startY) +
        // Right edge above tab.
        Blockly.utils.svgPaths.lineOnAxis('v', aboveTabHeight) +
        // Back of tab.
        this.puzzleTabPaths_.pathDown(this.RTL_) +
        // Right edge below tab.
        Blockly.utils.svgPaths.lineOnAxis('v', belowTabHeight) +
        // Bottom.
        Blockly.utils.svgPaths.lineOnAxis('h', bottomHighlightWidth);

    this.inlineSteps_.push(steps);

  } else {

    var steps =
        // Go to top right corner.
        Blockly.utils.svgPaths.moveTo(input.xPos + input.width + offset, startY) +
        // Highlight right edge, bottom.
        Blockly.utils.svgPaths.lineOnAxis('v', input.height) +
        Blockly.utils.svgPaths.lineOnAxis('h', -bottomHighlightWidth) +
        // Go to top of tab.
        Blockly.utils.svgPaths.moveTo(connectionRight, yPos + input.connectionOffsetY) +
        // Short highlight glint at bottom of tab.
        this.puzzleTabPaths_.pathDown(this.RTL_);

    this.inlineSteps_.push(steps);
  }
};

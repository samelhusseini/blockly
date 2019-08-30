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
 * @fileoverview Methods for graphically rendering a block as SVG.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.blockRendering.RenderInfo');

goog.require('Blockly.blockRendering.Measurable');
goog.require('Blockly.blockRendering.BottomRow');
goog.require('Blockly.blockRendering.InputRow');
goog.require('Blockly.blockRendering.Row');
goog.require('Blockly.blockRendering.SpacerRow');
goog.require('Blockly.blockRendering.TopRow');

goog.require('Blockly.blockRendering.InlineInput');
goog.require('Blockly.blockRendering.ExternalValueInput');
goog.require('Blockly.blockRendering.StatementInput');

goog.require('Blockly.blockRendering.PreviousConnection');
goog.require('Blockly.blockRendering.NextConnection');
goog.require('Blockly.blockRendering.OutputConnection');

goog.require('Blockly.RenderedConnection');

/**
 * An object containing all sizing information needed to draw this block.
 *
 * This measure pass does not propagate changes to the block (although fields
 * may choose to rerender when getSize() is called).  However, calling it
 * repeatedly may be expensive.
 *
 * @param {!Blockly.BlockSvg} block The block to measure.
 * @constructor
 * @package
 */
Blockly.blockRendering.RenderInfo = function(block) {
  this.block_ = block;

  /**
   * A measurable representing the output connection if the block has one.
   * Otherwise null.
   * @type {Blockly.blockRendering.OutputConnection}
   */
  this.outputConnection = !block.outputConnection ? null :
      new Blockly.blockRendering.OutputConnection(
          /** @type {Blockly.RenderedConnection} */(block.outputConnection));

  /**
   * Whether the block should be rendered as a single line, either because it's
   * inline or because it has been collapsed.
   * @type {boolean}
   */
  this.isInline = block.getInputsInline() && !block.isCollapsed();

  /**
   * Whether the block is collapsed.
   * @type {boolean}
   */
  this.isCollapsed = block.isCollapsed();

  /**
   * Whether the block is an insertion marker.  Insertion markers are the same
   * shape as normal blocks, but don't show fields.
   * @type {boolean}
   */
  this.isInsertionMarker = block.isInsertionMarker();

  /**
   * True if the block should be rendered right-to-left.
   * @type {boolean}
   */
  this.RTL = block.RTL;

  /**
   * The height of the rendered block, including child blocks.
   * @type {number}
   */
  this.height = 0;

  /**
   * The width of the rendered block, including child blocks.
   * @type {number}
   */
  this.widthWithChildren = 0;

  /**
   * The width of the rendered block, excluding child blocks.  This is the right
   * edge of the block when rendered LTR.
   * @type {number}
   */
  this.width = 0;

  /**
   *
   * @type {number}
   */
  this.statementEdge = 0;

  /**
   * An array of Row objects containing sizing information.
   * @type {!Array.<!Blockly.blockRendering.Row>}
   */
  this.rows = [];

  /**
   * An array of measurable objects containing hidden icons.
   * @type {!Array.<!Blockly.blockRendering.Icon>}
   */
  this.hiddenIcons = [];

  /**
   * An object with rendering information about the top row of the block.
   * @type {!Blockly.blockRendering.TopRow}
   */
  this.topRow = new Blockly.blockRendering.TopRow();

  /**
   * An object with rendering information about the bottom row of the block.
   * @type {!Blockly.blockRendering.BottomRow}
   */
  this.bottomRow = new Blockly.blockRendering.BottomRow();

  // The position of the start point for drawing, relative to the block's
  // location.
  this.startX = 0;
  this.startY = 0;

  this.constants_ = Blockly.blockRendering.getConstants();
};

/**
 * Populate and return an object containing all sizing information needed to
 * draw this block.
 *
 * This measure pass does not propagate changes to the block (although fields
 * may choose to rerender when getSize() is called).  However, calling it
 * repeatedly may be expensive.
 *
 * @package
 */
Blockly.blockRendering.RenderInfo.prototype.measure = function() {
  this.createRows_();
  this.addElemSpacing_();
  this.computeBounds_();
  this.alignRowElements_();
  this.addRowSpacing_();
  this.finalize_();
};

/**
 * Create rows of Measurable objects representing all renderable parts of the
 * block.
 * @protected
 */
Blockly.blockRendering.RenderInfo.prototype.createRows_ = function() {
  this.topRow.populate(this.block_);
  this.rows.push(this.topRow);
  var activeRow = new Blockly.blockRendering.InputRow();

  // Icons always go on the first row, before anything else.
  var icons = this.block_.getIcons();
  if (icons.length) {
    for (var i = 0, icon; (icon = icons[i]); i++) {
      var iconInfo = new Blockly.blockRendering.Icon(icon);
      if (this.isCollapsed && icon.collapseHidden) {
        this.hiddenIcons.push(iconInfo);
      } else {
        activeRow.elements.push(iconInfo);
      }
    }
  }

  var lastInput = undefined;
  // Loop across all of the inputs on the block, creating objects for anything
  // that needs to be rendered and breaking the block up into visual rows.
  for (var i = 0, input; (input = this.block_.inputList[i]); i++) {
    if (!input.isVisible()) {
      continue;
    }
    if (this.shouldStartNewRow_(input, lastInput)) {
      // Finish this row and create a new one.
      this.rows.push(activeRow);
      activeRow = new Blockly.blockRendering.InputRow();
    }

    // All of the fields in an input go on the same row.
    for (var j = 0, field; (field = input.fieldRow[j]); j++) {
      activeRow.elements.push(new Blockly.blockRendering.Field(field, input));
    }
    this.addInput_(input, activeRow);
    lastInput = input;
  }

  if (this.isCollapsed) {
    activeRow.hasJaggedEdge = true;
    activeRow.elements.push(new Blockly.blockRendering.JaggedEdge());
  }

  if (activeRow.elements.length) {
    this.rows.push(activeRow);
  }
  this.bottomRow.populate(this.block_);
  this.rows.push(this.bottomRow);
};

/**
 * Add an input element to the active row, if needed, and record the type of the
 * input on the row.
 * @param {!Blockly.Input} input The input to record information about.
 * @param {!Blockly.blockRendering.Row} activeRow The row that is currently being
 *     populated.
 * @protected
 */
Blockly.blockRendering.RenderInfo.prototype.addInput_ = function(input, activeRow) {
  // Non-dummy inputs have visual representations onscreen.
  if (this.isInline && input.type == Blockly.INPUT_VALUE) {
    activeRow.elements.push(new Blockly.blockRendering.InlineInput(input));
    activeRow.hasInlineInput = true;
  } else if (input.type == Blockly.NEXT_STATEMENT) {
    activeRow.elements.push(new Blockly.blockRendering.StatementInput(input));
    activeRow.hasStatement = true;
  } else if (input.type == Blockly.INPUT_VALUE) {
    activeRow.elements.push(new Blockly.blockRendering.ExternalValueInput(input));
    activeRow.hasExternalInput = true;
  } else if (input.type == Blockly.DUMMY_INPUT) {
    // Dummy inputs have no visual representation, but the information is still
    // important.
    activeRow.hasDummyInput = true;
  }
};

/**
 * Decide whether to start a new row between the two Blockly.Inputs.
 * @param {!Blockly.Input}  input The first input to consider
 * @param {Blockly.Input}  lastInput The input that follows.
 * @return {boolean} True if the next input should be rendered on a new row.
 * @protected
 */
Blockly.blockRendering.RenderInfo.prototype.shouldStartNewRow_ = function(input, lastInput) {
  // If this is the first input, just add to the existing row.
  // That row is either empty or has some icons in it.
  if (!lastInput) {
    return false;
  }
  // A statement input always gets a new row.
  if (input.type == Blockly.NEXT_STATEMENT) {
    return true;
  }
  // Value and dummy inputs get new row if inputs are not inlined.
  if (input.type == Blockly.INPUT_VALUE || input.type == Blockly.DUMMY_INPUT) {
    return !this.isInline;
  }
  return false;
};

/**
 * Add horizontal spacing between and around elements within each row.
 * @protected
 */
Blockly.blockRendering.RenderInfo.prototype.addElemSpacing_ = function() {
  for (var i = 0, row; (row = this.rows[i]); i++) {
    var oldElems = row.elements;
    row.elements = [];
    // No spacing needed before the corner on the top row or the bottom row.
    if (row.type != 'top row' && row.type != 'bottom row') {
      // There's a spacer before the first element in the row.
      row.elements.push(new Blockly.blockRendering.InRowSpacer(
          this.getInRowSpacing_(null, oldElems[0])));
    }
    for (var e = 0; e < oldElems.length; e++) {
      row.elements.push(oldElems[e]);
      var spacing = this.getInRowSpacing_(oldElems[e], oldElems[e + 1]);
      row.elements.push(new Blockly.blockRendering.InRowSpacer(spacing));
    }
  }
};

/**
 * Calculate the width of a spacer element in a row based on the previous and
 * next elements in that row.  For instance, extra padding is added between two
 * editable fields.
 * @param {Blockly.blockRendering.Measurable} prev The element before the
 *     spacer.
 * @param {Blockly.blockRendering.Measurable} next The element after the spacer.
 * @return {number} The size of the spacing between the two elements.
 * @protected
 */
Blockly.blockRendering.RenderInfo.prototype.getInRowSpacing_ = function(prev, next) {
  // Between inputs and the end of the row.
  if (prev && prev.isInput && !next) {
    if (prev.isExternalInput()) {
      return this.constants_.NO_PADDING;
    } else if (prev.isInlineInput()) {
      return this.constants_.LARGE_PADDING;
    } else if (prev.isStatementInput()) {
      return this.constants_.NO_PADDING;
    }
  }
  return this.constants_.MEDIUM_PADDING;
};

/**
 * Figure out where the right edge of the block and right edge of statement inputs
 * should be placed.
 * TODO: More cleanup.
 * @protected
 */
Blockly.blockRendering.RenderInfo.prototype.computeBounds_ = function() {
  var widestStatementRowFields = 0;
  var blockWidth = 0;
  var widestRowWithConnectedBlocks = 0;
  for (var i = 0, row; (row = this.rows[i]); i++) {
    row.measure();
    blockWidth = Math.max(blockWidth, row.width);
    if (row.hasStatement) {
      var statementInput = row.getLastInput();
      var innerWidth = row.width - statementInput.width;
      widestStatementRowFields = Math.max(widestStatementRowFields, innerWidth);
    }
    widestRowWithConnectedBlocks =
        Math.max(widestRowWithConnectedBlocks, row.widthWithConnectedBlocks);
  }


  this.statementEdge = widestStatementRowFields;

  this.width = blockWidth;

  for (var i = 0, row; (row = this.rows[i]); i++) {
    if (row.hasStatement) {
      row.statementEdge = this.statementEdge;
    }
  }

  this.widthWithChildren = Math.max(blockWidth, widestRowWithConnectedBlocks);

  if (this.outputConnection) {
    this.startX = this.outputConnection.width;
    this.width += this.outputConnection.width;
    this.widthWithChildren += this.outputConnection.width;
  }
};

/**
 * Extra spacing may be necessary to make sure that the right sides of all
 * rows line up.  This can only be calculated after a first pass to calculate
 * the sizes of all rows.
 * @protected
 */
Blockly.blockRendering.RenderInfo.prototype.alignRowElements_ = function() {
  for (var i = 0, row; (row = this.rows[i]); i++) {
    // TODO (#2921): this still doesn't handle the row having an inline input.
    if (!row.hasInlineInput) {
      if (row.hasStatement) {
        var statementInput = row.getLastInput();
        var currentWidth = row.width - statementInput.width;
        var desiredWidth = this.statementEdge - this.startX;
      } else {
        var currentWidth = row.width;
        var desiredWidth = this.width - this.startX;
      }
      var missingSpace = desiredWidth - currentWidth;
      if (missingSpace) {
        console.log(row.elements);
        this.addAlignmentPadding_(row, missingSpace);
      }
    }
  }
};

/**
 * Modify the given row to add the given amount of padding around its fields.
 * The exact location of the padding is based on the alignment property of the
 * last input in the field.
 * @param {Blockly.blockRendering.Row} row The row to add padding to.
 * @param {number} missingSpace How much padding to add.
 * @protected
 */
Blockly.blockRendering.RenderInfo.prototype.addAlignmentPadding_ = function(row,
    missingSpace) {
  var lastSpacer = row.getLastSpacer();
  if (lastSpacer) {
    lastSpacer.width += missingSpace;
    row.width += missingSpace;
  }
};

/**
 * Add spacers between rows and set their sizes.
 * @protected
 */
Blockly.blockRendering.RenderInfo.prototype.addRowSpacing_ = function() {
  var oldRows = this.rows;
  this.rows = [];

  for (var r = 0; r < oldRows.length; r++) {
    this.rows.push(oldRows[r]);
    if (r != oldRows.length - 1) {
      this.rows.push(this.makeSpacerRow_(oldRows[r], oldRows[r + 1]));
    }
  }
};

/**
 * Create a spacer row to go between prev and next, and set its size.
 * @param {?Blockly.blockRendering.Row} prev The previous row, or null.
 * @param {?Blockly.blockRendering.Row} next The next row, or null.
 * @return {!Blockly.blockRendering.SpacerRow} The newly created spacer row.
 * @protected
 */
Blockly.blockRendering.RenderInfo.prototype.makeSpacerRow_ = function(prev, next) {
  var height = this.getSpacerRowHeight_(prev, next);
  var width = this.getSpacerRowWidth_(prev, next);
  var spacer = new Blockly.blockRendering.SpacerRow(height, width);
  if (prev.hasStatement) {
    spacer.followsStatement = true;
  }
  return spacer;
};

/**
 * Calculate the width of a spacer row.
 * @param {Blockly.blockRendering.Row} _prev The row before the spacer.
 * @param {Blockly.blockRendering.Row} _next The row after the spacer.
 * @return {number} The desired width of the spacer row between these two rows.
 * @protected
 */
Blockly.blockRendering.RenderInfo.prototype.getSpacerRowWidth_ = function(
    _prev, _next) {
  return this.width - this.startX;
};

/**
 * Calculate the height of a spacer row.
 * @param {Blockly.blockRendering.Row} _prev The row before the spacer.
 * @param {Blockly.blockRendering.Row} _next The row after the spacer.
 * @return {number} The desired height of the spacer row between these two rows.
 * @protected
 */
Blockly.blockRendering.RenderInfo.prototype.getSpacerRowHeight_ = function(
    _prev, _next) {
  return this.constants_.MEDIUM_PADDING;
};

/**
 * Calculate the centerline of an element in a rendered row.
 * @param {Blockly.blockRendering.Row} row The row containing the element.
 * @param {Blockly.blockRendering.Measurable} _elem The element to place.
 * @return {number} The desired centerline of the given element, as an offset
 *     from the top left of the block.
 * @protected
 */
Blockly.blockRendering.RenderInfo.prototype.getElemCenterline_ = function(row,
    _elem) {
  return row.yPos + row.height / 2;
};

/**
 * Make any final changes to the rendering information object.  In particular,
 * store the y position of each row, and record the height of the full block.
 * @protected
 */
Blockly.blockRendering.RenderInfo.prototype.finalize_ = function() {
  // Performance note: this could be combined with the draw pass, if the time
  // that this takes is excessive.  But it shouldn't be, because it only
  // accesses and sets properties that already exist on the objects.
  var widestRowWithConnectedBlocks = 0;
  var yCursor = 0;
  for (var i = 0, row; (row = this.rows[i]); i++) {
    row.yPos = yCursor;
    row.xPos = this.startX;
    yCursor += row.height;

    widestRowWithConnectedBlocks =
        Math.max(widestRowWithConnectedBlocks, row.widthWithConnectedBlocks);
    var xCursor = row.xPos;
    for (var j = 0, elem; (elem = row.elements[j]); j++) {
      elem.xPos = xCursor;
      elem.centerline = this.getElemCenterline_(row, elem);
      xCursor += elem.width;
    }
  }

  this.widthWithChildren = widestRowWithConnectedBlocks + this.startX;

  this.height = yCursor;
  this.startY = this.topRow.startY;
};

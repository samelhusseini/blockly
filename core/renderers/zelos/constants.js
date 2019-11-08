/**
 * @license
 * Copyright 2019 Google LLC
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
 * @fileoverview An object that provides constants for rendering blocks in Zelos
 * mode.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.zelos.ConstantProvider');

goog.require('Blockly.blockRendering.ConstantProvider');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.svgPaths');


/**
 * An object that provides constants for rendering blocks in Zelos mode.
 * @constructor
 * @package
 * @extends {Blockly.blockRendering.ConstantProvider}
 */
Blockly.zelos.ConstantProvider = function() {
  Blockly.zelos.ConstantProvider.superClass_.constructor.call(this);

  this.GRID_UNIT = 4;

  /**
   * @override
   */
  this.CORNER_RADIUS = 1 * this.GRID_UNIT;

  /**
   * @override
   */
  this.NOTCH_WIDTH = 9 * this.GRID_UNIT;

  /**
   * @override
   */
  this.NOTCH_HEIGHT = 2 * this.GRID_UNIT;

  /**
   * @override
   */
  this.NOTCH_OFFSET_LEFT = 3 * this.GRID_UNIT;

  /**
   * @override
   */
  this.MIN_BLOCK_HEIGHT = 12 * this.GRID_UNIT;

  /**
   * @override
   */
  this.TAB_OFFSET_FROM_TOP = 0;

  /**
   * @override
   */
  this.STATEMENT_BOTTOM_SPACER = -this.NOTCH_HEIGHT;

  /**
   * @override
   */
  this.AFTER_STATEMENT_BOTTOM_ROW_MIN_HEIGHT = this.LARGE_PADDING * 2;

  /**
   * @override
   */
  this.EMPTY_INLINE_INPUT_PADDING = 4 * this.GRID_UNIT;

  /**
   * @override
   */
  this.EMPTY_INLINE_INPUT_HEIGHT = 8 * this.GRID_UNIT;

  /**
   * @override
   */
  this.FIELD_BORDER_RECT_RADIUS = this.CORNER_RADIUS;

  this.FIELD_BASELINE_CENTER = true;

  this.FIELD_DROPDOWN_SVG_ARROW = true;

  this.FIELD_X_PADDING = 16;

  this.FIELD_DROPDOWN_HEIGHT = 8 * this.GRID_UNIT;

  this.FIELD_DEFAULT_TEXT_OFFSET = 2 * this.GRID_UNIT;

  /**
   * The ID of the highlight glow filter, or the empty string if no filter is
   * set.
   * @type {string}
   * @package
   */
  this.highlightGlowFilterId = '';

  /**
   * The <filter> element to use for a higlight glow, or null if not set.
   * @type {SVGElement}
   * @private
   */
  this.highlightGlowFilter_ = null;
};
Blockly.utils.object.inherits(Blockly.zelos.ConstantProvider,
    Blockly.blockRendering.ConstantProvider);

/**
 * @override
 */
Blockly.zelos.ConstantProvider.prototype.init = function() {
  Blockly.zelos.ConstantProvider.superClass_.init.call(this);
  this.HEXAGONAL = this.makeHexagonal();
  this.ROUNDED = this.makeRounded();
};

/**
 * @override
 */
Blockly.zelos.ConstantProvider.prototype.dispose = function() {
  Blockly.zelos.ConstantProvider.superClass_.dispose.call(this);
  if (this.highlightGlowFilter_) {
    Blockly.utils.dom.removeNode(this.highlightGlowFilter_);
  }
};

/**
 * @return {!Object} An object containing sizing and path information about
 *     a hexagonal shape for connections.
 * @package
 */
Blockly.zelos.ConstantProvider.prototype.makeHexagonal = function() {
  // The 'up' and 'down' versions of the paths are the same, but the Y sign
  // flips.  Forward and back are the signs to use to move the cursor in the
  // direction that the path is being drawn.
  function makeMainPath(height, up, right) {
    var width = height / 2;
    var forward = up ? -1 : 1;
    var direction = right ? -1 : 1;
    var dy = forward * height / 2;
    return Blockly.utils.svgPaths.lineTo(-direction * width, dy) +
        Blockly.utils.svgPaths.lineTo(direction * width, dy);
  }

  return {
    isDynamic: true,
    width: function(height) {
      return height / 2;
    },
    height: function(height) {
      return height;
    },
    pathDown: function(height) {
      return makeMainPath(height, false, false);
    },
    pathUp: function(height) {
      return makeMainPath(height, true, false);
    },
    pathRightDown: function(height) {
      return makeMainPath(height, false, true);
    },
    pathRightUp: function(height) {
      return makeMainPath(height, false, true);
    },
  };
};

/**
 * @return {!Object} An object containing sizing and path information about
 *     a rounded shape for connections.
 * @package
 */
Blockly.zelos.ConstantProvider.prototype.makeRounded = function() {
  // The 'up' and 'down' versions of the paths are the same, but the Y sign
  // flips.  Forward and back are the signs to use to move the cursor in the
  // direction that the path is being drawn.
  function makeMainPath(height, up, right) {
    var edgeWidth = height / 2;
    return Blockly.utils.svgPaths.arc('a', '0 0 ' + (up || right ? 1 : 0), edgeWidth,
        Blockly.utils.svgPaths.point(0, (up ? -1 : 1) * edgeWidth * 2));
  }

  return {
    isDynamic: true,
    width: function(height) {
      return height / 2;
    },
    height: function(height) {
      return height;
    },
    pathDown: function(height) {
      return makeMainPath(height, false, false);
    },
    pathUp: function(height) {
      return makeMainPath(height, true, false);
    },
    pathRightDown: function(height) {
      return makeMainPath(height, false, true);
    },
    pathRightUp: function(height) {
      return makeMainPath(height, false, true);
    },
  };
};

/**
 * @override
 */
Blockly.zelos.ConstantProvider.prototype.shapeFor = function(
    connection) {
  var checks = connection.getCheck();
  switch (connection.type) {
    case Blockly.INPUT_VALUE:
    case Blockly.OUTPUT_VALUE:
      // Includes doesn't work in IE.
      if (checks && checks.indexOf('Boolean') != -1) {
        return this.HEXAGONAL;
      }
      if (checks && checks.indexOf('Number') != -1) {
        return this.ROUNDED;
      }
      if (checks && checks.indexOf('String') != -1) {
        return this.ROUNDED;
      }
      return this.ROUNDED;
    case Blockly.PREVIOUS_STATEMENT:
    case Blockly.NEXT_STATEMENT:
      return this.NOTCH;
    default:
      throw Error('Unknown type');
  }
};

/**
 * @override
 */
Blockly.zelos.ConstantProvider.prototype.makeNotch = function() {
  var width = this.NOTCH_WIDTH;
  var height = this.NOTCH_HEIGHT;

  var innerWidth = width / 3;
  var curveWidth = innerWidth / 3;

  var halfHeight = height / 2;
  var quarterHeight = halfHeight / 2;

  function makeMainPath(dir) {
    return (
      Blockly.utils.svgPaths.curve('c', [
        Blockly.utils.svgPaths.point(dir * curveWidth / 2,
            0),
        Blockly.utils.svgPaths.point(dir * curveWidth * 3 / 4,
            quarterHeight / 2),
        Blockly.utils.svgPaths.point(dir * curveWidth,
            quarterHeight)
      ]) +
      Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(dir * curveWidth,
            halfHeight)
      ]) +
      Blockly.utils.svgPaths.curve('c', [
        Blockly.utils.svgPaths.point(dir * curveWidth / 4,
            quarterHeight / 2),
        Blockly.utils.svgPaths.point(dir * curveWidth / 2,
            quarterHeight),
        Blockly.utils.svgPaths.point(dir * curveWidth,
            quarterHeight)
      ]) +
      Blockly.utils.svgPaths.lineOnAxis('h', dir * innerWidth) +
      Blockly.utils.svgPaths.curve('c', [
        Blockly.utils.svgPaths.point(dir * curveWidth / 2,
            0),
        Blockly.utils.svgPaths.point(dir * curveWidth * 3 / 4,
            -(quarterHeight / 2)),
        Blockly.utils.svgPaths.point(dir * curveWidth,
            -quarterHeight)
      ]) +
      Blockly.utils.svgPaths.line([
        Blockly.utils.svgPaths.point(dir * curveWidth,
            -halfHeight)
      ]) +
      Blockly.utils.svgPaths.curve('c', [
        Blockly.utils.svgPaths.point(dir * curveWidth / 4,
            -(quarterHeight / 2)),
        Blockly.utils.svgPaths.point(dir * curveWidth / 2,
            -quarterHeight),
        Blockly.utils.svgPaths.point(dir * curveWidth,
            -quarterHeight)
      ])
    );
  }

  var pathLeft = makeMainPath(1);
  var pathRight = makeMainPath(-1);

  return {
    width: width,
    height: height,
    pathLeft: pathLeft,
    pathRight: pathRight
  };
};

/**
 * @override
 */
Blockly.zelos.ConstantProvider.prototype.makeInsideCorners = function() {
  var radius = this.CORNER_RADIUS;

  var innerTopLeftCorner = Blockly.utils.svgPaths.arc('a', '0 0,0', radius,
      Blockly.utils.svgPaths.point(-radius, radius));

  var innerTopRightCorner = Blockly.utils.svgPaths.arc('a', '0 0,1', radius,
      Blockly.utils.svgPaths.point(-radius, radius));

  var innerBottomLeftCorner = Blockly.utils.svgPaths.arc('a', '0 0,0', radius,
      Blockly.utils.svgPaths.point(radius, radius));

  var innerBottomRightCorner = Blockly.utils.svgPaths.arc('a', '0 0,1', radius,
      Blockly.utils.svgPaths.point(radius, radius));

  return {
    width: radius,
    height: radius,
    pathTop: innerTopLeftCorner,
    pathBottom: innerBottomLeftCorner,
    rightWidth: radius,
    rightHeight: radius,
    pathTopRight: innerTopRightCorner,
    pathBottomRight: innerBottomRightCorner
  };
};

/**
 * @override
 */
Blockly.zelos.ConstantProvider.prototype.createDom = function(svg) {
  Blockly.zelos.ConstantProvider.superClass_.createDom.call(this, svg);
  /*
  <defs>
    ... filters go here ...
  </defs>
  */
  var defs = Blockly.utils.dom.createSvgElement('defs', {}, svg);
  // Each filter/pattern needs a unique ID for the case of multiple Blockly
  // instances on a page.  Browser behaviour becomes undefined otherwise.
  // https://neil.fraser.name/news/2015/11/01/
  var rnd = String(Math.random()).substring(2);
  // Using a dilate distorts the block shape.
  // Instead use a gaussian blur, and then set all alpha to 1 with a transfer.
  var highlightGlowFilter = Blockly.utils.dom.createSvgElement('filter',
      {
        'id': 'blocklyHighlightGlowFilter' + rnd,
        'height': '160%',
        'width': '180%',
        y: '-30%',
        x: '-40%'
      },
      defs);
  Blockly.utils.dom.createSvgElement('feGaussianBlur',
      {
        'in': 'SourceGraphic',
        'stdDeviation': 0.5  // TODO: configure size in theme.
      },
      highlightGlowFilter);
  // Set all gaussian blur pixels to 1 opacity before applying flood
  var componentTransfer = Blockly.utils.dom.createSvgElement(
      'feComponentTransfer', {'result': 'outBlur'}, highlightGlowFilter);
  Blockly.utils.dom.createSvgElement('feFuncA',
      {
        'type': 'table', 'tableValues': '0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1'
      },
      componentTransfer);
  // Color the highlight
  Blockly.utils.dom.createSvgElement('feFlood',
      {
        'flood-color': '#FFF200', // TODO: configure colour in theme.
        'flood-opacity': 1,
        'result': 'outColor'
      },
      highlightGlowFilter);
  Blockly.utils.dom.createSvgElement('feComposite',
      {
        'in': 'outColor', 'in2': 'outBlur',
        'operator': 'in', 'result': 'outGlow'
      },
      highlightGlowFilter);
  this.highlightGlowFilterId = highlightGlowFilter.id;
  this.highlightGlowFilter_ = highlightGlowFilter;
};
